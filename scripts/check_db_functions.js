const pool = require('../src/config/db');

async function getDBObjects() {
  try {
    // Buscar triggers
    console.log("=== TRIGGERS ===");
    const triggers = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);
    console.table(triggers.rows);

    // Buscar funciones/procedimientos
    console.log("\n=== FUNCIONES / PROCEDIMIENTOS ===");
    const funcs = await pool.query(`
      SELECT routine_name, routine_type, data_type as return_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
    `);
    console.table(funcs.rows);

    // Buscar detalles de una función en particular si parece relevante al carrito
    for (const f of funcs.rows) {
      if (f.routine_name.includes('carrito') || f.routine_name.includes('total')) {
        const details = await pool.query(`
          SELECT pg_get_functiondef(p.oid) as def
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = $1 AND n.nspname = 'public'
        `, [f.routine_name]);
        console.log(`\nDefinición de ${f.routine_name}:`);
        console.log(details.rows[0]?.def);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

getDBObjects();
