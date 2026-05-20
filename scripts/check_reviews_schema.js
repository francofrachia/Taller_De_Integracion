const pool = require('../src/config/db');

async function checkReviewsSchema() {
  try {
    // Check view schema
    const viewRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vista_resenas_usuarios'
    `);
    console.log("=== vista_resenas_usuarios ===");
    console.table(viewRes.rows);

    // Check comentario schema
    const comRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'comentario'
    `);
    console.log("=== comentario ===");
    console.table(comRes.rows);
    
    // Check calificacion schema
    const calRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'calificacion'
    `);
    console.log("=== calificacion ===");
    console.table(calRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkReviewsSchema();
