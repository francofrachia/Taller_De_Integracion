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

module.exports = { getProductos };