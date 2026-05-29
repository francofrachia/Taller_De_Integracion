const pool = require('../src/config/db');

async function run() {
  for (const t of ['usuario', 'direccion', 'proveedor']) {
    const r = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [t]);
    console.log(`=== ${t} ===`);
    console.table(r.rows);
  }
  process.exit(0);
}
run();
