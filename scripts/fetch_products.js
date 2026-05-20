const pool = require('../src/config/db');

async function checkProducts() {
  try {
    console.log("Conectando a la base de datos...");
    const { rows } = await pool.query('SELECT id_producto, nombre, precio, stock FROM producto LIMIT 20');
    console.log("Productos actuales en la BD:");
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error("Error al consultar la BD:", err.message);
    process.exit(1);
  }
}

checkProducts();
