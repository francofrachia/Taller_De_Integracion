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
                COALESCE((SELECT ROUND(AVG(cal.puntaje), 1) FROM calificacion cal WHERE cal.id_producto = p.id_producto), 5.0) AS calificacion,
                COALESCE((
                    SELECT SUM(lc.cantidad) 
                    FROM linea_compra lc 
                    JOIN compra com ON lc.id_compra = com.id_compra 
                    WHERE lc.id_producto = p.id_producto AND com.estado NOT IN ('Esperando Pago', 'Cancelado')
                ), 0) AS ventas_totales
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN imagen i ON p.id_producto = i.id_producto
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
            LEFT JOIN calificacion cal ON c.id_calificacion = cal.id_calificacion
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
            ORDER BY c.nombre ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener elegibilidad de reseña para un usuario y producto
    getReviewEligibility: async (id_producto, id_usuario) => {
        // 1. Calcular total de unidades compradas en pedidos completados
        const purchasedQuery = `
            SELECT COALESCE(SUM(lc.cantidad), 0) AS total_comprado
            FROM compra c
            JOIN linea_compra lc ON c.id_compra = lc.id_compra
            WHERE c.id_usuario = $1 
              AND lc.id_producto = $2
              AND c.estado NOT IN ('Esperando Pago', 'Cancelado')
        `;
        const purchasedRes = await pool.query(purchasedQuery, [id_usuario, id_producto]);
        const totalComprado = parseInt(purchasedRes.rows[0].total_comprado, 10);

        // 2. Calcular total de reseñas ya escritas
        const reviewsQuery = `
            SELECT COUNT(*) AS total_resenas
            FROM calificacion
            WHERE id_usuario = $1 AND id_producto = $2
        `;
        const reviewsRes = await pool.query(reviewsQuery, [id_usuario, id_producto]);
        const totalResenas = parseInt(reviewsRes.rows[0].total_resenas, 10);

        return {
            comprado: totalComprado > 0,
            totalComprado,
            totalResenas,
            puedeResenar: totalResenas < totalComprado
        };
    },

    // Agregar nueva calificación y agregar comentario opcional
    addCalificacionYComentario: async (id_producto, id_usuario, puntaje, texto, anonimo) => {
        // Primero verificamos elegibilidad
        const eligibility = await Producto.getReviewEligibility(id_producto, id_usuario);
        if (!eligibility.puedeResenar) {
            throw new Error('No tenés permitido calificar este producto en este momento (debes comprarlo o ya calificaste todas tus compras).');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            let calificacion = null;
            let id_calificacion = null;
            if (puntaje !== undefined && puntaje !== null) {
                const calQuery = `
                    INSERT INTO calificacion (id_usuario, id_producto, puntaje, fecha)
                    VALUES ($1, $2, $3, NOW())
                    RETURNING *
                `;
                const calRes = await client.query(calQuery, [id_usuario, id_producto, puntaje]);
                calificacion = calRes.rows[0];
                id_calificacion = calificacion.id_calificacion;
            }

            let comentario = null;
            if (texto && texto.trim() !== '') {
                const insertQuery = `
                    INSERT INTO comentario (id_usuario, id_producto, texto, fecha, anonimo, id_calificacion)
                    VALUES ($1, $2, $3, NOW(), $4, $5)
                    RETURNING *
                `;
                const insertRes = await client.query(insertQuery, [id_usuario, id_producto, texto.trim(), anonimo || false, id_calificacion]);
                comentario = insertRes.rows[0];
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