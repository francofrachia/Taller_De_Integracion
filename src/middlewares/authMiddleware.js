const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ error: 'Acceso denegado. Token no provisto.' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET || 'bloque_mundo_secret_token_firmas_2026_super_secure_key_123');
        req.usuario = verificado; // Inyecta { id_usuario, rol, email }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = verificarToken;
