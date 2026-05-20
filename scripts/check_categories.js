const pool = require('../src/config/db');

async function checkCategories() {
  try {
    const { rows } = await pool.query(`
      SELECT p.id_producto, p.nombre, p.id_categoria, c.nombre AS categoria
      FROM producto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.id_categoria, p.id_producto
    `);
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

checkCategories();
