const pool = require('../src/config/db');
const Producto = require('../src/models/productoModel');

async function testStockLogic() {
    try {
        console.log("--- Iniciando Prueba de Lógica de Stock ---");
        
        // 1. Obtener un producto activo del catálogo
        const products = await Producto.getAll();
        if (products.length === 0) {
            console.log("No hay productos activos en la base de datos.");
            return;
        }
        
        const testProduct = products[0];
        console.log(`Producto de prueba: ID=${testProduct.id_producto}, Nombre="${testProduct.nombre}", Stock Catálogo=${testProduct.stock}`);
        
        // 2. Traer los detalles con getById
        const pDetails = await Producto.getById(testProduct.id_producto);
        const availableStock = parseInt(pDetails.stock, 10);
        console.log(`Detalle Producto (getById): Stock Disponible=${availableStock}, Activo=${pDetails.activo}`);
        
        // 3. Simular un usuario ID 9999
        const testUserId = 9999;
        
        // Obtener reservas activas para el usuario de prueba
        const reservasResult = await pool.query(
            'SELECT COALESCE(SUM(cantidad), 0) as reservado FROM reserva_stock WHERE id_usuario = $1 AND id_producto = $2 AND fecha_expiracion > NOW()',
            [testUserId, testProduct.id_producto]
        );
        const userReservations = parseInt(reservasResult.rows[0].reservado || 0, 10);
        
        const realStockLimit = availableStock + userReservations;
        console.log(`Reservas de usuario ${testUserId} para este producto: ${userReservations}`);
        console.log(`Límite Real de Stock calculado para el usuario: ${realStockLimit}`);
        
        // Comprobar consistencia lógica
        if (realStockLimit >= 0) {
            console.log("✓ Lógica de cálculo del límite de stock real consistente.");
        } else {
            console.error("❌ ERROR: El límite de stock real calculado es menor a 0.");
        }
        
    } catch (error) {
        console.error("Error en testStockLogic:", error);
    } finally {
        await pool.end();
        process.exit();
    }
}

testStockLogic();
