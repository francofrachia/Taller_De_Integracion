const pool = require('../src/config/db');

async function run() {
  const r = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("All tables in public:");
  console.table(r.rows);
  process.exit(0);
}
run();
