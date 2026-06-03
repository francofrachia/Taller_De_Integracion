const pool = require('../src/config/db');

async function checkDb() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'promocion';
        `);
        console.log("Tabla Promocion:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
checkDb();
