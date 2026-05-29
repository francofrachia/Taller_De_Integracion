const pool = require('../src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting reviews schema migration...");

        // 1. Drop the unique constraint on calificacion table
        console.log("1. Dropping unique constraint uq_calif_usu_prod on calificacion...");
        await client.query('ALTER TABLE calificacion DROP CONSTRAINT IF EXISTS uq_calif_usu_prod');

        // 2. Add id_calificacion column to comentario table if it doesn't exist
        console.log("2. Adding id_calificacion column to comentario...");
        await client.query(`
            ALTER TABLE comentario 
            ADD COLUMN IF NOT EXISTS id_calificacion INT 
            REFERENCES calificacion(id_calificacion) 
            ON DELETE CASCADE;
        `);

        // 3. Link existing comments to their ratings based on (id_usuario, id_producto)
        console.log("3. Linking existing comments to their ratings...");
        await client.query(`
            UPDATE comentario c
            SET id_calificacion = cal.id_calificacion
            FROM calificacion cal
            WHERE c.id_usuario = cal.id_usuario 
              AND c.id_producto = cal.id_producto
              AND c.id_calificacion IS NULL;
        `);

        await client.query('COMMIT');
        console.log("⭐ Reviews schema migrated successfully!");
        process.exit(0);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", e);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
