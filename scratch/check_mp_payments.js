require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

async function main() {
    try {
        const payment = new Payment(client);
        console.log("Fetching recent payments from Mercado Pago...");
        const response = await payment.search({
            options: {
                limit: 10,
                sort: 'date_created',
                criteria: 'desc'
            }
        });
        
        console.log("=== RECENT MP PAYMENTS ===");
        if (response.results && response.results.length > 0) {
            response.results.forEach(p => {
                console.log(`ID: ${p.id} | Status: ${p.status} | Status Detail: ${p.status_detail} | Date: ${p.date_created}`);
                console.log(`Metadata:`, JSON.stringify(p.metadata));
                console.log("-----------------------------------------");
            });
        } else {
            console.log("No payments found or response format mismatch.");
        }
        process.exit(0);
    } catch (e) {
        console.error("Error fetching payments:", e.message);
        process.exit(1);
    }
}
main();
