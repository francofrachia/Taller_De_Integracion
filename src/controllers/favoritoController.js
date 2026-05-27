const favoritoModel = require('../models/favoritoModel');

const getFavoritos = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const favoritos = await favoritoModel.getFavoritosByUser(id_usuario);
        res.json({ favoritos });
    } catch (error) {
        console.error('Error getFavoritos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const addFavorito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto } = req.body;
        if (!id_producto) {
            return res.status(400).json({ error: 'id_producto es requerido' });
        }
        await favoritoModel.addFavorito(id_usuario, id_producto);
        res.json({ success: true, message: 'Producto agregado a favoritos' });
    } catch (error) {
        console.error('Error addFavorito:', error);
        res.status(500).json({ error: 'Error al agregar favorito' });
    }
};

const removeFavorito = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_producto } = req.body;
        if (!id_producto) {
            return res.status(400).json({ error: 'id_producto es requerido' });
        }
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
