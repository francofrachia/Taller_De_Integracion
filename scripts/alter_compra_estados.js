const pool = require('../src/config/db');

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log("=== INICIANDO MIGRACIÓN PARA DEPURAR EL ENUM ESTADO_COMPRA ===");

    // 1. Quitar el default actual de la columna
    console.log("1. Quitando default actual de compra.estado...");
    await client.query('ALTER TABLE compra ALTER COLUMN estado DROP DEFAULT');

    // 2. Renombrar el enum existente a estado_compra_old
    console.log("2. Renombrando enum estado_compra a estado_compra_old...");
    await client.query('ALTER TYPE estado_compra RENAME TO estado_compra_old');

    // 3. Crear el nuevo tipo enum limpio sin 'Cancelado'
    console.log("3. Creando el nuevo tipo enum estado_compra...");
    await client.query(`
      CREATE TYPE estado_compra AS ENUM (
        'Pendiente',
        'Pago aprobado',
        'En proceso',
        'Pedido despachado',
        'Finalizado',
        'Rechazado'
      )
    `);

    // 4. Actualizar todos los registros existentes en 'compra' a los nuevos valores normalizados
    console.log("4. Normalizando valores de compras existentes en base de datos...");
    await client.query("UPDATE compra SET estado = 'Pendiente'::text::estado_compra_old WHERE estado::text = 'Esperando Pago'");
    await client.query("UPDATE compra SET estado = 'Pago aprobado'::text::estado_compra_old WHERE estado::text = 'Pago confirmado'");
    await client.query("UPDATE compra SET estado = 'En proceso'::text::estado_compra_old WHERE estado::text = 'Preparando Pedido'");
    await client.query("UPDATE compra SET estado = 'Pedido despachado'::text::estado_compra_old WHERE estado::text IN ('Pedido Despachado', 'En manos del correo')");
    await client.query("UPDATE compra SET estado = 'Rechazado'::text::estado_compra_old WHERE estado::text = 'Cancelado'");

    // 5. Cambiar el tipo de la columna en 'compra' al nuevo enum
    console.log("5. Cambiando tipo de columna compra.estado al nuevo enum...");
    await client.query('ALTER TABLE compra ALTER COLUMN estado TYPE estado_compra USING estado::text::estado_compra');

    // 6. Establecer el nuevo default de la columna a 'Pendiente'
    console.log("6. Estableciendo nuevo default a 'Pendiente'::estado_compra...");
    await client.query("ALTER TABLE compra ALTER COLUMN estado SET DEFAULT 'Pendiente'::estado_compra");

    // 7. Eliminar el enum viejo
    console.log("7. Eliminando enum viejo estado_compra_old...");
    await client.query('DROP TYPE estado_compra_old');

    await client.query('COMMIT');
    console.log("✓ MIGRACIÓN COMPLETADA EXITOSAMENTE Y TRANSACCIÓN CONSOLIDADA.");
    process.exit(0);
  } catch (err) {
    console.error("✗ Error durante la migración (se realizará ROLLBACK):", err.message);
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      console.error("Error al hacer ROLLBACK:", e.message);
    }
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
