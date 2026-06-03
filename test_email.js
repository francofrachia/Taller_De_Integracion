require('dotenv').config();
const { enviarComprobante } = require('./src/utils/emailService');

async function testEmail() {
    console.log("Testeando envío de email...");
    console.log("SMTP_EMAIL configurado:", process.env.SMTP_EMAIL ? "SI" : "NO");
    console.log("SMTP_PASSWORD configurado:", process.env.SMTP_PASSWORD ? "SI" : "NO");
    
    // Si no hay variables, avisar
    if (!process.env.SMTP_EMAIL) {
        console.log("No se encontró SMTP_EMAIL en el .env");
        return;
    }

    const emailDestino = process.env.SMTP_EMAIL; // enviarselo a sí mismo para probar
    const nombreUsuario = "Usuario Prueba";
    const productos = [
        { nombre: "Producto Test 1", cantidad: 1, precio: 1500 },
        { nombre: "Producto Test 2", cantidad: 2, precio: 500 }
    ];
    const total = 2500;
    const idCompra = 999;

    console.log(`Intentando enviar a ${emailDestino}...`);
    
    try {
        await enviarComprobante(emailDestino, nombreUsuario, productos, total, idCompra);
        console.log("Prueba finalizada.");
    } catch (e) {
        console.error("Error en la prueba:", e);
    }
}

testEmail();
