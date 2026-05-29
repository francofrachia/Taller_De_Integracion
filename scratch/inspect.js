const pool = require('../src/config/db');

async function run() {
    try {
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'producto';
        `);
        console.log("Columns of 'producto':", columns.rows.map(c => `${c.column_name} (${c.data_type})`));

        const imgCol = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'imagen';
        `);
        console.log("Columns of 'imagen':", imgCol.rows.map(c => `${c.column_name} (${c.data_type})`));

        const imgRows = await pool.query('SELECT * FROM imagen;');
        console.log("Rows in 'imagen':", imgRows.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
