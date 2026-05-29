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

const getCategorias = async (req, res) => {
    try {
        const categorias = await Producto.getCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Error en getCategorias:', error);
        res.status(500).json({ error: 'Error al obtener categorías de Supabase' });
    }
};

const calificarProducto = async (req, res) => {
    try {
        const id_producto = parseInt(req.params.id);
        const id_usuario = req.usuario.id_usuario;
        const { puntaje, texto, anonimo } = req.body;

        if (puntaje === undefined || puntaje < 1 || puntaje > 5) {
            return res.status(400).json({ error: 'La calificación (puntaje) debe ser un número entero entre 1 y 5' });
        }

        const result = await Producto.addCalificacionYComentario(id_producto, id_usuario, puntaje, texto, anonimo);
        res.json({
            success: true,
            message: 'Calificación guardada correctamente',
            data: result
        });
    } catch (error) {
        console.error('Error en calificarProducto:', error);
        res.status(500).json({ error: error.message || 'Error al calificar el producto' });
    }
};

const checkReviewEligibility = async (req, res) => {
    try {
        const id_producto = parseInt(req.params.id);
        const id_usuario = req.usuario.id_usuario;

        const eligibility = await Producto.getReviewEligibility(id_producto, id_usuario);
        res.json(eligibility);
    } catch (error) {
        console.error('Error en checkReviewEligibility:', error);
        res.status(500).json({ error: 'Error al verificar la elegibilidad para calificar' });
    }
};

module.exports = { getProductos, getProductoById, getResenasByProductoId, getCategorias, calificarProducto, checkReviewEligibility };