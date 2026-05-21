const pool = require('../config/db');

class Carrito {
    // Obtener o crear un carrito para un usuario
    static async getOrCreateByUserId(id_usuario) {
        // Primero buscar si tiene un carrito activo
        const result = await pool.query('SELECT * FROM carrito WHERE id_usuario = $1', [id_usuario]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        
        // Si no tiene, crear uno nuevo
        const newCart = await pool.query(
            'INSERT INTO carrito (id_usuario, total) VALUES ($1, 0) RETURNING *',
            [id_usuario]
        );
        return newCart.rows[0];
    }

    static async getItems(id_carrito) {
        const result = await pool.query(`
            SELECT lc.id_producto, lc.cantidad, lc.precio, p.nombre, p.stock, array_remove(array_agg(i.url), NULL) AS imagenes
            FROM linea_carrito lc
            JOIN producto p ON lc.id_producto = p.id_producto
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE lc.id_carrito = $1
            GROUP BY lc.id_producto, lc.cantidad, lc.precio, p.nombre, p.stock
            ORDER BY lc.id_producto
        `, [id_carrito]);
        return result.rows;
    }

    // Añadir un producto al carrito
    static async addItem(id_carrito, id_producto, cantidad, precio) {
        // Verificar si el producto ya está en el carrito
        const check = await pool.query(
            'SELECT cantidad FROM linea_carrito WHERE id_carrito = $1 AND id_producto = $2',
            [id_carrito, id_producto]
        );

        if (check.rows.length > 0) {
            // Si ya existe, actualizar la cantidad
            const newCantidad = check.rows[0].cantidad + cantidad;
            const result = await pool.query(
                'UPDATE linea_carrito SET cantidad = $1 WHERE id_carrito = $2 AND id_producto = $3 RETURNING *',
                [newCantidad, id_carrito, id_producto]
            );
            return result.rows[0];
        } else {
            // Si no existe, insertar nueva línea
            const result = await pool.query(
                'INSERT INTO linea_carrito (id_carrito, id_producto, cantidad, precio) VALUES ($1, $2, $3, $4) RETURNING *',
                [id_carrito, id_producto, cantidad, precio]
            );
            return result.rows[0];
        }
    }

    // Actualizar cantidad de un item
    static async updateItemQuantity(id_producto, id_carrito, cantidad) {
        const result = await pool.query(
            'UPDATE linea_carrito SET cantidad = $1 WHERE id_producto = $2 AND id_carrito = $3 RETURNING *',
            [cantidad, id_producto, id_carrito]
        );
        return result.rows[0];
    }

    // Eliminar un item
    static async removeItem(id_producto, id_carrito) {
        const result = await pool.query(
            'DELETE FROM linea_carrito WHERE id_producto = $1 AND id_carrito = $2 RETURNING *',
            [id_producto, id_carrito]
        );
        return result.rows[0];
    }

    // Vaciar el carrito
    static async clearCart(id_carrito) {
        await pool.query('DELETE FROM linea_carrito WHERE id_carrito = $1', [id_carrito]);
        return true;
    }
}

module.exports = Carrito;
