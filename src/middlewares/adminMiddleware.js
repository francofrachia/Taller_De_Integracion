const verificarAdmin = (req, res, next) => {
    // Este middleware debe ejecutarse SIEMPRE DESPUÉS de verificarToken
    if (!req.usuario) {
        return res.status(401).json({ error: 'Acceso denegado. No autenticado.' });
    }

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    next();
};

module.exports = verificarAdmin;
