const pool = require('../src/config/db');
const Producto = require('../src/models/productoModel');

async function testEligibility() {
    try {
        console.log("=== STARTING REVIEW ELIGIBILITY TESTS ===");

        // Test 1: User 2 (Facundo) for product 17 (Bugs Bunny)
        // User 2 has purchased product 17 (Compra #2 has Bugs Bunny x1).
        // Let's check how many reviews User 2 has for product 17.
        console.log("\nTest 1: Check eligibility for User 2 (Facundo) on Product 17 (Bugs Bunny) - Has purchased.");
        const elig1 = await Producto.getReviewEligibility(17, 2);
        console.log("Eligibility:", elig1);
        console.log(`- Purchased Count: ${elig1.totalComprado}`);
        console.log(`- Review Count: ${elig1.totalResenas}`);
        console.log(`- Can Review? ${elig1.puedeResenar}`);
        
        // Test 2: User 2 (Facundo) for product 1 (Halcón Milenario)
        // User 2 HAS NOT purchased product 1.
        console.log("\nTest 2: Check eligibility for User 2 (Facundo) on Product 1 (Halcón Milenario) - Has NOT purchased.");
        const elig2 = await Producto.getReviewEligibility(1, 2);
        console.log("Eligibility:", elig2);
        console.log(`- Purchased Count: ${elig2.totalComprado}`);
        console.log(`- Review Count: ${elig2.totalResenas}`);
        console.log(`- Can Review? ${elig2.puedeResenar}`);

        // Test 3: Attempt to write review for unpurchased product 1
        console.log("\nTest 3: Attempting to submit review for unpurchased Product 1...");
        try {
            await Producto.addCalificacionYComentario(1, 2, 5, "Excelente set, muy recomendado!", false);
            console.error("❌ Test 3 Failed: Backend allowed submitting a review for an unpurchased product!");
        } catch (e) {
            console.log("✔ Test 3 Passed: Backend correctly blocked review submission for unpurchased product!");
            console.log("  Backend Error details:", e.message);
        }

        console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
        process.exit(0);
    } catch(e) {
        console.error("Error in tests:", e);
        process.exit(1);
    }
}

testEligibility();
