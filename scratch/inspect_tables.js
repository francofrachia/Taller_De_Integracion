const pool = require('../src/config/db');

async function check() {
  const tables = [
    'usuario', 'direccion', 'proveedor', 'categoria', 'producto', 
    'imagen', 'carrito', 'linea_carrito', 'compra', 'linea_compra', 
    'envio', 'comentario', 'calificacion', 'promocion', 'ingreso_producto'
  ];
  for (const t of tables) {
    try {
      const r = await pool.query(`SELECT COUNT(*) FROM "${t}"`);
      console.log(`${t}: ${r.rows[0].count} rows`);
    } catch(e) {
      console.log(`${t}: ERROR - ${e.message}`);
    }
  }
  process.exit(0);
}
check();
