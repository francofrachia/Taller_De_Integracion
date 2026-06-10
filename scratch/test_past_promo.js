const pool = require('../src/config/db');

async function main() {
    try {
        console.log("=== Inserting test promotion ===");
        // Insert a promo for product 23 from '2026-06-05' to '2026-06-06'
        const insertRes = await pool.query(`
            INSERT INTO promocion (fecha_inicio, fecha_fin, porcentaje, id_producto, descripcion)
            VALUES ('2026-06-05', '2026-06-06', 25, 23, 'Promo Test Pasada')
            RETURNING *
        `);
        const promo = insertRes.rows[0];
        console.log("Inserted promo:", promo);

        console.log("\n=== Checking if promo is active via getPromocionesVigentes ===");
        const activeRes = await pool.query(`
            SELECT id_promo, id_producto, porcentaje, fecha_inicio, fecha_fin, descripcion
            FROM promocion
            WHERE id_promo = $1 AND fecha_inicio <= NOW() AND fecha_fin >= NOW()
        `, [promo.id_promo]);
        console.log("Active count (getPromocionesVigentes):", activeRes.rows.length);

        console.log("\n=== Checking if discount is applied to product via getAll ===");
        const productRes = await pool.query(`
            SELECT p.id_producto, p.nombre,
                (
                    SELECT promo.porcentaje 
                    FROM promocion promo 
                    WHERE (promo.id_producto = p.id_producto OR promo.id_categoria = p.id_categoria)
                      AND promo.fecha_inicio <= NOW() 
                      AND promo.fecha_fin >= NOW()
                    ORDER BY promo.porcentaje DESC
                    LIMIT 1
                ) AS descuento
            FROM producto p
            WHERE p.id_producto = 23
        `);
        console.table(productRes.rows);

        // Delete the test promo
        await pool.query("DELETE FROM promocion WHERE id_promo = $1", [promo.id_promo]);
        console.log("Deleted test promo");

    } catch (e) {
        console.error("Error running test:", e);
    } finally {
        await pool.end();
        process.exit();
    }
}
main();
