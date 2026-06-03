const Compra = require('../models/compraModel');

// GET /api/compras
const getComprasUsuario = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const compras = await Compra.getByUserId(id_usuario);
        res.json({ compras });
    } catch (error) {
        console.error('Error al obtener compras del usuario:', error.message);
        res.status(500).json({ error: 'Error al obtener el historial de compras' });
    }
};

const getAllCompras = async (req, res) => {
    try {
        const compras = await Compra.getAll();
        res.json({ compras });
    } catch (error) {
        console.error('Error al obtener todas las compras:', error.message);
        res.status(500).json({ error: 'Error al obtener las compras' });
    }
};

const updateCompraEstado = async (req, res) => {
    try {
        const id_compra = parseInt(req.params.id);
        const { estado } = req.body;
        
        if (!estado) {
            return res.status(400).json({ error: 'El estado es requerido' });
        }

        const compraActualizada = await Compra.updateEstado(id_compra, estado);
        if (!compraActualizada) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }
        res.json({ mensaje: 'Estado de compra actualizado', compra: compraActualizada });
    } catch (error) {
        console.error('Error al actualizar estado de compra:', error.message);
        res.status(500).json({ error: 'Error al actualizar el estado de la compra' });
    }
};

module.exports = {
    getComprasUsuario,
    getAllCompras,
    updateCompraEstado
};
