const pool = require('../src/config/db');

async function alter() {
  try {
    console.log("Actualizando valor default de avatar_url a '/images/lego_luigi.webp'...");
    await pool.query("ALTER TABLE usuario ALTER COLUMN avatar_url SET DEFAULT '/images/lego_luigi.webp'");
    console.log("Valor por defecto de avatar_url actualizado con éxito.");

    console.log("Actualizando avatares rotos en usuarios existentes...");
    const result = await pool.query(
      "UPDATE usuario SET avatar_url = '/images/lego_luigi.webp' WHERE avatar_url = '/images/logo mario.png' OR avatar_url IS NULL"
    );
    console.log(`Se actualizaron ${result.rowCount} usuarios con el nuevo avatar de Lego Luigi.`);

  } catch (e) {
    console.error('Error al alterar la tabla usuario:', e.message);
  } finally {
    await pool.end();
  }
}

alter();
