const pool = require('../src/config/db');

async function run() {
    try {
        console.log("Starting Cartoon Network category and products setup...");

        // 1. Alter coleccion_enum to add 'cartoon network' if it doesn't exist
        try {
            await pool.query("ALTER TYPE coleccion_enum ADD VALUE 'cartoon network';");
            console.log("✔ Added 'cartoon network' to coleccion_enum.");
        } catch (err) {
            if (err.code === '42710') {
                console.log("ℹ Value 'cartoon network' already exists in coleccion_enum.");
            } else {
                throw err;
            }
        }

        // 2. Insert Category 'Cartoon Network' if it doesn't exist
        const catCheck = await pool.query("SELECT id_categoria FROM categoria WHERE nombre = 'Cartoon Network';");
        let categoryId;
        if (catCheck.rows.length > 0) {
            categoryId = catCheck.rows[0].id_categoria;
            console.log(`ℹ Category 'Cartoon Network' already exists with ID: ${categoryId}`);
        } else {
            // We can let it autoincrement. Let's see what is the current max ID or let it autoincrement.
            const catInsert = await pool.query(`
                INSERT INTO categoria (nombre) 
                VALUES ('Cartoon Network') 
                RETURNING id_categoria;
            `);
            categoryId = catInsert.rows[0].id_categoria;
            console.log(`✔ Created category 'Cartoon Network' with ID: ${categoryId}`);
            
            // Also reset category sequence to the actual max value
            const maxCatRes = await pool.query("SELECT MAX(id_categoria) FROM categoria;");
            const maxCat = maxCatRes.rows[0].max;
            await pool.query(`SELECT setval('categoria_id_categoria_seq', $1, true);`, [maxCat]);
            console.log(`✔ Reset category sequence to generate next ID: ${maxCat + 1}`);
        }

        // 3. Check current product count
        const countRes = await pool.query("SELECT COUNT(*) FROM producto;");
        const currentCount = parseInt(countRes.rows[0].count, 10);
        console.log(`Current product count in database: ${currentCount}`);

        // We want to reach exactly 20 products!
        // We will insert 4 specific products with manual IDs (17, 18, 19, 20) or sequential IDs
        // Let's first make sure products 17, 18, 19, and 20 are inserted cleanly.
        
        const productsToInsert = [
            {
                id: 17,
                nombre: 'Bugs Bunny y el Pato Lucas',
                descripcion: 'Minifiguras oficiales LEGO de Bugs Bunny y el Pato Lucas con su set clásico de Looney Tunes.',
                precio: 15000.00,
                stock: 10,
                id_categoria: categoryId,
                tipo_coleccion: 'cartoon network',
                edad_recomendada: 6,
                id_proveedor: 1
            },
            {
                id: 18,
                nombre: 'Correcaminos y el Coyote',
                descripcion: 'Recreá las persecuciones más icónicas de Looney Tunes con este divertido set de construcción LEGO.',
                precio: 18500.00,
                stock: 8,
                id_categoria: categoryId,
                tipo_coleccion: 'cartoon network',
                edad_recomendada: 8,
                id_proveedor: 1
            },
            {
                id: 19,
                nombre: 'El Laboratorio de Dexter',
                descripcion: 'Construí el laboratorio secreto de Dexter, completo con su computadora central y minifiguras de Dexter y Dee Dee.',
                precio: 32000.00,
                stock: 5,
                id_categoria: categoryId,
                tipo_coleccion: 'cartoon network',
                edad_recomendada: 10,
                id_proveedor: 1
            },
            {
                id: 20,
                nombre: 'Las Chicas Superpoderosas',
                descripcion: 'Set de batalla en Saltadilla con minifiguras oficiales de Bombón, Burbuja, Bellota y el villano Mojo Jojo.',
                precio: 27500.00,
                stock: 7,
                id_categoria: categoryId,
                tipo_coleccion: 'cartoon network',
                edad_recomendada: 8,
                id_proveedor: 1
            }
        ];

        for (const p of productsToInsert) {
            // Delete if exists first to make this script idempotent
            await pool.query("DELETE FROM producto WHERE id_producto = $1;", [p.id]);
            
            await pool.query(`
                INSERT INTO producto (id_producto, nombre, descripcion, precio, stock, id_categoria, tipo_coleccion, edad_recomendada, id_proveedor, activo)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true);
            `, [p.id, p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, p.tipo_coleccion, p.edad_recomendada, p.id_proveedor]);
            
            console.log(`✔ Inserted product "${p.nombre}" with ID: ${p.id}`);
        }

        // 4. Reset product sequence to 20
        await pool.query(`SELECT setval('producto_id_producto_seq', 20, true);`);
        console.log("✔ Reset product sequence 'producto_id_producto_seq' to generate next ID: 21");

        // Verify total product count
        const verifyRes = await pool.query("SELECT COUNT(*) FROM producto;");
        console.log(`Verified final product count in database: ${verifyRes.rows[0].count}`);

    } catch (e) {
        console.error("❌ Error during Cartoon Network setup:", e);
    } finally {
        process.exit();
    }
}
run();
