const pool = require('../src/config/db');

async function checkKeys() {
  try {
    const cats = await pool.query('SELECT * FROM categoria');
    console.log('--- CATEGORIAS ---');
    console.table(cats.rows);

    const provs = await pool.query('SELECT * FROM proveedor');
    console.log('--- PROVEEDORES ---');
    console.table(provs.rows);

    const imgCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'imagen' AND table_schema = 'public'
    `);
    console.log('--- IMAGEN COLUMNS ---');
    console.table(imgCols.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkKeys();
