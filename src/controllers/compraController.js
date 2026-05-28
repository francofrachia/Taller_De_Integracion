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

module.exports = {
    getComprasUsuario
};
