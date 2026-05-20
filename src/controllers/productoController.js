const Producto = require('../models/productoModel');

const getProductos = async (req, res) => {
    try {
        const productos = await Producto.getAll();
        res.json(productos);
    } catch (error) {
        console.error('Error en getProductos:', error);
        res.status(500).json({ error: 'Error al obtener productos de Supabase' });
    }
};

const getProductoById = async (req, res) => {
    try {
        const producto = await Producto.getById(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('Error en getProductoById:', error);
        res.status(500).json({ error: 'Error al obtener producto de Supabase' });
    }
};

const getResenasByProductoId = async (req, res) => {
    try {
        const resenas = await Producto.getResenas(req.params.id);
        res.json(resenas);
    } catch (error) {
        console.error('Error en getResenasByProductoId:', error);
        res.status(500).json({ error: 'Error al obtener las reseñas del producto' });
    }
};

module.exports = { getProductos, getProductoById, getResenasByProductoId };