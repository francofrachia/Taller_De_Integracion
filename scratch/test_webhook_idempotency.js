require('dotenv').config();
const { receiveWebhook } = require('../src/controllers/mercadoPagoController');
const pool = require('../src/config/db');

// Mock Mercado Pago client
const mercadopago = require('mercadopago');
const originalGet = mercadopago.Payment.prototype.get;

const TEST_PAYMENT_ID = 'test_pago_123456';

// Setup Mock
mercadopago.Payment.prototype.get = async function({ id }) {
    console.log(`[MOCK MP] Fetching payment details for ID: ${id}`);
    if (id === TEST_PAYMENT_ID) {
        return {
            status: 'approved',
            id: TEST_PAYMENT_ID,
            metadata: {
                cart: JSON.stringify([{ product_id: 24, quantity: 1 }]), // Simba, quantity: 1
                id_usuario: 3,
                is_direct_purchase: 'true'
            }
        };
    }
    throw new Error("Payment not found");
};

async function runTest() {
    try {
        console.log("=== INICIANDO PRUEBA DE IDEMPOTENCIA ===");
        
        // Obtener stock inicial de Simba
        const { rows: initialProduct } = await pool.query("SELECT stock FROM producto WHERE id_producto = 24");
        const initialStock = initialProduct[0].stock;
        console.log(`Stock inicial de Simba: ${initialStock}`);

        // Eliminar compras de prueba previas si existen
        await pool.query("DELETE FROM linea_compra WHERE id_compra IN (SELECT id_compra FROM compra WHERE id_pago_mp = $1)", [TEST_PAYMENT_ID]);
        await pool.query("DELETE FROM compra WHERE id_pago_mp = $1", [TEST_PAYMENT_ID]);

        // Mock objects para express
        const req = {
            query: { id: TEST_PAYMENT_ID, topic: 'payment' },
            body: {}
        };
        
        let resStatus1, resSent1;
        const res1 = {
            sendStatus: (code) => {
                resStatus1 = code;
                resSent1 = true;
            },
            status: (code) => {
                resStatus1 = code;
                return {
                    json: (data) => {
                        resSent1 = data;
                    }
                };
            }
        };

        let resStatus2, resSent2;
        const res2 = {
            sendStatus: (code) => {
                resStatus2 = code;
                resSent2 = true;
            },
            status: (code) => {
                resStatus2 = code;
                return {
                    json: (data) => {
                        resSent2 = data;
                    }
                };
            }
        };

        // 1. Ejecutar el primer Webhook (Simular primer llamado)
        console.log("\n--- Enviando primer webhook (debería registrar compra y descontar stock) ---");
        await receiveWebhook(req, res1);
        console.log(`Resultado 1 - status: ${resStatus1}, sent:`, resSent1);

        // Esperar un momento a que las promesas asíncronas terminen
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar si la compra se creó y el stock bajó
        const { rows: comprasAfter1 } = await pool.query("SELECT id_compra FROM compra WHERE id_pago_mp = $1", [TEST_PAYMENT_ID]);
        console.log(`Compras creadas en DB tras webhook 1: ${comprasAfter1.length}`);
        
        const { rows: productAfter1 } = await pool.query("SELECT stock FROM producto WHERE id_producto = 24");
        console.log(`Stock de Simba tras webhook 1: ${productAfter1[0].stock}`);

        // 2. Ejecutar el segundo Webhook (Simular llamado duplicado concurrente/posterior)
        console.log("\n--- Enviando segundo webhook duplicado (debería ignorarlo y retornar 200) ---");
        await receiveWebhook(req, res2);
        console.log(`Resultado 2 - status: ${resStatus2}, sent:`, resSent2);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar que NO se crearon compras adicionales y el stock no bajó más
        const { rows: comprasAfter2 } = await pool.query("SELECT id_compra FROM compra WHERE id_pago_mp = $1", [TEST_PAYMENT_ID]);
        console.log(`Compras creadas en DB tras webhook 2: ${comprasAfter2.length}`);
        
        const { rows: productAfter2 } = await pool.query("SELECT stock FROM producto WHERE id_producto = 24");
        console.log(`Stock de Simba tras webhook 2: ${productAfter2[0].stock}`);

        // VALIDAR RESULTADOS
        let testPassed = true;
        if (comprasAfter1.length !== 1) {
            console.error("❌ ERROR: El primer webhook debió crear exactamente 1 compra!");
            testPassed = false;
        }
        if (productAfter1[0].stock !== initialStock - 1) {
            console.error("❌ ERROR: El primer webhook debió restar exactamente 1 al stock!");
            testPassed = false;
        }
        if (comprasAfter2.length !== 1) {
            console.error("❌ ERROR: El segundo webhook no debió duplicar la compra!");
            testPassed = false;
        }
        if (productAfter2[0].stock !== productAfter1[0].stock) {
            console.error("❌ ERROR: El segundo webhook restó stock adicional!");
            testPassed = false;
        }

        if (testPassed) {
            console.log("\n🎉 EXITO: La idempotencia funciona perfectamente! El duplicado fue ignorado sin alterar el stock.");
        } else {
            console.error("\n❌ FALLO: La prueba no cumplió con las condiciones de idempotencia.");
        }

        // LIMPIEZA POST-PRUEBA
        console.log("\nLimpiando datos de prueba...");
        await pool.query("DELETE FROM linea_compra WHERE id_compra IN (SELECT id_compra FROM compra WHERE id_pago_mp = $1)", [TEST_PAYMENT_ID]);
        await pool.query("DELETE FROM compra WHERE id_pago_mp = $1", [TEST_PAYMENT_ID]);
        await pool.query("UPDATE producto SET stock = $1 WHERE id_producto = 24", [initialStock]);
        console.log("Datos de prueba limpiados. Stock de Simba restaurado.");

    } catch (e) {
        console.error("Error en la ejecución del test:", e);
    } finally {
        // Restaurar mock
        mercadopago.Payment.prototype.get = originalGet;
        await pool.end();
    }
}

runTest();
