const pool = require('../src/config/db');

async function run() {
    try {
        console.log("Altering coleccion_enum...");
        
        // Add new allowed values to coleccion_enum one by one
        const valuesToAdd = ['technic', 'minecraft', 'architecture', 'icons', 'otros'];
        for (const val of valuesToAdd) {
            try {
                await pool.query(`ALTER TYPE coleccion_enum ADD VALUE '${val}';`);
                console.log(`✔ Added '${val}' to coleccion_enum.`);
            } catch (err) {
                if (err.code === '42710') {
                    console.log(`ℹ Value '${val}' already exists in coleccion_enum.`);
                } else {
                    throw err;
                }
            }
        }

        // Only update products whose current tipo_coleccion is NULL!
        
        // Products of category 'Technic' (ID 1)
        await pool.query("UPDATE producto SET tipo_coleccion = 'technic' WHERE id_categoria = 1 AND tipo_coleccion IS NULL;");
        console.log("✔ Set tipo_coleccion to 'technic' for Technic products (where NULL).");

        // Products of category 'Architecture' (ID 6)
        await pool.query("UPDATE producto SET tipo_coleccion = 'architecture' WHERE id_categoria = 6 AND tipo_coleccion IS NULL;");
        console.log("✔ Set tipo_coleccion to 'architecture' for Architecture products (where NULL).");

        // Products of category 'Icons' (ID 7)
        await pool.query("UPDATE producto SET tipo_coleccion = 'icons' WHERE id_categoria = 7 AND tipo_coleccion IS NULL;");
        console.log("✔ Set tipo_coleccion to 'icons' for Icons products (where NULL).");

        // Products of category 'Minecraft' (ID 8)
        await pool.query("UPDATE producto SET tipo_coleccion = 'minecraft' WHERE id_categoria = 8 AND tipo_coleccion IS NULL;");
        console.log("✔ Set tipo_coleccion to 'minecraft' for Minecraft products (where NULL).");

        console.log("Enum alteration and product updates finished successfully!");
    } catch (e) {
        console.error("❌ Error during enum cleanup:", e);
    } finally {
        process.exit();
    }
}
run();
