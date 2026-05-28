const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const pool = require('./config/db');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const direccionRoutes = require('./routes/direccionRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const compraRoutes = require('./routes/compraRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Portero estricto: Rate Limiting para auth y pagos
const limitadorSeguridad = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Máximo 50 peticiones por IP
    message: { error: 'Demasiadas peticiones desde esta dirección IP. Intenta de nuevo en 15 minutos.' }
});

// Middlewares
// Configuración de CORS dinámica y segura para localhost y túneles ngrok
const whitelist = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman o curl) y cualquier origen en la whitelist o ngrok
        if (!origin || whitelist.indexOf(origin) !== -1 || origin.includes('ngrok-free.app') || origin.includes('ngrok-free.dev') || origin.includes('ngrok.io')) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas de seguridad de CORS'));
        }
    },
    credentials: true,
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
app.use('/api/auth', authRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/direccion', direccionRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/compras', compraRoutes);

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