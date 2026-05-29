const pool = require('../src/config/db');

async function checkColumns() {
  const tables = [
    'usuario', 'direccion', 'proveedor', 'categoria', 'producto', 
    'imagen', 'carrito', 'linea_carrito', 'compra', 'linea_compra', 
    'envio', 'comentario', 'calificacion', 'promocion', 'ingreso_producto'
  ];
  for (const t of tables) {
    try {
      const r = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [t]);
      console.log(`\n=== Table "${t}" ===`);
      console.table(r.rows.map(col => ({
        column: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable
      })));
    } catch(e) {
      console.log(`Table "${t}": ERROR - ${e.message}`);
    }
  }
  process.exit(0);
}
checkColumns();
