const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pool = require('./config/db');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes'); // Ruta de autenticación
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Portero estricto: Rate Limiting para auth y pagos
const limitadorSeguridad = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Máximo 50 peticiones por IP
    message: { error: 'Demasiadas peticiones desde esta dirección IP. Intenta de nuevo en 15 minutos.' }
});

// Middlewares
// Configuración de CORS restringido
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Aplicar Rate Limiter a las rutas críticas
app.use('/api/auth', limitadorSeguridad);
app.use('/api/mercadopago/create_preference', limitadorSeguridad);

// Evita la pantalla de advertencia de ngrok en el navegador
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes); // Ruta de autenticación
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/carrito', carritoRoutes);

// Ruta de prueba para verificar que el servidor se lanzo
app.get('/', (req, res) => {
    res.send('API de Bloque Mundo funcionando correctamente');
});

// Endpoint de prueba para verificar conexión a Supabase
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Conectado', time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error al conectar con Supabase', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});