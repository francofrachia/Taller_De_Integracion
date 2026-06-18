const pool = require('../config/db');

const Reserva = {
    crearReserva: async (id_usuario, id_producto, cantidad, mp_preference_id, ttlMinutos = 10) => {
        const query = `
            INSERT INTO reserva_stock (id_usuario, id_producto, cantidad, fecha_expiracion, mp_preference_id)
            VALUES ($1, $2, $3, NOW() + $4 * INTERVAL '1 minute', $5)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [id_usuario, id_producto, cantidad, ttlMinutos, mp_preference_id]);
        return rows[0];
    },

    // Retorna la cantidad de stock disponible (stock físico - stock reservado no expirado)
    getStockDisponible: async (id_producto) => {
        const query = `
            SELECT p.stock - COALESCE((
                SELECT SUM(cantidad) 
                FROM reserva_stock 
                WHERE id_producto = p.id_producto AND fecha_expiracion > NOW()
            ), 0) AS stock_disponible
            FROM producto p
            WHERE p.id_producto = $1
        `;
        const { rows } = await pool.query(query, [id_producto]);
        return rows[0] ? parseInt(rows[0].stock_disponible, 10) : 0;
    },

    limpiarReservasExpiradas: async () => {
        const query = `
            DELETE FROM reserva_stock 
            WHERE fecha_expiracion <= NOW()
            RETURNING id_producto, cantidad
        `;
        const { rows } = await pool.query(query);
        return rows; // Retorna los productos que se liberaron para emitir SSE
    },

    eliminarReserva: async (mp_preference_id) => {
        const query = `
            DELETE FROM reserva_stock 
            WHERE mp_preference_id = $1
            RETURNING id_producto, cantidad
        `;
        const { rows } = await pool.query(query, [mp_preference_id]);
        return rows;
    }
};

module.exports = Reserva;
