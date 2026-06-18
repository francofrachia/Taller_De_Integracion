const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Producto = require('../models/productoModel');
const Reserva = require('../models/reservaModel');
const pool = require('../config/db');
const crypto = require('crypto');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const createPreference = async (req, res) => {
    const dbClient = await pool.connect();
    const sseController = require('../utils/sseController');
    const tempRef = crypto.randomUUID();
    let reservationsCreated = false;

    try {
        const id_usuario = req.usuario.id_usuario;
        const { cartItems, isDirectPurchase } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            dbClient.release();
            return res.status(400).json({ error: 'Faltan datos obligatorios (cartItems vacío)' });
        }

        const itemsPreference = [];
        const metadataItems = [];
        
        await dbClient.query('BEGIN');

        // Eliminar reservas previas del usuario para los productos actuales
        // Esto evita acumular reservas si el usuario va atrás y vuelve a checkout
        const productIds = cartItems.map(item => item.id_producto);
        if (productIds.length > 0) {
            await dbClient.query(
                'DELETE FROM reserva_stock WHERE id_usuario = $1 AND id_producto = ANY($2::int[])',
                [id_usuario, productIds]
            );
        }

        // Validar stock de todos los productos y reservarlos
        for (const item of cartItems) {
            // Validar existencia y estado
            const producto = await Producto.getById(item.id_producto);
            if (!producto) {
                throw new Error(`Producto ${item.id_producto} no encontrado`);
            }
            if (producto.activo === false) {
                throw new Error(`El producto ${producto.nombre} ha sido discontinuado y ya no está disponible.`);
            }

            // Lock the row to prevent concurrent modifications during validation
            const { rows: stockRows } = await dbClient.query('SELECT stock FROM producto WHERE id_producto = $1 FOR UPDATE', [item.id_producto]);
            const stockFisico = stockRows[0].stock;
            
            const { rows: resRows } = await dbClient.query('SELECT COALESCE(SUM(cantidad), 0) as reservado FROM reserva_stock WHERE id_producto = $1 AND fecha_expiracion > NOW()', [item.id_producto]);
            const stockReservado = parseInt(resRows[0].reservado, 10);
            
            const stockDisponible = stockFisico - stockReservado;

            if (stockDisponible < item.cantidad) {
                throw new Error(`No hay suficiente stock para ${producto.nombre}`);
            }

            // Crear reserva temporal por 10 minutos
            await dbClient.query(
                `INSERT INTO reserva_stock (id_usuario, id_producto, cantidad, fecha_expiracion, mp_preference_id) VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes', $4)`,
                [id_usuario, item.id_producto, item.cantidad, tempRef]
            );

            const originalPrice = parseFloat(producto.precio) || 0;
            const discountPct = producto.descuento ? parseFloat(producto.descuento) : null;
            const finalPrice = discountPct ? parseFloat((originalPrice * (1 - discountPct / 100)).toFixed(2)) : originalPrice;

            itemsPreference.push({
                id: String(producto.id_producto),
                title: producto.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(finalPrice),
                currency_id: 'ARS',
                picture_url: producto.imagenes && producto.imagenes[0] ? producto.imagenes[0] : ''
            });

            metadataItems.push({
                product_id: producto.id_producto,
                quantity: Number(item.cantidad),
                price: Number(finalPrice)
            });
        }

        await dbClient.query('COMMIT');
        reservationsCreated = true;
        
        // Emitir evento SSE para que los demás clientes vean que el stock bajó (reservado)
        for (const item of cartItems) {
            sseController.broadcastStockUpdate(item.id_producto);
        }

        const preference = new Preference(client);
        
        // Obtener el webhook de ngrok configurado
        const webhookUrl = process.env.MP_WEBHOOK_URL;
        
        let backendBaseUrl = `http://localhost:${process.env.PORT || 3000}`;
        let useRedirectProxy = false;
        
        if (webhookUrl) {
            const match = webhookUrl.match(/^(https:\/\/[^/]+)/);
            if (match) {
                backendBaseUrl = match[1];
                useRedirectProxy = true;
            }
        }

        let successUrl, failureUrl, pendingUrl;
        
        if (useRedirectProxy) {
            successUrl = `${backendBaseUrl}/api/mercadopago/success-redirect`;
            failureUrl = `${backendBaseUrl}/api/mercadopago/failure-redirect`;
            pendingUrl = `${backendBaseUrl}/api/mercadopago/pending-redirect`;
        } else {
            const origin = req.get('origin') || req.get('referer');
            let baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            if (origin) {
                baseUrl = origin.replace(/\/$/, '');
            }
            successUrl = `${baseUrl}/payment-success`;
            failureUrl = `${baseUrl}/payment-failure`;
            pendingUrl = `${baseUrl}/payment-pending`;
        }
        
        if (isDirectPurchase) {
            successUrl += successUrl.includes('?') ? '&direct_purchase=true' : '?direct_purchase=true';
        }

        const preferenceData = {
            body: {
                items: itemsPreference,
                back_urls: {
                    success: successUrl,
                    failure: failureUrl,
                    pending: pendingUrl
                },
                metadata: {
                    cart: JSON.stringify(metadataItems),
                    id_usuario: id_usuario,
                    is_direct_purchase: !!isDirectPurchase,
                    temp_ref: tempRef // Guardamos el tempRef para saber qué reserva es
                }
            }
        };

        const requiresHttps = successUrl.startsWith('https://');
        if (requiresHttps) {
            preferenceData.body.auto_return = 'approved';
        }

        if (webhookUrl) {
            preferenceData.body.notification_url = webhookUrl;
        }

        const response = await preference.create(preferenceData);
        
        // Actualizamos la reserva temporal con el ID de preferencia real de MercadoPago
        await pool.query(`UPDATE reserva_stock SET mp_preference_id = $1 WHERE mp_preference_id = $2`, [response.id, tempRef]);

        res.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });

    } catch (error) {
        await dbClient.query('ROLLBACK');
        
        // Si hubo error en MP pero se habían creado reservas, borrarlas
        if (reservationsCreated) {
            await pool.query(`DELETE FROM reserva_stock WHERE mp_preference_id = $1`, [tempRef]);
            const sseController = require('../utils/sseController');
            // Notificamos para que el stock vuelva a subir
            req.body.cartItems?.forEach(item => sseController.broadcastStockUpdate(item.id_producto));
        }

        console.error('Error al crear la preferencia de pago:', error);
        res.status(400).json({ error: 'Error al crear la preferencia', details: error.message });
    } finally {
        dbClient.release();
    }
};

const receiveWebhook = async (req, res) => {
    const sseController = require('../utils/sseController');
    try {
        console.log('Webhook de Mercado Pago recibido:', req.query, req.body);
        
        // Bug Fix: MP envía 'topic' en lugar de 'type' en Webhooks v1
        const type = req.body.type || req.query.type || req.query.topic;
        const paymentId = req.body.data?.id || req.query['data.id'] || req.body['data.id'] || req.query.id;

        if (type === 'payment' && paymentId) {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });
            
            console.log(`Detalles del pago ${paymentId}: Estado = ${paymentData.status}`);

            if (paymentData.status === 'approved') {
                const cartMetadataStr = paymentData.metadata.cart;
                const idUsuario = paymentData.metadata.id_usuario;
                const isDirectPurchase = paymentData.metadata.is_direct_purchase === 'true' || paymentData.metadata.is_direct_purchase === true;

                // Verificar si ya registramos una compra con este id_pago_mp (idempotencia)
                const { rows: existingCompra } = await pool.query(
                    'SELECT id_compra FROM compra WHERE id_pago_mp = $1',
                    [String(paymentId)]
                );
                if (existingCompra.length > 0) {
                    console.log(`Pago ${paymentId} ya procesado anteriormente (Compra ID ${existingCompra[0].id_compra}). Ignorando webhook duplicado.`);
                    return res.sendStatus(200);
                }

                // 1. Vaciar el carrito en la base de datos solo si no es compra directa
                if (idUsuario && !isDirectPurchase) {
                    try {
                        const Carrito = require('../models/carritoModel');
                        const carrito = await Carrito.getOrCreateByUserId(idUsuario);
                        await Carrito.clearCart(carrito.id_carrito);
                        console.log(`Pago aprobado: Carrito vaciado para el usuario ${idUsuario}`);
                    } catch (err) {
                        console.error('Error al vaciar el carrito en el webhook:', err);
                    }
                } else if (isDirectPurchase) {
                    console.log(`Pago aprobado: Compra directa para el usuario ${idUsuario}, el carrito no se vaciará.`);
                }

                // 2. Actualizar stock físico, eliminar reserva y registrar la compra
                if (cartMetadataStr && idUsuario) {
                    try {
                        const items = JSON.parse(cartMetadataStr);
                        console.log(`Pago aprobado. Actualizando stock de ${items.length} productos y registrando compra.`);
                        
                        const itemsConPrecio = [];
                        let originalSubtotal = 0;
                        let subtotal = 0;

                        // Intentar obtener el preference_id original (en metadata enviamos el temp_ref pero la preference es paymentData.order?.id o algo así, borraremos por id_usuario y producto)
                        const mpPrefId = paymentData.order?.id || paymentData.metadata.temp_ref;

                        for (const item of items) {
                            const producto = await Producto.getById(item.product_id);
                            if (producto) {
                                const originalPrice = parseFloat(producto.precio) || 0;
                                const finalPrice = item.price !== undefined ? parseFloat(item.price) : originalPrice;
                                itemsConPrecio.push({
                                    id_producto: item.product_id,
                                    cantidad: item.quantity,
                                    precio: finalPrice,
                                    nombre: producto.nombre
                                });
                                originalSubtotal += originalPrice * item.quantity;
                                subtotal += finalPrice * item.quantity;
                            }

                            // NOTA: No descontamos el stock físico manualmente porque la BD tiene 
                            // un trigger trg_restar_stock en la tabla linea_compra que lo hace automáticamente.
                            
                            // Borrar la reserva temporal ya que se concretó la compra (más robusto borrar sin restringir cantidad exacta)
                            await pool.query('DELETE FROM reserva_stock WHERE id_usuario = $1 AND id_producto = $2', [idUsuario, item.product_id]);
                            
                            // Emitimos actualización SSE
                            sseController.broadcastStockUpdate(item.product_id);
                        }

                        // Registrar la compra en la base de datos
                        if (itemsConPrecio.length > 0) {
                            const Compra = require('../models/compraModel');
                            const total_descuento = Math.max(0, originalSubtotal - subtotal);
                            const total = subtotal;
                            const resultCompra = await Compra.create(idUsuario, itemsConPrecio, originalSubtotal, total_descuento, total, 'mercado_pago', 'Pago aprobado', String(paymentId));
                            console.log(`Compra registrada con éxito para el usuario ${idUsuario}: ID ${resultCompra.id_compra}`);

                            // Enviar comprobante por email
                            try {
                                const userRes = await pool.query('SELECT nombre, email FROM usuario WHERE id_usuario = $1', [idUsuario]);
                                if (userRes.rows.length > 0) {
                                    const { nombre, email } = userRes.rows[0];
                                    const { enviarComprobante } = require('../utils/emailService');
                                    await enviarComprobante(email, nombre, itemsConPrecio, total, resultCompra.id_compra);
                                }
                            } catch (mailErr) {
                                console.error('[Email Debug] Error enviando email:', mailErr);
                            }
                        }
                    } catch (e) {
                        console.error('Error al actualizar stock o registrar la compra:', e);
                    }
                }
            }
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Error en el Webhook de Mercado Pago:', error);
        res.status(200).json({ error: 'Error procesando webhook, pero notificado', details: error.message });
    }
};

const successRedirect = (req, res) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const queryParams = new URLSearchParams(req.query).toString();
    res.redirect(`${frontendUrl}/payment-success?${queryParams}`);
};

const failureRedirect = (req, res) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const queryParams = new URLSearchParams(req.query).toString();
    res.redirect(`${frontendUrl}/payment-failure?${queryParams}`);
};

const pendingRedirect = (req, res) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const queryParams = new URLSearchParams(req.query).toString();
    res.redirect(`${frontendUrl}/payment-pending?${queryParams}`);
};

module.exports = {
    createPreference,
    receiveWebhook,
    successRedirect,
    failureRedirect,
    pendingRedirect
};
