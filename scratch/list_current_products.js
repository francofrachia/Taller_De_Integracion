const pool = require('../src/config/db');

async function listProducts() {
  try {
    const products = await pool.query('SELECT id_producto, nombre, precio, tipo_coleccion FROM producto');
    console.log('--- CURRENT PRODUCTS ---');
    console.table(products.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listProducts();
