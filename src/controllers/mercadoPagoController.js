const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Producto = require('../models/productoModel');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-3392476566418854-052018-971c261e47963df50d890d2354c4d7e9-1823758368'
});

const createPreference = async (req, res) => {
    try {
        const { id_producto, quantity } = req.body;

        if (!id_producto || !quantity) {
            return res.status(400).json({ error: 'Faltan datos obligatorios (id_producto, cantidad)' });
        }

        // Obtener el producto de la base de datos para asegurar el precio real y evitar alteraciones
        const producto = await Producto.getById(id_producto);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (producto.stock < quantity) {
            return res.status(400).json({ error: 'No hay suficiente stock disponible' });
        }

        const preference = new Preference(client);
        
        // Determinar URLs de retorno
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const webhookUrl = process.env.MP_WEBHOOK_URL;

        const preferenceData = {
            body: {
                items: [
                    {
                        id: String(producto.id_producto),
                        title: producto.nombre,
                        quantity: Number(quantity),
                        unit_price: Number(producto.precio),
                        currency_id: 'ARS',
                        picture_url: producto.imagenes && producto.imagenes[0] ? producto.imagenes[0] : ''
                    }
                ],
                back_urls: {
                    success: `${baseUrl}/payment-success`,
                    failure: `${baseUrl}/payment-failure`,
                    pending: `${baseUrl}/payment-pending`
                },
                metadata: {
                    product_id: producto.id_producto,
                    quantity: Number(quantity)
                }
            }
        };

        // Mercado Pago exige que para usar auto_return: 'approved', las URLs de retorno deben ser HTTPS.
        // En desarrollo local (HTTP), lo omitimos para evitar que la API devuelva un error 400.
        if (baseUrl.startsWith('https://')) {
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
                const productId = paymentData.metadata.product_id;
                const quantity = paymentData.metadata.quantity;

                if (productId && quantity) {
                    console.log(`Pago aprobado. Decrementando stock del producto ID ${productId} en ${quantity} unidades.`);
                    const result = await Producto.updateStock(productId, quantity);
                    if (result) {
                        console.log(`Stock actualizado con éxito. Nuevo stock: ${result.stock}`);
                    } else {
                        console.log(`Error al actualizar stock. Es posible que no haya stock suficiente o el producto no exista.`);
                    }
                } else {
                    console.log('No se encontraron los metadatos necesarios en el pago (product_id, quantity).');
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

module.exports = {
    createPreference,
    receiveWebhook
};
