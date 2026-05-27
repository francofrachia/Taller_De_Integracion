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

const updateProfile = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { nombre, apellido, email } = req.body;

        const result = await pool.query(
            'UPDATE usuario SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), email = COALESCE($3, email) WHERE id_usuario = $4 RETURNING id_usuario, nombre, apellido, email, telefono, rol, id_direccion, fecha_registro',
            [nombre || null, apellido || null, email || null, id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.json({
            mensaje: 'Perfil actualizado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error.message);
        res.status(500).json({ error: 'Error interno al actualizar el perfil' });
    }
};

module.exports = { loginOauth, updateProfile };