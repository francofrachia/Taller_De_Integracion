const pool = require('../src/config/db');
const Carrito = require('../src/models/carritoModel');

async function main() {
    try {
        console.log("Testing Carrito.getItems...");
        // Let's find a cart id first
        const cartRes = await pool.query("SELECT id_carrito FROM carrito LIMIT 1");
        if (cartRes.rows.length === 0) {
            console.log("No carts in DB to test with.");
        } else {
            const id_carrito = cartRes.rows[0].id_carrito;
            console.log(`Found cart with ID: ${id_carrito}. Fetching items...`);
            const items = await Carrito.getItems(id_carrito);
            console.log("Success! Items:", items);
        }
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        process.exit();
    }
}
main();
