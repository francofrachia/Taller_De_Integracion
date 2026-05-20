const pool = require('../src/config/db');

async function checkPorscheImages() {
  try {
    const { rows } = await pool.query("SELECT * FROM imagen WHERE id_producto = 12");
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPorscheImages();
