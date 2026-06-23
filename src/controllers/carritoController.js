const Carrito = require('../models/carritoModel');
const Producto = require('../models/productoModel');

const getCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carrito.id_carrito);
        
        // Refrescamos el carrito de nuevo para obtener el total actualizado por los triggers
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);

        // Obtener reservas activas del usuario
        const pool = require('../config/db');
        const reservasResult = await pool.query(
            'SELECT id_producto, SUM(cantidad) as reservado FROM reserva_stock WHERE id_usuario = $1 AND fecha_expiracion > NOW() GROUP BY id_producto',
            [id_usuario]
        );
        const misReservas = {};
        reservasResult.rows.forEach(r => misReservas[r.id_producto] = parseInt(r.reservado, 10));

        res.json({
            id_carrito: carritoActualizado.id_carrito,
            total: carritoActualizado.total,
            items: items,
            mis_reservas: misReservas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

const addProducto = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto, cantidad } = req.body;
        
        if (!id_producto || cantidad === undefined || cantidad === null) {
            return res.status(400).json({ error: 'Faltan datos (id_producto, cantidad)' });
        }

        const qtyToAdd = parseInt(cantidad, 10);
        if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
            return res.status(400).json({ error: 'Cantidad inválida' });
        }

        const producto = await Producto.getById(id_producto);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        if (producto.activo === false) {
            return res.status(400).json({ error: 'El producto ha sido descontinuado' });
        }

        const pool = require('../config/db');
        const carrito = await Carrito.getOrCreateByUserId(id_usuario);

        const dbClient = await pool.connect();
        try {
            await dbClient.query('BEGIN');

            // Lockear fila del producto para evitar race condition entre requests simultáneos
            const { rows: stockRows } = await dbClient.query(
                'SELECT stock FROM producto WHERE id_producto = $1 FOR UPDATE',
                [id_producto]
            );
            const stockFisico = parseInt(stockRows[0].stock, 10);

            const checkCart = await dbClient.query(
                'SELECT cantidad FROM linea_carrito WHERE id_carrito = $1 AND id_producto = $2',
                [carrito.id_carrito, id_producto]
            );
            const currentQtyInCart = checkCart.rows.length > 0 ? parseInt(checkCart.rows[0].cantidad, 10) : 0;
            const targetQty = currentQtyInCart + qtyToAdd;

            const reservasResult = await dbClient.query(
                'SELECT COALESCE(SUM(cantidad), 0) as reservado FROM reserva_stock WHERE id_usuario = $1 AND id_producto = $2 AND fecha_expiracion > NOW()',
                [id_usuario, id_producto]
            );
            const userReservations = parseInt(reservasResult.rows[0].reservado || 0, 10);
            const realStockLimit = stockFisico + userReservations;

            if (targetQty > realStockLimit) {
                await dbClient.query('ROLLBACK');
                return res.status(400).json({ error: `Stock insuficiente. El stock máximo disponible es de ${realStockLimit} unidades.` });
            }

            const originalPrice = parseFloat(producto.precio) || 0;
            const discountPct = producto.descuento ? parseFloat(producto.descuento) : null;
            const finalPrice = discountPct ? (originalPrice * (1 - discountPct / 100)).toFixed(2) : originalPrice.toFixed(2);

            await Carrito.addItem(carrito.id_carrito, id_producto, qtyToAdd, finalPrice, dbClient);

            await dbClient.query('COMMIT');
        } catch (err) {
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            dbClient.release();
        }

        // Devolvemos el estado actualizado
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carritoActualizado.id_carrito);

        const allReservasResult = await require('../config/db').query(
            'SELECT id_producto, SUM(cantidad) as reservado FROM reserva_stock WHERE id_usuario = $1 AND fecha_expiracion > NOW() GROUP BY id_producto',
            [id_usuario]
        );
        const misReservas = {};
        allReservasResult.rows.forEach(r => misReservas[r.id_producto] = parseInt(r.reservado, 10));

        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items, mis_reservas: misReservas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al añadir al carrito' });
    }
};

const updateCantidad = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto, cantidad } = req.body;
        
        if (!id_producto || cantidad === undefined || cantidad === null) {
            return res.status(400).json({ error: 'Faltan datos (id_producto, cantidad)' });
        }

        const newQty = parseInt(cantidad, 10);
        if (isNaN(newQty) || newQty <= 0) {
            return res.status(400).json({ error: 'Cantidad inválida' });
        }

        const producto = await Producto.getById(id_producto);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

        if (producto.activo === false) {
            return res.status(400).json({ error: 'El producto ha sido descontinuado' });
        }

        const pool = require('../config/db');
        const carrito = await Carrito.getOrCreateByUserId(id_usuario);

        const dbClient = await pool.connect();
        try {
            await dbClient.query('BEGIN');

            // Lockear fila del producto para evitar race condition entre requests simultáneos
            const { rows: stockRows } = await dbClient.query(
                'SELECT stock FROM producto WHERE id_producto = $1 FOR UPDATE',
                [id_producto]
            );
            const stockFisico = parseInt(stockRows[0].stock, 10);

            const reservasResult = await dbClient.query(
                'SELECT COALESCE(SUM(cantidad), 0) as reservado FROM reserva_stock WHERE id_usuario = $1 AND id_producto = $2 AND fecha_expiracion > NOW()',
                [id_usuario, id_producto]
            );
            const userReservations = parseInt(reservasResult.rows[0].reservado || 0, 10);
            const realStockLimit = stockFisico + userReservations;

            if (newQty > realStockLimit) {
                await dbClient.query('ROLLBACK');
                return res.status(400).json({ error: `Stock insuficiente. El stock máximo disponible es de ${realStockLimit} unidades.` });
            }

            const originalPrice = parseFloat(producto.precio) || 0;
            const discountPct = producto.descuento ? parseFloat(producto.descuento) : null;
            const finalPrice = discountPct ? (originalPrice * (1 - discountPct / 100)).toFixed(2) : originalPrice.toFixed(2);

            await Carrito.updateItemQuantity(id_producto, carrito.id_carrito, newQty, finalPrice, dbClient);

            await dbClient.query('COMMIT');
        } catch (err) {
            await dbClient.query('ROLLBACK');
            throw err;
        } finally {
            dbClient.release();
        }

        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carritoActualizado.id_carrito);

        const allReservasResult = await require('../config/db').query(
            'SELECT id_producto, SUM(cantidad) as reservado FROM reserva_stock WHERE id_usuario = $1 AND fecha_expiracion > NOW() GROUP BY id_producto',
            [id_usuario]
        );
        const misReservas = {};
        allReservasResult.rows.forEach(r => misReservas[r.id_producto] = parseInt(r.reservado, 10));

        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items, mis_reservas: misReservas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
};

const removeProducto = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto } = req.body;
        
        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        await Carrito.removeItem(id_producto, carrito.id_carrito);
        
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carritoActualizado.id_carrito);
        
        // Obtener reservas activas del usuario
        const pool = require('../config/db');
        const reservasResult = await pool.query(
            'SELECT id_producto, SUM(cantidad) as reservado FROM reserva_stock WHERE id_usuario = $1 AND fecha_expiracion > NOW() GROUP BY id_producto',
            [id_usuario]
        );
        const misReservas = {};
        reservasResult.rows.forEach(r => misReservas[r.id_producto] = parseInt(r.reservado, 10));
        
        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items, mis_reservas: misReservas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

const clearCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        await Carrito.clearCart(carrito.id_carrito);
        
        res.json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al vaciar carrito' });
    }
};

module.exports = {
    getCarrito,
    addProducto,
    updateCantidad,
    removeProducto,
    clearCarrito
};
