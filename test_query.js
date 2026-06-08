require('dotenv').config();
const Producto = require('./src/models/productoModel');

async function test() {
  try {
    console.log("Running Producto.getAllAdmin()...");
    const prods = await Producto.getAllAdmin();
    console.log("Success! Found:", prods.length, "products.");
  } catch (e) {
    console.error("ERROR running getAllAdmin():", e);
  } finally {
    process.exit();
  }
}
test();
