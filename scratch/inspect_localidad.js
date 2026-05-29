const pool = require('../src/config/db');

async function run() {
  const count = await pool.query('SELECT COUNT(*) FROM localidad');
  console.log(`localidad rows: ${count.rows[0].count}`);
  
  const cols = await pool.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'localidad'
    ORDER BY ordinal_position
  `);
  console.table(cols.rows);

  const sample = await pool.query('SELECT * FROM localidad LIMIT 10');
  console.table(sample.rows);

  process.exit(0);
}
run();
