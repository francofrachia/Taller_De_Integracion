const pool = require('../config/db');

const loginOauth = async (req, res) => {
    const { email, nombre } = req.body; // Franco te manda esto desde el front

    try {
        // 1. Buscamos si el usuario ya existe en TU tabla "Usuario"
        const userExist = await pool.query('SELECT * FROM "Usuario" WHERE email = $1', [email]);

        if (userExist.rows.length > 0) {
            // Si existe, solo devolvemos sus datos
            return res.json({ mensaje: "Login exitoso", usuario: userExist.rows[0] });
        } else {
            // 2. Si no existe (es la primera vez que entra con Google), lo insertamos
            const newUser = await pool.query(
                'INSERT INTO "Usuario" (nombre, email, rol) VALUES ($1, $2, $3) RETURNING *',
                [nombre, email, 'Cliente']
            );
            return res.status(201).json({ mensaje: "Usuario registrado", usuario: newUser.rows[0] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al procesar el login" });
    }
};

module.exports = { loginOauth };