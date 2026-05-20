const pool = require('../src/config/db');

async function checkProductoSchema() {
  try {
    const { rows } = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'producto'
      ORDER BY ordinal_position
    `);
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkProductoSchema();
