const pool = require('../src/config/db');

async function main() {
    try {
        const res = await pool.query("SELECT id_usuario, nombre, email, rol FROM usuario WHERE rol = 'admin'");
        console.log("Admins found:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
main();
