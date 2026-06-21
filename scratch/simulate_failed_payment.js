require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const pool = require('../src/config/db');
const Producto = require('../src/models/productoModel');
const Compra = require('../src/models/compraModel');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// Mock sseController to avoid real SSE errors during test
jest = { mock: {} }; 
const sseController = {
    broadcastStockUpdate: (id) => console.log(`[SSE Mock] Broadcast stock update for product ID ${id}`)
};

const procesarPagoFallido = async (paymentId) => {
    try {
        // Verificar si ya registramos una compra con este id_pago_mp (idempotencia)
        const { rows: existingCompra } = await pool.query(
            'SELECT id_compra FROM compra WHERE id_pago_mp = $1',
            [String(paymentId)]
        );
        if (existingCompra.length > 0) {
            console.log(`Pago fallido/rechazado ${paymentId} ya procesado anteriormente. Ignorando.`);
            return { success: true, alreadyProcessed: true };
        }

        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log(`[Pago Fallido] Detalles del pago ${paymentId}: Estado = ${paymentData.status}`);

        // Solo procesar si el estado es rechazado o cancelado
        if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            const cartMetadataStr = paymentData.metadata.cart;
            const idUsuario = paymentData.metadata.id_usuario;

            if (cartMetadataStr && idUsuario) {
                const items = JSON.parse(cartMetadataStr);
                console.log(`Registrando compra fallida/rechazada para el usuario ${idUsuario} (Pago ID: ${paymentId})`);
                
                const itemsConPrecio = [];
                let originalSubtotal = 0;
                let subtotal = 0;

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

                    // Borrar la reserva temporal ya que el pago falló y la reserva ya no sirve
                    await pool.query('DELETE FROM reserva_stock WHERE id_usuario = $1 AND id_producto = $2', [idUsuario, item.product_id]);
                    sseController.broadcastStockUpdate(item.product_id);
                }

                if (itemsConPrecio.length > 0) {
                    const total_descuento = Math.max(0, originalSubtotal - subtotal);
                    const total = subtotal;
                    
                    console.log("Creating purchase record in 'Esperando Pago'...");
                    const resultCompra = await Compra.create(idUsuario, itemsConPrecio, originalSubtotal, total_descuento, total, 'mercado_pago', 'Esperando Pago', String(paymentId));
                    console.log("Purchase created successfully:", resultCompra);
                    if (resultCompra.success) {
                        console.log("Updating purchase state to 'Cancelado'...");
                        await Compra.updateEstado(resultCompra.id_compra, 'Cancelado');
                        console.log(`Compra fallida registrada correctamente (ID compra: ${resultCompra.id_compra}, estado: Cancelado/Rechazado)`);
                    }
                }
            }
        }
        return { success: true };
    } catch (e) {
        console.error('Error en procesarPagoFallido:', e);
        throw e;
    }
};

async function run() {
    try {
        await procesarPagoFallido('164387331931');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
