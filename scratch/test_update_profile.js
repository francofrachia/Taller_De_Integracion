const pool = require('../src/config/db');

async function testUpdate() {
  try {
    const id_usuario = 3;
    const nombre = 'Francisco';
    const apellido = 'Agustin';
    const email = 'fr.abenedetti1@gmail.com';
    const telefono = '3446-123456';

    const result = await pool.query(
      'UPDATE usuario SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), email = COALESCE($3, email), telefono = COALESCE($4, telefono) WHERE id_usuario = $5 RETURNING id_usuario, nombre, apellido, email, telefono, rol, id_direccion, fecha_registro, avatar_url',
      [nombre || null, apellido || null, email || null, telefono || null, id_usuario]
    );

    console.log("Update Success!");
    console.table(result.rows);
    process.exit(0);
  } catch(e) {
    console.error("Update Error:", e);
    process.exit(1);
  }
}
testUpdate();
