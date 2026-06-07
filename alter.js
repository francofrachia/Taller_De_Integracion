const pool = require('./src/config/db');

async function alter() {
  try {
    await pool.query("ALTER TYPE estado_compra ADD VALUE IF NOT EXISTS 'Pendiente'");
    await pool.query("ALTER TYPE estado_compra ADD VALUE IF NOT EXISTS 'En manos del correo'");
    await pool.query("ALTER TYPE estado_compra ADD VALUE IF NOT EXISTS 'Finalizado'");
    console.log('Enum updated successfully');
  } catch (e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
}

alter();
