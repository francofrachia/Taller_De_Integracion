const pool = require('../src/config/db');

async function checkData() {
  try {
    const enumQuery = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname IN ('metodo_pago_type', 'estado_compra_type', 'metodopago', 'estado', 'estado_type', 'metodo_pago', 'estado_compra')
    `);
    console.log('--- ENUM VALUES ---');
    console.table(enumQuery.rows);

    // If it doesn't match above, let's look for any user defined types in public
    const udtQuery = await pool.query(`
      SELECT n.nspname AS schema, t.typname AS type
      FROM pg_type t
      LEFT JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE (t.typtype = 'e')
    `);
    console.log('--- ALL ENUMS ---');
    console.table(udtQuery.rows);

    for (const row of udtQuery.rows) {
      const labels = await pool.query(`
        SELECT enumlabel FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1)
      `, [row.type]);
      console.log(`Enum ${row.type}:`, labels.rows.map(r => r.enumlabel));
    }

    const compraRows = await pool.query(`
      SELECT * FROM "compra" LIMIT 10
    `);
    console.log('--- COMPRAS ---');
    console.table(compraRows.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
