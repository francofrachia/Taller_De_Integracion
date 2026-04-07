const pool = require('../config/db');

const loginOauth = async (req, res) => {
    const { email, nombre } = req.body; // Recibimos el nombre completo desde el Frontend

    try {
        // 2. Buscamos si el usuario ya existe en la tabla 'usuario'
        const userExist = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);

        if (userExist.rows.length > 0) {
            // Caso A: El usuario ya existe, devolvemos sus datos (Login)
            console.log("Usuario ya existente:", email);
            return res.json({
                mensaje: "Login exitoso",
                usuario: userExist.rows[0]
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

            return res.status(201).json({
                mensaje: "Usuario registrado con éxito",
                usuario: newUser.rows[0]
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