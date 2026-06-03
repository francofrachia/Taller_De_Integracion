const pool = require('../config/db');

const Compra = {
    create: async (id_usuario, items, subtotal, total_descuento, total, metodo_pago = 'mercado_pago', estado = 'Pago confirmado') => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insert into compra
            const insertCompraQuery = `
                INSERT INTO compra (id_usuario, fecha, metodo_pago, estado, subtotal, total_descuento, total)
                VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6)
                RETURNING id_compra, fecha
            `;
            const resCompra = await client.query(insertCompraQuery, [
                id_usuario,
                metodo_pago,
                estado,
                subtotal,
                total_descuento,
                total
            ]);
            const id_compra = resCompra.rows[0].id_compra;
            const fecha = resCompra.rows[0].fecha;

            // 2. Insert into linea_compra for each item
            for (const item of items) {
                const insertLineaQuery = `
                    INSERT INTO linea_compra (id_compra, id_producto, cantidad, precio, id_promo)
                    VALUES ($1, $2, $3, $4, NULL)
                `;
                await client.query(insertLineaQuery, [
                    id_compra,
                    item.id_producto,
                    item.cantidad,
                    item.precio
                ]);
            }

            await client.query('COMMIT');
            return { success: true, id_compra, fecha };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    getByUserId: async (id_usuario) => {
        const queryCompras = `
            SELECT c.*, e.codigo_seguimiento
            FROM compra c
            LEFT JOIN envio e ON c.id_compra = e.id_compra
            WHERE c.id_usuario = $1
            ORDER BY c.fecha DESC
        `;
        const resCompras = await pool.query(queryCompras, [id_usuario]);

        const compras = [];
        for (const compra of resCompras.rows) {
            const queryLineas = `
                SELECT lc.*, p.nombre, (
                    SELECT i.url 
                    FROM imagen i 
                    WHERE i.id_producto = p.id_producto 
                    LIMIT 1
                ) AS imagen_url
                FROM linea_compra lc
                JOIN producto p ON lc.id_producto = p.id_producto
                WHERE lc.id_compra = $1
            `;
            const resLineas = await pool.query(queryLineas, [compra.id_compra]);
            compras.push({
                ...compra,
                lineas: resLineas.rows
            });
        }
        return compras;
    },

    // --- Admin Methods ---
    getAll: async () => {
        const queryCompras = `
            SELECT c.*, u.email as usuario_email, u.nombre as usuario_nombre, u.apellido as usuario_apellido
            FROM compra c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            ORDER BY c.fecha DESC
        `;
        const resCompras = await pool.query(queryCompras);
        
        const compras = [];
        for (const compra of resCompras.rows) {
            const queryLineas = `
                SELECT lc.*, p.nombre
                FROM linea_compra lc
                JOIN producto p ON lc.id_producto = p.id_producto
                WHERE lc.id_compra = $1
            `;
            const resLineas = await pool.query(queryLineas, [compra.id_compra]);
            compras.push({
                ...compra,
                lineas: resLineas.rows
            });
        }
        return compras;
    },

    updateEstado: async (id_compra, estado) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Si el estado es Cancelado, deberíamos restaurar el stock
            if (estado === 'Cancelado') {
                const checkEstado = await client.query('SELECT estado FROM compra WHERE id_compra = $1', [id_compra]);
                if (checkEstado.rows.length > 0 && checkEstado.rows[0].estado !== 'Cancelado') {
                    // Restaurar stock
                    const lineas = await client.query('SELECT id_producto, cantidad FROM linea_compra WHERE id_compra = $1', [id_compra]);
                    for (const linea of lineas.rows) {
                        await client.query('UPDATE producto SET stock = stock + $1 WHERE id_producto = $2', [linea.cantidad, linea.id_producto]);
                    }
                }
            }

            const query = `
                UPDATE compra
                SET estado = $1
                WHERE id_compra = $2
                RETURNING *
            `;
            const res = await client.query(query, [estado, id_compra]);
            
            await client.query('COMMIT');
            return res.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Compra;
