const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        const { nombre, apellido, email, telefono } = req.body;

        // Validar y normalizar formato de teléfono
        let normalizedTelefono = undefined;
        if (telefono !== undefined) {
            if (telefono === null || telefono.trim() === '') {
                normalizedTelefono = null; // Permitir borrar el teléfono
            } else {
                const cleanTel = telefono.replace(/\D/g, '');
                if (cleanTel.length !== 10) {
                    return res.status(400).json({ 
                        error: 'El teléfono debe tener exactamente 10 dígitos (ej: 3446-123456).' 
                    });
                }
                const invalidChars = telefono.replace(/[\d\s-]/g, '');
                if (invalidChars.length > 0) {
                    return res.status(400).json({
                        error: 'El teléfono solo puede contener números y guiones.'
                    });
                }
                normalizedTelefono = `${cleanTel.slice(0, 4)}-${cleanTel.slice(4)}`;
            }
        }

        const queryParams = [nombre || null, apellido || null, email || null];
        let queryStr = 'UPDATE usuario SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), email = COALESCE($3, email)';
        
        if (normalizedTelefono !== undefined) {
            queryParams.push(normalizedTelefono);
            queryStr += `, telefono = $4 WHERE id_usuario = $5`;
            queryParams.push(id_usuario);
        } else {
            queryStr += ` WHERE id_usuario = $4`;
            queryParams.push(id_usuario);
        }
        
        queryStr += ' RETURNING id_usuario, nombre, apellido, email, telefono, rol, id_direccion, fecha_registro, avatar_url';

        const result = await pool.query(queryStr, queryParams);

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

const registerUser = async (req, res) => {
    try {
        let { nombre, email, contrasena } = req.body;

        // 1. Sanitización básica
        nombre = nombre ? nombre.trim() : '';
        email = email ? email.trim().toLowerCase() : '';
        contrasena = contrasena ? contrasena.trim() : '';

        // 2. Validación de campos obligatorios
        if (!nombre || !email || !contrasena) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // 3. Validación estricta de Nombre (Letras, espacios, acentos, eñes de 2 a 50 caracteres)
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
        if (nombre.length < 2 || nombre.length > 50 || !regexNombre.test(nombre)) {
            return res.status(400).json({ 
                error: 'El nombre solo puede contener letras, espacios y guiones, con una longitud de 2 a 50 caracteres.' 
            });
        }

        // 4. Validación estricta de Correo Electrónico
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.length > 100 || !regexEmail.test(email)) {
            return res.status(400).json({ error: 'El correo electrónico provisto no es válido.' });
        }

        // 5. Validación estricta de Contraseña (Longitud de 6 a 50 caracteres)
        if (contrasena.length < 6 || contrasena.length > 50) {
            return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 50 caracteres.' });
        }

        // 6. Verificar si el correo ya está registrado
        const checkUser = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 7. Cifrar la contraseña de forma segura (Hash de un solo sentido con salt 10)
        const salt = await bcrypt.genSalt(10);
        const hashContrasena = await bcrypt.hash(contrasena, salt);

        // 8. Dividir nombre y apellido para compatibilidad con la tabla usuario
        const partes = nombre.split(/\s+/);
        const primerNombre = partes[0];
        const apellido = partes.length > 1 ? partes.slice(1).join(' ') : ' ';

        // 9. Registrar el usuario en la base de datos
        console.log("[Register] Registrando usuario por email:", email);
        const result = await pool.query(
            'INSERT INTO usuario (nombre, apellido, email, rol, contrasena) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, apellido, email, telefono, rol, fecha_registro, avatar_url',
            [primerNombre, apellido, email, 'usuario', hashContrasena]
        );

        const nuevoUsuario = result.rows[0];
        
        // 10. Firmar JWT
        const token = firmarToken(nuevoUsuario);

        return res.status(201).json({
            mensaje: 'Usuario registrado con éxito',
            usuario: nuevoUsuario,
            token
        });
    } catch (error) {
        console.error('Error crítico en registerUser:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al registrar el usuario' });
    }
};

const loginUser = async (req, res) => {
    try {
        let { email, contrasena } = req.body;

        // 1. Sanitización básica
        email = email ? email.trim().toLowerCase() : '';
        contrasena = contrasena ? contrasena.trim() : '';

        // 2. Validación de campos obligatorios
        if (!email || !contrasena) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // 3. Validación básica de formato de email
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
        }

        // 4. Buscar usuario en base de datos
        const userExist = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (userExist.rows.length === 0) {
            // Mensaje genérico por seguridad (evita la enumeración de emails registrados)
            return res.status(401).json({ error: 'El correo electrónico o la contraseña son incorrectos.' });
        }

        const usuario = userExist.rows[0];

        // 5. Verificar si el usuario está registrado con OAuth
        if (usuario.contrasena === 'OAUTH_USER') {
            return res.status(400).json({ 
                error: 'Este correo está asociado a un inicio de sesión de Google. Por favor, accedé pulsando "Continuar con Google".' 
            });
        }

        // 6. Comparar contraseña hasheada
        const matches = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!matches) {
            return res.status(401).json({ error: 'El correo electrónico o la contraseña son incorrectos.' });
        }

        // 7. Firmar JWT
        const token = firmarToken(usuario);

        // Limpiar contraseña del objeto devuelto
        const usuarioSanitizado = { ...usuario };
        delete usuarioSanitizado.contrasena;

        console.log("[Login] Inicio de sesión exitoso para:", email);
        return res.json({
            mensaje: 'Login exitoso',
            usuario: usuarioSanitizado,
            token
        });
    } catch (error) {
        console.error('Error crítico en loginUser:', error.message);
        res.status(500).json({ error: 'Error interno del servidor al procesar el inicio de sesión' });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { avatar_url } = req.body;

        if (!avatar_url) {
            return res.status(400).json({ error: 'avatar_url es requerido.' });
        }

        console.log("[Avatar] Actualizando avatar para usuario:", id_usuario, "a", avatar_url);
        const result = await pool.query(
            'UPDATE usuario SET avatar_url = $1 WHERE id_usuario = $2 RETURNING id_usuario, nombre, apellido, email, telefono, rol, id_direccion, fecha_registro, avatar_url',
            [avatar_url, id_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        return res.json({
            mensaje: 'Avatar actualizado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar avatar:', error.message);
        res.status(500).json({ error: 'Error interno al actualizar el avatar' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const id_usuario = req.usuario.id_usuario;
        let { contrasenaActual, contrasenaNueva, confirmarContrasena } = req.body;

        // Sanitización básica
        contrasenaActual = contrasenaActual ? contrasenaActual.trim() : '';
        contrasenaNueva = contrasenaNueva ? contrasenaNueva.trim() : '';
        confirmarContrasena = confirmarContrasena ? confirmarContrasena.trim() : '';

        if (!contrasenaActual || !contrasenaNueva || !confirmarContrasena) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        // Obtener la contraseña actual en la base de datos
        const userRes = await pool.query('SELECT contrasena FROM usuario WHERE id_usuario = $1', [id_usuario]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const usuario = userRes.rows[0];

        // Si es usuario de Google (OAuth)
        if (usuario.contrasena === 'OAUTH_USER') {
            return res.status(400).json({ 
                error: 'Las cuentas asociadas a Google no poseen contraseña local y no pueden modificarla.' 
            });
        }

        // Comparar contraseña actual ingresada con la de la base de datos
        const matches = await bcrypt.compare(contrasenaActual, usuario.contrasena);
        if (!matches) {
            return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta.' });
        }

        // Validar nueva contraseña
        if (contrasenaNueva.length < 6 || contrasenaNueva.length > 50) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener entre 6 y 50 caracteres.' });
        }

        if (contrasenaNueva !== confirmarContrasena) {
            return res.status(400).json({ error: 'La nueva contraseña y su confirmación no coinciden.' });
        }

        if (contrasenaActual === contrasenaNueva) {
            return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la contraseña actual.' });
        }

        // Hashear e insertar
        const salt = await bcrypt.genSalt(10);
        const hashContrasena = await bcrypt.hash(contrasenaNueva, salt);

        await pool.query('UPDATE usuario SET contrasena = $1 WHERE id_usuario = $2', [hashContrasena, id_usuario]);

        console.log(`[Password] Contraseña actualizada exitosamente para usuario ${id_usuario}`);
        return res.json({ mensaje: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error('Error al actualizar contraseña:', error.message);
        res.status(500).json({ error: 'Error interno al actualizar la contraseña' });
    }
};

module.exports = { loginOauth, updateProfile, registerUser, loginUser, updateAvatar, updatePassword };