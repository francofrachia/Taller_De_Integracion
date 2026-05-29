const pool = require('../src/config/db');

async function getUsers() {
    try {
        const res = await pool.query('SELECT id_usuario, nombre, email, telefono FROM usuario');
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getUsers();
