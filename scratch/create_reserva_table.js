const pool = require('../src/config/db');

async function createReservaTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create the reserva_stock table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reserva_stock (
        id_reserva SERIAL PRIMARY KEY,
        id_usuario INTEGER REFERENCES usuario(id_usuario),
        id_producto INTEGER REFERENCES producto(id_producto),
        cantidad INTEGER NOT NULL,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
        mp_preference_id VARCHAR(255)
      );
    `);

    await client.query('COMMIT');
    console.log('Tabla reserva_stock creada exitosamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear tabla:', error);
  } finally {
    client.release();
    pool.end();
  }
}

createReservaTable();
