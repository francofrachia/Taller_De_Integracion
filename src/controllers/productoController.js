const Producto = require('../models/productoModel');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const getProductos = async (req, res) => {
    try {
        const productos = await Producto.getAll();
        res.json(productos);
    } catch (error) {
        console.error('Error en getProductos:', error);
        res.status(500).json({ error: 'Error al obtener productos de Supabase' });
    }
};

const getProductosAdmin = async (req, res) => {
    try {
        const productos = await Producto.getAllAdmin();
        res.json(productos);
    } catch (error) {
        console.error('Error en getProductosAdmin:', error);
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

const getPromociones = async (req, res) => {
    try {
        const promociones = await Producto.getPromocionesVigentes();
        res.json(promociones);
    } catch (error) {
        console.error('Error en getPromociones:', error);
        res.status(500).json({ error: 'Error al obtener promociones de Supabase' });
    }
};

const createProducto = async (req, res) => {
    try {
        const data = req.body;
        
        if (data.precio) data.precio = data.precio.toString().replace(',', '.');

        if (!data.nombre || !data.precio || !data.stock || !data.id_categoria) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }
        if (data.precio <= 0) return res.status(400).json({ error: 'El precio debe ser mayor a 0.' });
        if (data.stock < 0) return res.status(400).json({ error: 'El stock no puede ser negativo.' });

        const urlsImagenes = [];
        if (req.files && req.files.length > 0) {
            const uploadDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (const file of req.files) {
                const nombreArchivo = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.webp`;
                const rutaDestino = path.join(uploadDir, nombreArchivo);
                
                await sharp(file.buffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(rutaDestino);
                
                urlsImagenes.push(`/uploads/${nombreArchivo}`);
            }
        }

        const nuevoProducto = await Producto.create(data, urlsImagenes);
        const sseController = require('../utils/sseController');
        sseController.broadcastStockUpdate(nuevoProducto.id_producto);
        res.status(201).json({ mensaje: 'Producto creado', producto: nuevoProducto });
    } catch (error) {
        console.error('Error en createProducto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

const updateProducto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        
        if (data.precio) data.precio = data.precio.toString().replace(',', '.');
        if (data.edad_recomendada === '') data.edad_recomendada = null;
        if (data.stock === '') data.stock = 0;
        
        if (data.precio !== undefined && data.precio <= 0) return res.status(400).json({ error: 'El precio debe ser mayor a 0.' });
        if (data.stock !== undefined && data.stock < 0) return res.status(400).json({ error: 'El stock no puede ser negativo.' });

        let imagenes_a_borrar = [];
        if (data.imagenes_a_borrar) {
            try {
                imagenes_a_borrar = JSON.parse(data.imagenes_a_borrar);
            } catch (e) {
                console.error("Error parseando imagenes_a_borrar", e);
            }
        }

        const urlsImagenes = [];
        if (req.files && req.files.length > 0) {
            const uploadDir = path.join(__dirname, '../public/uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (const file of req.files) {
                const nombreArchivo = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}.webp`;
                const rutaDestino = path.join(uploadDir, nombreArchivo);
                
                await sharp(file.buffer)
                    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(rutaDestino);
                
                urlsImagenes.push(`/uploads/${nombreArchivo}`);
            }
        }

        const productoActualizado = await Producto.update(id, data, urlsImagenes, imagenes_a_borrar);
        if (!productoActualizado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const sseController = require('../utils/sseController');
        sseController.broadcastStockUpdate(id);
        res.json({ mensaje: 'Producto actualizado', producto: productoActualizado });
    } catch (error) {
        console.error('Error en updateProducto:', error);
        require('fs').writeFileSync('error_log.txt', error.toString() + '\\n' + error.stack);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

const deleteProducto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await Producto.delete(id);
        if (!result) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        const sseController = require('../utils/sseController');
        sseController.broadcastStockUpdate(id);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error en deleteProducto:', error);
        // Podría fallar por FK constraints (ej. líneas de compra asociadas).
        res.status(500).json({ error: 'Error al eliminar el producto. Asegúrese de que no tenga compras asociadas.' });
    }
};

const createCategoria = async (req, res) => {
    try {
        const data = req.body;
        if (!data.nombre) return res.status(400).json({ error: 'El nombre es obligatorio.' });
        const nuevaCategoria = await Producto.createCategoria(data);
        res.status(201).json({ mensaje: 'Categoría creada', categoria: nuevaCategoria });
    } catch (error) {
        console.error('Error en createCategoria:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

const getAllCategoriasAdmin = async (req, res) => {
    try {
        const categorias = await Producto.getAllCategoriasAdmin();
        res.json(categorias);
    } catch (error) {
        console.error('Error en getAllCategoriasAdmin:', error);
        res.status(500).json({ error: 'Error al obtener categorías completas' });
    }
};

const updateCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        if (!data.nombre) return res.status(400).json({ error: 'El nombre es obligatorio.' });
        const catActualizada = await Producto.updateCategoria(id, data);
        if (!catActualizada) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json({ mensaje: 'Categoría actualizada', categoria: catActualizada });
    } catch (error) {
        console.error('Error en updateCategoria:', error);
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

const deleteCategoria = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await Producto.deleteCategoria(id);
        if (!result) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json({ mensaje: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error en deleteCategoria:', error);
        res.status(500).json({ error: 'Error al eliminar categoría. Asegúrese de que no tenga productos o promociones asignadas.' });
    }
};

module.exports = { 
    getProductos, 
    getProductoById, 
    getResenasByProductoId, 
    getCategorias, 
    calificarProducto, 
    checkReviewEligibility, 
    getPromociones,
    createProducto,
    updateProducto,
    deleteProducto,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getAllCategoriasAdmin,
    getProductosAdmin
};