const pool = require('../src/config/db');

async function main() {
    try {
        const res = await pool.query(`
            SELECT id_compra, id_usuario, fecha, metodo_pago, estado, subtotal, total, id_pago_mp 
            FROM compra 
            ORDER BY fecha DESC 
            LIMIT 10
        `);
        console.log("=== ULTIMAS 10 COMPRAS EN LA BD ===");
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();
