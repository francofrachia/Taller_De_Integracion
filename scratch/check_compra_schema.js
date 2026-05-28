const pool = require('../src/config/db');

async function checkSchema() {
  try {
    const compraCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'compra' AND table_schema = 'public'
    `);
    console.log('--- COMPRA COLUMNS ---');
    console.table(compraCols.rows);

    const lineaCols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'linea_compra' AND table_schema = 'public'
    `);
    console.log('--- LINEA_COMPRA COLUMNS ---');
    console.table(lineaCols.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
