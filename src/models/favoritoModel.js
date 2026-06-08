const pool = require('../config/db');

const getFavoritosByUser = async (id_usuario) => {
    const result = await pool.query(
        `SELECT f.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.activo, 
                (SELECT url FROM imagen WHERE id_producto = p.id_producto LIMIT 1) as imagen_url
         FROM favorito f
         JOIN producto p ON f.id_producto = p.id_producto
         WHERE f.id_usuario = $1`,
        [id_usuario]
    );
    return result.rows;
};

const addFavorito = async (id_usuario, id_producto) => {
    try {
        await pool.query(
            'INSERT INTO favorito (id_usuario, id_producto) VALUES ($1, $2)',
            [id_usuario, id_producto]
        );
        return true;
    } catch (error) {
        // Puede fallar si ya existe o si viola FK
        return false;
    }
};

const removeFavorito = async (id_usuario, id_producto) => {
    await pool.query(
        'DELETE FROM favorito WHERE id_usuario = $1 AND id_producto = $2',
        [id_usuario, id_producto]
    );
    return true;
};

module.exports = {
    getFavoritosByUser,
    addFavorito,
    removeFavorito
};
