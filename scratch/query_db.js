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

        console.log("\n=== DEFINICION DE fn_validar_stock (si existe) ===");
        const { rows: functionDef2 } = await pool.query(`
            SELECT prosrc 
            FROM pg_proc 
            WHERE proname = 'fn_validar_stock'
        `);
        if (functionDef2.length > 0) {
            console.log(functionDef2[0].prosrc);
        } else {
            const { rows: functions } = await pool.query(`
                SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace
            `);
            console.log("Todas las funciones en public:", functions.map(f => f.proname));
        }

    } catch (e) {
        console.error("Error running query:", e);
    } finally {
        await pool.end();
    }
}

main();
