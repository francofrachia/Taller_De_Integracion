const nodemailer = require('nodemailer');

// Configuramos el transporter usando las variables de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * Envía un comprobante de compra por email.
 * @param {string} emailDestino - El email del comprador.
 * @param {string} nombreUsuario - El nombre del comprador.
 * @param {Array} productos - Array de objetos { nombre, cantidad, precio }.
 * @param {number} total - Total de la compra.
 * @param {string} idCompra - ID de la orden o compra.
 */
const enviarComprobante = async (emailDestino, nombreUsuario, productos, total, idCompra) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn('Advertencia: Variables de entorno SMTP no configuradas. El correo no será enviado.');
            return;
        }

        const itemsHtml = productos.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.precio).toLocaleString('es-AR')}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Bloque Mundo" <${process.env.SMTP_EMAIL}>`,
            to: emailDestino,
            subject: `¡Gracias por tu compra en Bloque Mundo! - Orden #${idCompra}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #f15124; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0;">¡Compra Exitosa!</h1>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #333;">Hola <strong>${nombreUsuario}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Tu pago ha sido aprobado. Aquí tienes el detalle de tu compra:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Cantidad</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #f15124;">$${Number(total).toLocaleString('es-AR')}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <p style="font-size: 14px; color: #666; text-align: center;">ID de la Orden: #${idCompra}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 14px; color: #888; text-align: center; margin: 0;">Gracias por elegir Bloque Mundo.</p>
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Comprobante enviado a ${emailDestino} (Message ID: ${info.messageId})`);
    } catch (error) {
        console.error('[Email] Error al enviar el comprobante:', error);
    }
};

module.exports = {
    enviarComprobante
};
