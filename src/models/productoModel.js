const pool = require('../config/db');

const Producto = {
    // Traer todos los productos con stock para el catálogo (CU03) + su imagen
    getAll: async () => {
        const query = `
            SELECT p.*, i.url AS imagen_url 
            FROM producto p
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE p.stock > 0
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Traer detalle de un producto específico (CU04) + su imagen
    getById: async (id) => {
        const query = `
            SELECT p.*, i.url AS imagen_url 
            FROM producto p
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE p.id_producto = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Producto;