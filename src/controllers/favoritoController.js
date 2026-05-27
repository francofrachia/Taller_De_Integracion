const favoritoModel = require('../models/favoritoModel');

const getFavoritos = async (req, res) => {
    const { id_usuario } = req.query;
    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario es requerido' });
    }
    try {
        const favoritos = await favoritoModel.getFavoritosByUser(id_usuario);
        res.json({ favoritos });
    } catch (error) {
        console.error('Error getFavoritos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const addFavorito = async (req, res) => {
    const { id_usuario, id_producto } = req.body;
    if (!id_usuario || !id_producto) {
        return res.status(400).json({ error: 'id_usuario y id_producto son requeridos' });
    }
    try {
        await favoritoModel.addFavorito(id_usuario, id_producto);
        res.json({ success: true, message: 'Producto agregado a favoritos' });
    } catch (error) {
        console.error('Error addFavorito:', error);
        res.status(500).json({ error: 'Error al agregar favorito' });
    }
};

const removeFavorito = async (req, res) => {
    const { id_usuario, id_producto } = req.body;
    if (!id_usuario || !id_producto) {
        return res.status(400).json({ error: 'id_usuario y id_producto son requeridos' });
    }
    try {
        await favoritoModel.removeFavorito(id_usuario, id_producto);
        res.json({ success: true, message: 'Producto eliminado de favoritos' });
    } catch (error) {
        console.error('Error removeFavorito:', error);
        res.status(500).json({ error: 'Error al eliminar favorito' });
    }
};

module.exports = {
    getFavoritos,
    addFavorito,
    removeFavorito
};
