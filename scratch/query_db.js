require('dotenv').config();
const pool = require('../src/config/db');

async function main() {
    try {
        console.log("=== DEFINICION DE fn_restar_stock_compra ===");
        const { rows: functionDef } = await pool.query(`
            SELECT prosrc 
            FROM pg_proc 
            WHERE proname = 'fn_restar_stock_compra'
        `);
        if (functionDef.length > 0) {
            console.log(functionDef[0].prosrc);
        } else {
            console.log("Funcion fn_restar_stock_compra no encontrada.");
        }

        console.log("=== DEFINICION DE fn_validar_stock_antes_compra ===");
        const { rows: functionDef2 } = await pool.query(`
            SELECT prosrc 
            FROM pg_proc 
            WHERE proname = 'fn_validar_stock_antes_compra'
        `);
        if (functionDef2.length > 0) {
            console.log(functionDef2[0].prosrc);
        } else {
            console.log("Funcion fn_validar_stock_antes_compra no encontrada.");
        }

    } catch (e) {
        console.error("Error running query:", e);
    } finally {
        await pool.end();
    }
}

main();
