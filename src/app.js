const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const direccionRoutes = require('./routes/direccionRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

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