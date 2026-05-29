const pool = require('../src/config/db');

async function getLabels() {
    try {
        const res = await pool.query(`
            SELECT enumlabel 
            FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE typname = 'estado_compra'
        `);
        console.log("=== estado_compra ENUM labels ===");
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getLabels();
