const pool = require('../config/db');

const Producto = {
    // Traer todos los productos con stock para el catálogo (CU03) + su imagen principal
    getAll: async () => {
        const query = `
            SELECT DISTINCT ON (p.id_producto) p.*, i.url AS imagen_url 
            FROM producto p
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE p.stock > 0
            ORDER BY p.id_producto, i.url ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Traer detalle de un producto específico (CU04) + TODAS sus imágenes
    getById: async (id) => {
        const query = `
            SELECT p.*, array_remove(array_agg(i.url), NULL) AS imagenes 
            FROM producto p
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE p.id_producto = $1
            GROUP BY p.id_producto
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Traer las reseñas de un producto
    getResenas: async (id) => {
        const query = `
            SELECT 
                c.id_comentario, 
                c.texto, 
                c.fecha, 
                u.nombre AS autor_nombre, 
                u.apellido AS autor_apellido, 
                cal.puntaje,
                c.anonimo
            FROM comentario c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            LEFT JOIN calificacion cal ON (c.id_usuario = cal.id_usuario AND c.id_producto = cal.id_producto)
            WHERE c.id_producto = $1
            ORDER BY c.fecha DESC
        `;
        const { rows } = await pool.query(query, [id]);
        return rows;
    },

    // Actualizar stock de un producto
    updateStock: async (id, quantity) => {
        const query = `
            UPDATE producto 
            SET stock = stock - $2 
            WHERE id_producto = $1 AND stock >= $2
            RETURNING stock
        `;
        const { rows } = await pool.query(query, [id, quantity]);
        return rows[0];
    }
};

module.exports = Producto;