const pool = require('./src/config/db');

async function test() {
  try {
    await pool.query(`
      INSERT INTO usuario (id_usuario, rol, nombre, apellido, email, contrasena) 
      VALUES (9999, 'usuario', 'Invitado', 'BloqueMundo', 'guest@bloquemundo.com', 'guest123')
      ON CONFLICT (id_usuario) DO NOTHING
    `);
    const newCart = await pool.query('INSERT INTO carrito (id_usuario, total) VALUES (9999, 0) RETURNING *');
    console.log(newCart.rows);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
test();
