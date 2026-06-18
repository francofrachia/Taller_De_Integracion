const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function run() {
    try {
        const hash = await bcrypt.hash('guest123', 10);
        await pool.query('UPDATE usuario SET contrasena = $1 WHERE email = $2', [hash, 'guest@bloquemundo.com']);
        console.log('Password hasheada y actualizada con éxito!');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
