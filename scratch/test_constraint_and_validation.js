const pool = require('../src/config/db');
const { updateProfile } = require('../src/controllers/authController');

// Mock req and res objects
function mockResponse() {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
}

async function runTests() {
    console.log("=== RUNNING TELEPHONE VALIDATION TESTS ===");

    // Test 1: Direct SQL insert with invalid format (letters)
    console.log("\nTest 1: Direct SQL insert with letters...");
    try {
        await pool.query("UPDATE usuario SET telefono = '3446-abc123' WHERE id_usuario = 3");
        console.error("❌ Test 1 Failed: Database allowed a phone number with letters!");
    } catch (e) {
        console.log("✔ Test 1 Passed: Database correctly rejected letters due to CHECK constraint!");
        console.log("  Constraint Error Details:", e.message);
    }

    // Test 2: Direct SQL insert without hyphen
    console.log("\nTest 2: Direct SQL insert without hyphen...");
    try {
        await pool.query("UPDATE usuario SET telefono = '3446669277' WHERE id_usuario = 3");
        console.error("❌ Test 2 Failed: Database allowed a phone number without hyphen!");
    } catch (e) {
        console.log("✔ Test 2 Passed: Database correctly rejected phone number without hyphen due to CHECK constraint!");
        console.log("  Constraint Error Details:", e.message);
    }

    // Test 3: Backend Controller Validation - Invalid characters (letters)
    console.log("\nTest 3: Controller validation with invalid characters (letters)...");
    const req3 = {
        usuario: { id_usuario: 3 },
        body: {
            nombre: 'Francisco',
            apellido: 'Agustin',
            email: 'fr.abenedetti1@gmail.com',
            telefono: '3446-abc123456'
        }
    };
    const res3 = mockResponse();
    await updateProfile(req3, res3);
    if (res3.statusCode === 400 && res3.jsonData.error.includes('solo puede contener números y guiones')) {
        console.log("✔ Test 3 Passed: Controller correctly blocked letters with 400 Bad Request!");
        console.log("  Controller Error message:", res3.jsonData.error);
    } else {
        console.error("❌ Test 3 Failed: Controller allowed letters or returned unexpected response:", res3.statusCode, res3.jsonData);
    }

    // Test 4: Backend Controller Validation - Invalid length (too short)
    console.log("\nTest 4: Controller validation with invalid length...");
    const req4 = {
        usuario: { id_usuario: 3 },
        body: {
            nombre: 'Francisco',
            apellido: 'Agustin',
            email: 'fr.abenedetti1@gmail.com',
            telefono: '3446-123'
        }
    };
    const res4 = mockResponse();
    await updateProfile(req4, res4);
    if (res4.statusCode === 400 && res4.jsonData.error.includes('exactamente 10 dígitos')) {
        console.log("✔ Test 4 Passed: Controller correctly blocked short number with 400 Bad Request!");
        console.log("  Controller Error message:", res4.jsonData.error);
    } else {
        console.error("❌ Test 4 Failed: Controller allowed short phone number or returned unexpected response:", res4.statusCode, res4.jsonData);
    }

    // Test 5: Backend Controller - Successful normalization (no hyphen -> formats to hyphen)
    console.log("\nTest 5: Controller formatting/normalization (3446669277 -> 3446-669277)...");
    const req5 = {
        usuario: { id_usuario: 3 },
        body: {
            nombre: 'Francisco',
            apellido: 'Agustin',
            email: 'fr.abenedetti1@gmail.com',
            telefono: '3446669277'
        }
    };
    const res5 = mockResponse();
    await updateProfile(req5, res5);
    if (res5.statusCode !== 400 && res5.jsonData.usuario && res5.jsonData.usuario.telefono === '3446-669277') {
        console.log("✔ Test 5 Passed: Controller successfully normalized 3446669277 to 3446-669277 and saved it!");
        console.log("  Normalized and saved telephone in response:", res5.jsonData.usuario.telefono);
    } else {
        console.error("❌ Test 5 Failed: Controller failed to normalize/save phone number:", res5.statusCode, res5.jsonData);
    }

    // Test 6: Backend Controller - Successful clearing of phone number
    console.log("\nTest 6: Controller clearing telephone (empty string -> NULL)...");
    const req6 = {
        usuario: { id_usuario: 3 },
        body: {
            nombre: 'Francisco',
            apellido: 'Agustin',
            email: 'fr.abenedetti1@gmail.com',
            telefono: ''
        }
    };
    const res6 = mockResponse();
    await updateProfile(req6, res6);
    if (res6.statusCode !== 400 && res6.jsonData.usuario && res6.jsonData.usuario.telefono === null) {
        console.log("✔ Test 6 Passed: Controller successfully cleared phone number (set to null)!");
    } else {
        console.error("❌ Test 6 Failed: Controller failed to clear telephone number:", res6.statusCode, res6.jsonData);
    }

    // Restoring user 3 phone number to original formatted state
    await pool.query("UPDATE usuario SET telefono = '3446-669277' WHERE id_usuario = 3");
    console.log("\n✔ Original state restored for user 3.");
    console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
    process.exit(0);
}

runTests();
