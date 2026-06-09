const pool = require('../src/config/db');

async function main() {
    try {
        console.log("=== Testing Argentina Timezone Conversions ===");
        
        const query = `
            SELECT 
                NOW() AS utc_now,
                NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires' AS arg_now,
                (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date AS arg_date,
                -- Test a simulated UTC timestamp that is early June 7 UTC but late June 6 Argentina
                '2026-06-07 01:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires' AS test_arg_now,
                ('2026-06-07 01:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires')::date AS test_arg_date,
                ('2026-06-06'::date >= ('2026-06-07 01:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires')::date) AS active_at_22_arg,
                -- Test a simulated UTC timestamp that is early June 7 UTC and early June 7 Argentina
                '2026-06-07 04:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires' AS test_arg_now2,
                ('2026-06-07 04:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires')::date AS test_arg_date2,
                ('2026-06-06'::date >= ('2026-06-07 04:00:00+00'::timestamptz AT TIME ZONE 'America/Argentina/Buenos_Aires')::date) AS active_at_01_arg
        `;
        const res = await pool.query(query);
        console.table(res.rows);

    } catch (e) {
        console.error("Error running query:", e);
    } finally {
        await pool.end();
        process.exit();
    }
}
main();
