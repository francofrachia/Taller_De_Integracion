const pool = require('../src/config/db');

async function run() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'promocion'");
  console.table(res.rows);
  
  const data = await pool.query("SELECT * FROM promocion LIMIT 5");
  console.log('Sample data:', data.rows);
  process.exit(0);
}

run().catch(console.error);
