const pool = require('../src/config/db');
const Compra = require('../src/models/compraModel');

async function testGet() {
    try {
        console.log("Fetching purchases for customer (id_usuario = 2)...");
        const compras = await Compra.getByUserId(2);
        
        console.log("Successfully fetched!");
        compras.forEach(c => {
            console.log(`\nCompra #${c.id_compra}:`);
            console.log(`- Fecha: ${c.fecha}`);
            console.log(`- Estado: ${c.estado}`);
            console.log(`- Total: $${c.total}`);
            console.log(`- Código Seguimiento: ${c.codigo_seguimiento || 'N/A'}`);
            console.log(`- Items:`);
            c.lineas.forEach(l => {
                console.log(`  * [${l.nombre}] x${l.cantidad} - $${l.precio}`);
            });
        });
        
        process.exit(0);
    } catch(e) {
        console.error("Error fetching purchases:", e);
        process.exit(1);
    }
}

testGet();
