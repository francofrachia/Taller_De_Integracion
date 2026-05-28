const pool = require('../src/config/db');

async function cleanDuplicates() {
  try {
    const res = await pool.query(`
      DELETE FROM comentario a
      USING comentario b
      WHERE a.id_comentario < b.id_comentario
        AND a.id_usuario = b.id_usuario
        AND a.id_producto = b.id_producto;
    `);
    console.log(`Duplicados eliminados correctamente. Filas afectadas: ${res.rowCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanDuplicates();
