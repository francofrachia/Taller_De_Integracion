const pool = require('../src/config/db');

async function clean() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Verificando la existencia de la compra duplicada 40...");
        const { rows: compraRows } = await client.query('SELECT * FROM compra WHERE id_compra = 40');
        if (compraRows.length === 0) {
            console.log("La compra 40 no existe. ¿Ya fue eliminada?");
            await client.query('ROLLBACK');
            return;
        }

        console.log("Eliminando líneas de compra para id_compra = 40...");
        await client.query('DELETE FROM linea_compra WHERE id_compra = 40');

        console.log("Eliminando registro de compra para id_compra = 40...");
        await client.query('DELETE FROM compra WHERE id_compra = 40');

        console.log("Incrementando stock de Simba (id_producto = 24) por 2 unidades...");
        const { rows: updateRows } = await client.query(
            'UPDATE producto SET stock = stock + 2 WHERE id_producto = 24 RETURNING stock, nombre'
        );
        console.log(`Stock actualizado para ${updateRows[0].nombre}. Nuevo stock: ${updateRows[0].stock}`);

        await client.query('COMMIT');
        console.log("Transacción completada y base de datos saneada con éxito.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Error al limpiar la base de datos:", e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

clean();
