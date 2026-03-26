const pool = require('../config/db');

const Producto = {
    // Traer todos los productos con stock para el catálogo (CU03)
    getAll: async () => {
        const query = 'SELECT * FROM "producto" WHERE stock > 0';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Traer detalle de un producto específico (CU04)
    getById: async (id) => {
        const query = 'SELECT * FROM "producto" WHERE "idProducto" = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = Producto;