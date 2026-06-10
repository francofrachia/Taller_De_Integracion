const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminUser = {
    id_usuario: 1,
    rol: 'admin',
    email: 'admin@bloquemundo.com'
};

const token = jwt.sign(
    adminUser,
    process.env.JWT_SECRET || 'bloque_mundo_secret_token_firmas_2026_super_secure_key_123',
    { expiresIn: '8h' }
);

console.log("Token:", token);

// Make request to endpoint using fetch
async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/productos/admin', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
test();
