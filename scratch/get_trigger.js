const pool = require('../src/config/db');
async function run() {
  const result = await pool.query("SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_table = 'linea_compra'");
  console.log(result.rows);
  pool.end();
}
run();
