const pool = require('../src/config/db');

async function run() {
    try {
        console.log("Starting database cleanup...");

        // 1. Truncate transaction and user tables with CASCADE and RESTART IDENTITY
        const truncateQuery = `
            TRUNCATE TABLE 
                favorito, 
                calificacion, 
                comentario, 
                linea_carrito, 
                carrito, 
                envio, 
                linea_compra, 
                compra, 
                ingreso_producto, 
                promocion, 
                usuario, 
                direccion 
            RESTART IDENTITY CASCADE;
        `;
        await pool.query(truncateQuery);
        console.log("✔ Truncated all transaction, user, and address tables, and reset their sequences.");

        // 2. Fetch all products to assign them sequential IDs starting from 1
        const prodRes = await pool.query('SELECT id_producto, nombre FROM producto ORDER BY id_producto;');
        const products = prodRes.rows;
        console.log(`Found ${products.length} products to re-index.`);

        for (let i = 0; i < products.length; i++) {
            const oldId = products[i].id_producto;
            const newId = i + 1;
            await pool.query('UPDATE producto SET id_producto = $1 WHERE id_producto = $2;', [newId, oldId]);
            console.log(`  - Reindexed "${products[i].nombre}": ${oldId} ➔ ${newId}`);
        }

        console.log("✔ Re-indexed all products.");

        // 3. Reset the product ID sequence to next value
        const maxId = products.length;
        await pool.query(`SELECT setval('producto_id_producto_seq', $1, true);`, [maxId]);
        console.log(`✔ Reset product sequence 'producto_id_producto_seq' to generate next ID: ${maxId + 1}`);

        console.log("Cleanup and re-indexing finished successfully!");
    } catch (e) {
        console.error("❌ Error during cleanup:", e);
    } finally {
        process.exit();
    }
}
run();
