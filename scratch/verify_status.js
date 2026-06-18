require('dotenv').config();
const pool = require('../src/config/db');

async function main() {
    let success = true;
    try {
        console.log("=== VERIFICACIÓN DE BASE DE DATOS ===");
        
        // 1. Verificar columna id_pago_mp
        const { rows: colRows } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'compra' AND column_name = 'id_pago_mp'
        `);
        if (colRows.length > 0) {
            console.log("✅ La columna 'id_pago_mp' existe en la tabla 'compra'.");
        } else {
            console.error("❌ La columna 'id_pago_mp' NO existe en la tabla 'compra'!");
            success = false;
        }

        // 2. Verificar que compra 40 ya no exista
        const { rows: compra40 } = await pool.query('SELECT * FROM compra WHERE id_compra = 40');
        if (compra40.length === 0) {
            console.log("✅ La compra duplicada con ID 40 ha sido eliminada.");
        } else {
            console.error("❌ La compra duplicada con ID 40 aún existe!");
            success = false;
        }

        // 3. Verificar stock de Simba
        const { rows: simbaStock } = await pool.query("SELECT stock, nombre FROM producto WHERE id_producto = 24");
        if (simbaStock.length > 0 && simbaStock[0].stock === 3) {
            console.log(`✅ El stock de ${simbaStock[0].nombre} es correcto: ${simbaStock[0].stock} (esperado: 3).`);
        } else {
            console.error(`❌ El stock de Simba es incorrecto: ${simbaStock[0]?.stock || 'no encontrado'} (esperado: 3).`);
            success = false;
        }

        if (success) {
            console.log("\n🎉 Todas las verificaciones de base de datos pasaron con éxito!");
        } else {
            console.error("\n❌ Hubo fallas en la verificación!");
        }
    } catch (e) {
        console.error("Error durante la verificación:", e);
    } finally {
        await pool.end();
    }
}

main();
