const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones externas como Supabase
    }
});

pool.on('connect', () => {
    console.log('Conexión establecida con la base de datos en Supabase');
});

module.exports = pool;