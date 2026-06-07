require('dotenv').config();
const pool = require('./src/config/db');
pool.query('SELECT 1 WHERE $1 = ANY($2)', ['a', ['a', 'b']])
    .then(res => console.log('OK:', res.rowCount))
    .catch(e => console.log('ERR:', e.message))
    .finally(() => pool.end());
