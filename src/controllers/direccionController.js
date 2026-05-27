const Direccion = require('../models/direccionModel');

// GET /api/direccion
const getDireccion = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const direccion = await Direccion.getByUserId(id_usuario);
        // Devuelve null si no tiene, sin error
        res.json({ direccion: direccion || null });
    } catch (error) {
        console.error('Error al obtener dirección:', error.message);
        res.status(500).json({ error: 'Error al obtener la dirección' });
    }
};

// GET /api/direccion/localidades
const getLocalidades = async (req, res) => {
    try {
        const localidades = await Direccion.getLocalidades();
        res.json(localidades);
    } catch (error) {
        console.error('Error al obtener localidades:', error.message);
        res.status(500).json({ error: 'Error al obtener localidades' });
    }
};

// POST /api/direccion
const saveDireccion = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { calle, numero, id_localidad } = req.body;

        if (!calle || !numero || !id_localidad) {
            return res.status(400).json({ error: 'Faltan campos obligatorios (calle, numero, id_localidad)' });
        }

        const numParsed = parseInt(numero, 10);
        if (isNaN(numParsed) || numParsed <= 0) {
            return res.status(400).json({ error: 'El número debe ser un valor numérico positivo' });
        }

        const direccion = await Direccion.updateForUser(id_usuario, {
            calle: calle.trim(),
            numero: numParsed,
            id_localidad: parseInt(id_localidad, 10)
        });

        res.json({ mensaje: 'Dirección guardada correctamente', direccion });
    } catch (error) {
        console.error('Error al guardar dirección:', error.message);
        res.status(500).json({ error: 'Error al guardar la dirección' });
    }
};

// DELETE /api/direccion
const deleteDireccion = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;

        const eliminada = await Direccion.deleteForUser(id_usuario);
        if (!eliminada) {
            return res.status(404).json({ error: 'El usuario no tiene una dirección registrada' });
        }
        res.json({ mensaje: 'Dirección eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar dirección:', error.message);
        res.status(500).json({ error: 'Error al eliminar la dirección' });
    }
};

module.exports = { getDireccion, getLocalidades, saveDireccion, deleteDireccion };
