const pool = require('../src/config/db');

async function alterEnum() {
  try {
    console.log("Intentando agregar 'Pago aprobado' al enum estado_compra...");
    // ALTER TYPE enum_name ADD VALUE 'new_value' cannot run inside a transaction block.
    // pool.query() runs without transaction by default.
    await pool.query("ALTER TYPE estado_compra ADD VALUE 'Pago aprobado'");
    console.log("SUCCESS: 'Pago aprobado' agregado exitosamente al enum estado_compra.");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log("El valor 'Pago aprobado' ya existía en el enum.");
    } else {
      console.error("Error al alterar enum:", e.message);
    }
  } finally {
    await pool.end();
  }
}

alterEnum();
