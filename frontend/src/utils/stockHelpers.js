/**
 * Calculates the real available stock for a product, taking into account
 * the user's active temporary stock reservations.
 * 
 * @param {object|number} productOrId - Product object or product ID.
 * @param {Array} databaseProducts - Array of products from backend catalog.
 * @param {object} cart - User's current cart object containing mis_reservas.
 * @returns {number} The maximum stock the user is allowed to purchase.
 */
export const getRealStock = (productOrId, databaseProducts, cart) => {
    const id_producto = typeof productOrId === 'object' && productOrId !== null
        ? (productOrId.id_producto || productOrId.id)
        : Number(productOrId);

    if (!id_producto) return 0;

    // Find the product in the global catalog state first
    const productData = databaseProducts ? databaseProducts.find(p => p.id_producto === id_producto) : null;
    
    // Determine the base available stock (already reduced by global reservations in DB)
    let baseStock = 0;
    if (productData) {
        baseStock = parseInt(productData.stock, 10);
    } else if (typeof productOrId === 'object' && productOrId !== null) {
        baseStock = parseInt(productOrId.stock, 10);
    }

    if (isNaN(baseStock)) baseStock = 0;

    // Add back this user's active reservation if present
    if (cart && cart.mis_reservas && cart.mis_reservas[id_producto]) {
        baseStock += parseInt(cart.mis_reservas[id_producto], 10);
    }

    return baseStock;
};
