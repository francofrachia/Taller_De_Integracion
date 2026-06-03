const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Producto = require('../models/productoModel');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-3392476566418854-052018-971c261e47963df50d890d2354c4d7e9-1823758368'
});

const createPreference = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { cartItems, isDirectPurchase } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (cartItems vacío)' });
        }

        const itemsPreference = [];
        const metadataItems = [];

        // Validar stock de todos los productos antes de crear preferencia
        for (const item of cartItems) {
            const producto = await Producto.getById(item.id_producto);
            if (!producto) {
                return res.status(404).json({ error: `Producto ${item.id_producto} no encontrado` });
            }
            if (producto.stock < item.cantidad) {
                return res.status(400).json({ error: `No hay suficiente stock para ${producto.nombre}` });
            }

            itemsPreference.push({
                id: String(producto.id_producto),
                title: producto.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(producto.precio),
                currency_id: 'ARS',
                picture_url: producto.imagenes && producto.imagenes[0] ? producto.imagenes[0] : ''
            });

            metadataItems.push({
                product_id: producto.id_producto,
                quantity: Number(item.cantidad)
            });
        }

        const preference = new Preference(client);
        
        // Obtener el webhook de ngrok configurado
        const webhookUrl = process.env.MP_WEBHOOK_URL;
        
        // Determinar URLs de retorno
        // Para desarrollo local con ngrok, si hay una URL pública HTTPS de ngrok configurada,
        // la registramos como proxy de redirección en el backend. Esto permite usar auto_return: 'approved'
        // ya que la URL tiene HTTPS, y el backend luego redirige limpiamente al localhost del usuario.
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
                    // MP metadata string limit is 500 chars, JSON stringify for multiple items
                    cart: JSON.stringify(metadataItems),
                    id_usuario: id_usuario,
                    is_direct_purchase: !!isDirectPurchase
                }
            }
        };

        // Mercado Pago exige que para usar auto_return: 'approved', las URLs de retorno deben ser HTTPS.
        // Si usamos HTTP (como http://localhost:5173 en desarrollo), no debemos configurar auto_return.
        const requiresHttps = successUrl.startsWith('https://');
        if (requiresHttps) {
            preferenceData.body.auto_return = 'approved';
        }

        // Si hay una URL de webhook de ngrok configurada, la agregamos
        if (webhookUrl) {
            preferenceData.body.notification_url = webhookUrl;
        }

        const response = await preference.create(preferenceData);
        
        res.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });

    } catch (error) {
        console.error('Error al crear la preferencia de pago:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago', details: error.message });
    }
};

const receiveWebhook = async (req, res) => {
    try {
        console.log('Webhook de Mercado Pago recibido:', req.query, req.body);
        
        const type = req.body.type || req.query.type;
        const paymentId = req.body.data?.id || req.query['data.id'] || req.body['data.id'];

        if (type === 'payment' && paymentId) {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });
            
            console.log(`Detalles del pago ${paymentId}: Estado = ${paymentData.status}`);

            if (paymentData.status === 'approved') {
                const cartMetadataStr = paymentData.metadata.cart;
                const idUsuario = paymentData.metadata.id_usuario;
                const isDirectPurchase = paymentData.metadata.is_direct_purchase === 'true' || paymentData.metadata.is_direct_purchase === true;

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

                // 2. Actualizar stock y registrar la compra en la base de datos
                if (cartMetadataStr && idUsuario) {
                    try {
                        const items = JSON.parse(cartMetadataStr);
                        console.log(`Pago aprobado. Actualizando stock de ${items.length} productos y registrando compra.`);
                        
                        const itemsConPrecio = [];
                        let subtotal = 0;

                        for (const item of items) {
                            // Obtener precio actual de la base de datos
                            const producto = await Producto.getById(item.product_id);
                            if (producto) {
                                const precioNum = parseFloat(producto.precio) || 0;
                                itemsConPrecio.push({
                                    id_producto: item.product_id,
                                    cantidad: item.quantity,
                                    precio: precioNum,
                                    nombre: producto.nombre
                                });
                                subtotal += precioNum * item.quantity;
                            }

                            const result = await Producto.updateStock(item.product_id, item.quantity);
                            if (result) {
                                console.log(`Stock actualizado para producto ${item.product_id}. Nuevo stock: ${result.stock}`);
                            }
                        }

                        // Registrar la compra en la base de datos
                        if (itemsConPrecio.length > 0) {
                            const Compra = require('../models/compraModel');
                            const total = subtotal; // total es el subtotal si no hay descuentos en metadata
                            const resultCompra = await Compra.create(idUsuario, itemsConPrecio, subtotal, 0, total, 'mercado_pago', 'Pago confirmado');
                            console.log(`Compra registrada con éxito para el usuario ${idUsuario}: ID ${resultCompra.id_compra}`);

                            // Enviar comprobante por email
                            try {
                                console.log(`[Email Debug] Buscando usuario ${idUsuario} en BD...`);
                                const pool = require('../config/db');
                                const userRes = await pool.query('SELECT nombre, email FROM usuario WHERE id_usuario = $1', [idUsuario]);
                                
                                if (userRes.rows.length > 0) {
                                    const { nombre, email } = userRes.rows[0];
                                    console.log(`[Email Debug] Usuario encontrado: ${nombre} (${email})`);
                                    const { enviarComprobante } = require('../utils/emailService');
                                    await enviarComprobante(email, nombre, itemsConPrecio, total, resultCompra.id_compra);
                                    console.log(`[Email Debug] Proceso de envío finalizado.`);
                                } else {
                                    console.log(`[Email Debug] No se encontró el usuario ${idUsuario} en la base de datos.`);
                                }
                            } catch (mailErr) {
                                console.error('[Email Debug] Error crítico enviando email:', mailErr);
                            }
                        } else {
                            console.log('No se pudieron recuperar los precios de los productos para registrar la compra.');
                        }
                    } catch (e) {
                        console.error('Error al actualizar stock o registrar la compra:', e);
                    }
                } else {
                    console.log('No se encontraron los metadatos de cart o usuario en el pago.');
                }
            }
        }

        // Siempre responder 200 OK a Mercado Pago para confirmar recepción de la notificación
        res.sendStatus(200);

    } catch (error) {
        console.error('Error en el Webhook de Mercado Pago:', error);
        // Respondemos 200 de todas formas para evitar reintentos infinitos por parte de Mercado Pago en fallos internos
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
