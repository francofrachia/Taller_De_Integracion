const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const firmarToken = (usuario) => {
    return jwt.sign(
        { 
            id_usuario: usuario.id_usuario, 
            rol: usuario.rol, 
            email: usuario.email 
        },
        process.env.JWT_SECRET || 'bloque_mundo_secret_token_firmas_2026_super_secure_key_123',
        { expiresIn: '8h' }
    );
};

const loginOauth = async (req, res) => {
    const { email, nombre } = req.body; // Recibimos el nombre completo desde el Frontend

    try {
        // 2. Buscamos si el usuario ya existe en la tabla 'usuario'
        const userExist = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);

        if (userExist.rows.length > 0) {
            // Caso A: El usuario ya existe, devolvemos sus datos (Login) + Token
            const usuario = userExist.rows[0];
            console.log("Usuario ya existente:", email);
            
            const token = firmarToken(usuario);

            return res.json({
                mensaje: "Login exitoso",
                usuario,
                token
            });
        } else {
            // Caso B: El usuario es nuevo (Registro)
            const partes = nombre ? nombre.split(' ') : ['Usuario', 'Google'];
            const primerNombre = partes[0];
            const apellido = partes.length > 1 ? partes.slice(1).join(' ') : ' ';

            console.log("Registrando nuevo usuario:", email);

            // 3. Insertamos en la base de datos
            const newUser = await pool.query(
                'INSERT INTO usuario (nombre, apellido, email, rol, contrasena) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [primerNombre, apellido, email, 'usuario', 'OAUTH_USER']
            );

            const usuarioNuevo = newUser.rows[0];
            const token = firmarToken(usuarioNuevo);

            return res.status(201).json({
                mensaje: "Usuario registrado con éxito",
                usuario: usuarioNuevo,
                token
            });
        }
    } catch (error) {
        console.error("Error crítico en loginOauth:", error.message);

        res.status(500).json({
            error: "Error interno del servidor al procesar el login",
            detalle: error.message
        });
    }
};

module.exports = { loginOauth };