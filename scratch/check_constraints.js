const pool = require('../src/config/db');

async function checkSchema() {
    try {
        console.log("=== calificacion table columns ===");
        const colsCal = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'calificacion'
        `);
        console.table(colsCal.rows);

        console.log("\n=== comentario table columns ===");
        const colsCom = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'comentario'
        `);
        console.table(colsCom.rows);

        console.log("\n=== calificacion table constraints ===");
        const consCal = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'calificacion'::regclass
        `);
        console.table(consCal.rows);

        console.log("\n=== comentario table constraints ===");
        const consCom = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conrelid = 'comentario'::regclass
        `);
        console.table(consCom.rows);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSchema();
