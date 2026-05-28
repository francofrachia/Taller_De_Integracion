const pool = require('../config/db');

const Producto = {
    // Traer todos los productos con stock para el catálogo (CU03) + su imagen principal
    getAll: async () => {
        const query = `
            SELECT DISTINCT ON (p.id_producto) 
                p.*, 
                c.nombre AS categoria_nombre, 
                i.url AS imagen_url,
                COALESCE((SELECT COUNT(*) FROM comentario com WHERE com.id_producto = p.id_producto), 0) AS resenas,
                COALESCE((SELECT ROUND(AVG(cal.puntaje), 1) FROM calificacion cal WHERE cal.id_producto = p.id_producto), 5.0) AS calificacion
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
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
            SELECT 
                p.*, 
                c.nombre AS categoria_nombre, 
                array_remove(array_agg(i.url), NULL) AS imagenes,
                COALESCE((SELECT COUNT(*) FROM comentario com WHERE com.id_producto = p.id_producto), 0) AS resenas,
                COALESCE((SELECT ROUND(AVG(cal.puntaje), 1) FROM calificacion cal WHERE cal.id_producto = p.id_producto), 5.0) AS calificacion
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
            WHERE p.id_producto = $1
            GROUP BY p.id_producto, c.nombre
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
    },

    // Traer todas las categorías ordenadas alfabéticamente que tengan productos activos en stock
    getCategorias: async () => {
        const query = `
            SELECT DISTINCT c.* 
            FROM categoria c
            JOIN producto p ON c.id_categoria = p.id_categoria
            WHERE p.stock > 0
            ORDER BY c.nombre ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Agregar o actualizar calificación y agregar comentario opcional
    addCalificacionYComentario: async (id_producto, id_usuario, puntaje, texto, anonimo) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            let calificacion = null;
            if (puntaje !== undefined && puntaje !== null) {
                const calQuery = `
                    INSERT INTO calificacion (id_usuario, id_producto, puntaje, fecha)
                    VALUES ($1, $2, $3, NOW())
                    ON CONFLICT (id_usuario, id_producto)
                    DO UPDATE SET puntaje = EXCLUDED.puntaje, fecha = NOW()
                    RETURNING *
                `;
                const calRes = await client.query(calQuery, [id_usuario, id_producto, puntaje]);
                calificacion = calRes.rows[0];
            }

            let comentario = null;
            if (texto && texto.trim() !== '') {
                // Verificar si ya existe un comentario del usuario para este producto
                const checkQuery = `
                    SELECT id_comentario FROM comentario 
                    WHERE id_usuario = $1 AND id_producto = $2
                `;
                const checkRes = await client.query(checkQuery, [id_usuario, id_producto]);
                
                if (checkRes.rows.length > 0) {
                    // Si ya existe, actualizamos su texto, fecha y anonimato
                    const updateQuery = `
                        UPDATE comentario 
                        SET texto = $3, fecha = NOW(), anonimo = $4 
                        WHERE id_usuario = $1 AND id_producto = $2
                        RETURNING *
                    `;
                    const updateRes = await client.query(updateQuery, [id_usuario, id_producto, texto.trim(), anonimo || false]);
                    comentario = updateRes.rows[0];
                } else {
                    // Si no existe, lo creamos
                    const insertQuery = `
                        INSERT INTO comentario (id_usuario, id_producto, texto, fecha, anonimo)
                        VALUES ($1, $2, $3, NOW(), $4)
                        RETURNING *
                    `;
                    const insertRes = await client.query(insertQuery, [id_usuario, id_producto, texto.trim(), anonimo || false]);
                    comentario = insertRes.rows[0];
                }
            }

            await client.query('COMMIT');
            return { calificacion, comentario };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Producto;