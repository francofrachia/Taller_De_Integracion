const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('./config/db');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes'); // Ruta de autenticación
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes) // Ruta de autenticación
app.use('/api/payments', paymentRoutes);

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