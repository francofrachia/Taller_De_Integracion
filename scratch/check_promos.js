const pool = require('../src/config/db');

async function main() {
    try {
        console.log("=== Database Server Info ===");
        const timeRes = await pool.query("SELECT NOW() AS now, CURRENT_DATE AS current_date, CURRENT_TIMESTAMP AS current_timestamp");
        console.log("NOW():", timeRes.rows[0].now);
        console.log("CURRENT_DATE:", timeRes.rows[0].current_date);
        console.log("CURRENT_TIMESTAMP:", timeRes.rows[0].current_timestamp);

        const tzRes = await pool.query("SHOW TIMEZONE");
        console.log("TIMEZONE:", tzRes.rows[0].TimeZone);

        console.log("\n=== Table Schema for 'promocion' ===");
        const schemaRes = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'promocion'
        `);
        console.table(schemaRes.rows);

        console.log("\n=== All Promotions in Table ===");
        const promosRes = await pool.query("SELECT * FROM promocion");
        console.table(promosRes.rows);

    } catch (e) {
        console.error("Error querying DB:", e);
    } finally {
        await pool.end();
        process.exit();
    }
}
main();
