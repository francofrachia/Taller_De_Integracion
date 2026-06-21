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

        const validStates = [
            'Pendiente',
            'Pago aprobado',
            'En proceso',
            'Pedido despachado',
            'Finalizado',
            'Cancelado',
            'Rechazado',
            // Legacy / alternate statuses support
            'Esperando Pago',
            'Pago confirmado',
            'Preparando Pedido',
            'En manos del correo',
            'Enviado',
            'Entregado'
        ];
        if (!validStates.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${validStates.join(', ')}` });
        }

        // Obtener la compra para verificar su estado actual
        const compraExistente = await Compra.getById(id_compra);
        if (!compraExistente) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }

        const normalizedCurrentEstado = compraExistente.estado ? compraExistente.estado.trim().toLowerCase() : '';
        const normalizedNewEstado = estado.trim().toLowerCase();

        // 1. No permitir cambiar el estado si la compra ya está Cancelada o Rechazada
        if (normalizedCurrentEstado === 'cancelado' || normalizedCurrentEstado === 'rechazado') {
            return res.status(400).json({ error: 'No se puede modificar el estado de una compra ya cancelada o rechazada.' });
        }

        // 2. No permitir cambiar el estado a Cancelado o Rechazado
        if (normalizedNewEstado === 'cancelado' || normalizedNewEstado === 'rechazado') {
            return res.status(400).json({ error: 'No está permitido cancelar o rechazar una venta desde la administración.' });
        }

        const compraActualizada = await Compra.updateEstado(id_compra, estado);
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
