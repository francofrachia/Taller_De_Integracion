const pool = require('../src/config/db');
async function check() {
  const { rows } = await pool.query('SELECT id_proveedor, nombre FROM proveedor');
  console.table(rows);
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
