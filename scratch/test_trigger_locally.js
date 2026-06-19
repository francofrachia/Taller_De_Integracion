const pool = require('../src/config/db');

async function testTrigger() {
  try {
    // 1. Get a product ID and its current stock
    const prodRes = await pool.query('SELECT id_producto, nombre, stock FROM producto WHERE activo = true LIMIT 1');
    if (prodRes.rows.length === 0) {
      console.log('No active products found.');
      process.exit(0);
    }
    const product = prodRes.rows[0];
    console.log(`Original: Product ID: ${product.id_producto}, Name: ${product.nombre}, Stock: ${product.stock}`);

    // 2. Insert a temporary test purchase
    await pool.query('BEGIN');
    
    // We insert into compra. Use a mock user ID, e.g. 3 or 4 which are valid users in DB
    const userRes = await pool.query('SELECT id_usuario FROM usuario LIMIT 1');
    const id_usuario = userRes.rows[0].id_usuario;
    
    const insertCompraQuery = `
      INSERT INTO compra (id_usuario, fecha, metodo_pago, estado, subtotal, total_descuento, total, id_pago_mp)
      VALUES ($1, CURRENT_TIMESTAMP, 'mercado_pago', 'Pago aprobado', 100, 0, 100, 'test-pago-trigger-id')
      RETURNING id_compra
    `;
    const resCompra = await pool.query(insertCompraQuery, [id_usuario]);
    const id_compra = resCompra.rows[0].id_compra;
    console.log(`Created test compra ID: ${id_compra}`);

    // Insert into linea_compra to trigger stock reduction
    const qtyToBuy = 2;
    const insertLineaQuery = `
      INSERT INTO linea_compra (id_compra, id_producto, cantidad, precio, id_promo)
      VALUES ($1, $2, $3, 100, NULL)
    `;
    await pool.query(insertLineaQuery, [id_compra, product.id_producto, qtyToBuy]);
    console.log(`Inserted line item for product ID: ${product.id_producto} with quantity: ${qtyToBuy}`);

    // 3. Query the product stock again to see if it was updated
    const prodResUpdated = await pool.query('SELECT stock FROM producto WHERE id_producto = $1', [product.id_producto]);
    const updatedStock = prodResUpdated.rows[0].stock;
    console.log(`Updated Stock in DB: ${updatedStock}`);
    console.log(`Expected Stock: ${product.stock - qtyToBuy}`);

    if (updatedStock === product.stock - qtyToBuy) {
      console.log('SUCCESS: Database trigger works perfectly!');
    } else {
      console.log('FAILURE: Stock was not updated by the trigger!');
    }

    // Rollback so we don't pollute the database
    await pool.query('ROLLBACK');
    console.log('Transaction rolled back successfully.');
  } catch (err) {
    console.error('Error testing trigger:', err);
  } finally {
    await pool.end();
  }
}

testTrigger();
