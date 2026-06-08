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

async function test() {
    try {
        // First, add product 26 to favorites
        console.log("Testing POST /api/favoritos...");
        let res = await fetch('http://localhost:3000/api/favoritos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_producto: 26 })
        });
        console.log("POST Status:", res.status);
        console.log("POST Response:", await res.text());

        // Second, get favorites
        console.log("Testing GET /api/favoritos...");
        res = await fetch('http://localhost:3000/api/favoritos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("GET Status:", res.status);
        console.log("GET Response:", await res.text());

        // Third, remove product 26 from favorites
        console.log("Testing DELETE /api/favoritos...");
        res = await fetch('http://localhost:3000/api/favoritos', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_producto: 26 })
        });
        console.log("DELETE Status:", res.status);
        console.log("DELETE Response:", await res.text());

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit();
    }
}
test();
