const Producto = require('./src/models/productoModel');

async function run() {
  try {
    const data = await Producto.getAllAdmin();
    console.log(`Found ${data.length} products`);
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    process.exit(0);
  }
}

run();
