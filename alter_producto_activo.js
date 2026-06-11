const pool = require('./src/config/db');

async function alter() {
  try {
    await pool.query("ALTER TABLE producto ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE");
    await pool.query("UPDATE producto SET activo = TRUE WHERE activo IS NULL");
    console.log('Column activo added successfully');
  } catch (e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
}

alter();
