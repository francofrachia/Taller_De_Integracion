const pool = require('../src/config/db');
const Producto = require('../src/models/productoModel');

async function checkApi() {
  try {
    const products = await Producto.getAll();
    console.log('--- API PRODUCTS ---');
    console.log(JSON.stringify(products.slice(0, 3), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkApi();
