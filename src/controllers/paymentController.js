const { MercadoPagoConfig, Preference } = require('mercadopago');

exports.createPreference = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío o no se enviaron ítems' });
        }

        const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
        const preference = new Preference(client);

        const mpItems = items.map(item => ({
            id: (item.id || item.id_producto || 'item').toString(),
            title: item.title || item.nombre, 
            quantity: Number(item.quantity || item.cantidad || 1),
            unit_price: Number(item.unit_price || item.precio),
            currency_id: 'ARS',
        }));

        const body = {
            items: mpItems,
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrito?status=success`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrito?status=failure`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/carrito?status=pending`,
            },
            auto_return: "approved",
        };

        const response = await preference.create({ body });
        res.json({ id: response.id, init_point: response.init_point });

    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
};

exports.receiveWebhook = async (req, res) => {
    try {
        const { query, body } = req;
        const type = query.type || body.type;

        if (type === 'payment') {
            const paymentId = query['data.id'] || (body.data && body.data.id);
            console.log(`--- ¡Pago detectado en Webhook! ID: ${paymentId} ---`);
            
            // TODO: Consultar estado en MP y actualizar Supabase
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Error al recibir webhook:', error);
        res.sendStatus(200); 
    }
};