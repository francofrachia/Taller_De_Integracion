const pool = require('../config/db');

const getAllPromociones = async (req, res) => {
    try {
        const query = `
            SELECT p.*, prod.nombre as producto_nombre, cat.nombre as categoria_nombre
            FROM promocion p
            LEFT JOIN producto prod ON p.id_producto = prod.id_producto
            LEFT JOIN categoria cat ON p.id_categoria = cat.id_categoria
            ORDER BY p.id_promo DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener promociones:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las promociones.' });
    }
};

const createPromocion = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, porcentaje, id_producto, id_categoria, descripcion } = req.body;
        
        if (!porcentaje || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Faltan campos obligatorios (porcentaje, fechas).' });
        }

        if (!id_producto && !id_categoria) {
            return res.status(400).json({ error: 'Debe especificar un producto o una categoría para la promoción.' });
        }

        const query = `
            INSERT INTO promocion (fecha_inicio, fecha_fin, porcentaje, id_producto, id_categoria, descripcion)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [fecha_inicio, fecha_fin, porcentaje, id_producto || null, id_categoria || null, descripcion || '']);
        
        res.status(201).json({ mensaje: 'Promoción creada exitosamente', promocion: rows[0] });
    } catch (error) {
        console.error('Error al crear promoción:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear la promoción.' });
    }
};

const updatePromocion = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin, porcentaje, id_producto, id_categoria, descripcion } = req.body;

        const query = `
            UPDATE promocion
            SET fecha_inicio = COALESCE($1, fecha_inicio),
                fecha_fin = COALESCE($2, fecha_fin),
                porcentaje = COALESCE($3, porcentaje),
                id_producto = $4,
                id_categoria = $5,
                descripcion = COALESCE($6, descripcion)
            WHERE id_promo = $7
            RETURNING *
        `;
        const { rows } = await pool.query(query, [fecha_inicio, fecha_fin, porcentaje, id_producto || null, id_categoria || null, descripcion, id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }

        res.json({ mensaje: 'Promoción actualizada', promocion: rows[0] });
    } catch (error) {
        console.error('Error al actualizar promoción:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar la promoción.' });
    }
};

const deletePromocion = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM promocion WHERE id_promo = $1 RETURNING id_promo`;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }

        res.json({ mensaje: 'Promoción eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar promoción:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la promoción.' });
    }
};

module.exports = {
    getAllPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion
};
