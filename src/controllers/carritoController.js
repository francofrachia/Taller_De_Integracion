const Carrito = require('../models/carritoModel');
const Producto = require('../models/productoModel');

const getCarrito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carrito.id_carrito);
        
        // Refrescamos el carrito de nuevo para obtener el total actualizado por los triggers
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);

        res.json({
            id_carrito: carritoActualizado.id_carrito,
            total: carritoActualizado.total,
            items: items
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
        
        if (!id_producto || !cantidad) {
            return res.status(400).json({ error: 'Faltan datos (id_producto, cantidad)' });
        }

        const producto = await Producto.getById(id_producto);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        
        if (producto.stock > 0 && cantidad > producto.stock) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        const originalPrice = parseFloat(producto.precio) || 0;
        const discountPct = producto.descuento ? parseFloat(producto.descuento) : null;
        const finalPrice = discountPct ? (originalPrice * (1 - discountPct / 100)).toFixed(2) : originalPrice.toFixed(2);

        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        await Carrito.addItem(carrito.id_carrito, id_producto, cantidad, finalPrice);
        
        // Devolvemos el estado actualizado
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carritoActualizado.id_carrito);
        
        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al añadir al carrito' });
    }
};

const updateCantidad = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto, cantidad } = req.body;
        
        const carrito = await Carrito.getOrCreateByUserId(id_usuario);
        await Carrito.updateItemQuantity(id_producto, carrito.id_carrito, cantidad);
        
        const carritoActualizado = await Carrito.getOrCreateByUserId(id_usuario);
        const items = await Carrito.getItems(carritoActualizado.id_carrito);
        
        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items });
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
        
        res.json({ id_carrito: carritoActualizado.id_carrito, total: carritoActualizado.total, items });
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
