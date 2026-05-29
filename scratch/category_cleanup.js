const pool = require('../src/config/db');

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting category cleanup transaction...");

        // 1. Drop foreign key constraint
        await client.query('ALTER TABLE producto DROP CONSTRAINT producto_id_categoria_fkey;');
        console.log("✔ Temporarily dropped foreign key 'producto_id_categoria_fkey'.");

        // 2. Fetch all categories
        const catRes = await client.query('SELECT id_categoria, nombre FROM categoria ORDER BY id_categoria;');
        const categories = catRes.rows;
        console.log(`Found ${categories.length} categories to re-index.`);

        // 3. Update categories and products sequential re-indexing
        for (let i = 0; i < categories.length; i++) {
            const oldId = categories[i].id_categoria;
            const newId = i + 1;
            
            // Update category ID
            await client.query('UPDATE categoria SET id_categoria = $1 WHERE id_categoria = $2;', [newId, oldId]);
            // Update product ID reference
            await client.query('UPDATE producto SET id_categoria = $1 WHERE id_categoria = $2;', [newId, oldId]);
            
            console.log(`  - Reindexed category "${categories[i].nombre}": ${oldId} ➔ ${newId}`);
        }

        // 4. Re-add foreign key constraint
        await client.query('ALTER TABLE producto ADD CONSTRAINT producto_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria);');
        console.log("✔ Re-added foreign key constraint.");

        // 5. Reset category sequence
        const maxId = categories.length;
        await client.query(`SELECT setval('categoria_id_categoria_seq', $1, true);`, [maxId]);
        console.log(`✔ Reset category sequence 'categoria_id_categoria_seq' to generate next ID: ${maxId + 1}`);

        await client.query('COMMIT');
        console.log("Cleanup and re-indexing finished successfully!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Error during category cleanup (transaction rolled back):", e);
    } finally {
        client.release();
        process.exit();
    }
}
run();
