const pool = require('../src/config/db');

async function migrateDb() {
    try {
        console.log("Adding admin to enum...");
        try {
            await pool.query(`ALTER TYPE usuario_rol ADD VALUE 'admin';`);
        } catch(e) {
            console.log("Enum ya existe o error:", e.message);
        }

        console.log("Promoting user 1 to admin...");
        const res = await pool.query(`UPDATE usuario SET rol = 'admin' WHERE id_usuario = 1 RETURNING id_usuario, email, rol;`);
        console.log("User promoted:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
migrateDb();
