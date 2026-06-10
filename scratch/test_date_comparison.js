const pool = require('../src/config/db');

async function main() {
    try {
        console.log("=== Testing date comparisons in PG ===");
        
        // 1. Query to see what happens when comparing a past date with NOW()
        const query1 = `
            SELECT 
                '2026-06-06'::date AS fecha_fin,
                '2026-06-06 12:00:00'::timestamp AS now_val,
                ('2026-06-06'::date >= '2026-06-06 12:00:00'::timestamp) AS date_ge_timestamp,
                ('2026-06-06'::date >= '2026-06-06 12:00:00'::timestamptz) AS date_ge_timestamptz
        `;
        const res1 = await pool.query(query1);
        console.table(res1.rows);

        // 2. Query to see how dates are compared in the database
        const query2 = `
            SELECT 
                '2026-06-06'::date AS fecha_fin,
                CURRENT_DATE AS current_date,
                ('2026-06-06'::date >= CURRENT_DATE) AS date_ge_current_date
        `;
        const res2 = await pool.query(query2);
        console.table(res2.rows);

    } catch (e) {
        console.error("Error running test query:", e);
    } finally {
        await pool.end();
        process.exit();
    }
}
main();
