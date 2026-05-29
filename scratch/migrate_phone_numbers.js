const pool = require('../src/config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting phone number migration...");

        // 1. Fetch all users
        const res = await client.query('SELECT id_usuario, telefono FROM usuario WHERE telefono IS NOT NULL');
        
        for (const row of res.rows) {
            const tel = row.telefono;
            // Strip non-digits
            const digits = tel.replace(/\D/g, '');
            if (digits.length === 10) {
                const formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                console.log(`User ${row.id_usuario}: migrating "${tel}" -> "${formatted}"`);
                await client.query('UPDATE usuario SET telefono = $1 WHERE id_usuario = $2', [formatted, row.id_usuario]);
            } else if (digits.length === 0) {
                console.log(`User ${row.id_usuario}: clearing empty/invalid phone "${tel}" -> null`);
                await client.query('UPDATE usuario SET telefono = NULL WHERE id_usuario = $2', [row.id_usuario]);
            } else {
                console.log(`User ${row.id_usuario}: warning, phone "${tel}" has ${digits.length} digits. Leaving unchanged or setting to null? Let's format or set to null if invalid.`);
                // If it's something weird, let's just null it or try to pad it
                await client.query('UPDATE usuario SET telefono = NULL WHERE id_usuario = $1', [row.id_usuario]);
            }
        }

        // 2. Add the CHECK constraint
        console.log("Adding CHECK constraint to usuario table...");
        // Drop constraint if it already exists to avoid errors
        await client.query('ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_telefono');
        await client.query(`
            ALTER TABLE usuario 
            ADD CONSTRAINT chk_telefono 
            CHECK (telefono IS NULL OR telefono ~ '^\\d{4}-\\d{6}$');
        `);

        await client.query('COMMIT');
        console.log("⭐ Migration completed and CHECK constraint added successfully!");
        process.exit(0);
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Migration failed:", e);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
