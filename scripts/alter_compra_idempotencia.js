const pool = require('../src/config/db');

async function alter() {
  try {
    console.log("Agregando columna id_pago_mp a la tabla compra...");
    await pool.query("ALTER TABLE compra ADD COLUMN IF NOT EXISTS id_pago_mp VARCHAR(100) UNIQUE");
    console.log('Columna id_pago_mp agregada exitosamente a la tabla compra.');
  } catch (e) {
    console.error('Error al alterar la tabla compra:', e.message);
  } finally {
    await pool.end();
  }
}

alter();
