const pool = require('../src/config/db');

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Starting database seeding process...");

        // 1. Clean up existing transaction and user tables safely
        console.log("1. Truncating old transaction, user and address tables...");
        await client.query(`
            TRUNCATE TABLE 
                calificacion, 
                comentario, 
                linea_carrito, 
                carrito, 
                envio, 
                linea_compra, 
                compra, 
                ingreso_producto, 
                promocion, 
                usuario, 
                direccion 
            RESTART IDENTITY CASCADE;
        `);
        console.log("✔ Cleared tables and reset sequences.");

        // 2. Insert premium seed addresses
        console.log("2. Inserting addresses linked to Entre Ríos cities...");
        const addresses = [
            { id: 1, calle: 'Urquiza', numero: 425, id_localidad: 1 }, // Larroque
            { id: 2, calle: '9 de Julio', numero: 1230, id_localidad: 2 }, // Concepción del Uruguay
            { id: 3, calle: '25 de Mayo', numero: 880, id_localidad: 3 } // Gualeguaychú
        ];

        for (const addr of addresses) {
            await client.query(`
                INSERT INTO direccion (id_direccion, calle, numero, id_localidad)
                VALUES ($1, $2, $3, $4);
            `, [addr.id, addr.calle, addr.numero, addr.id_localidad]);
        }
        // Sync sequence
        await client.query(`SELECT setval('direccion_id_direccion_seq', 3, true);`);
        console.log("✔ Seeded addresses successfully.");

        // 3. Insert users with hashed passwords (password: guest123)
        console.log("3. Inserting users...");
        const hashedPw = '$2b$10$A4PhIjT4WzEjhGz7uwfhEe8WcKM.3SexlsuIrdqqeJFb8PjYlsOCm'; // guest123

        const users = [
            {
                id: 1,
                nombre: 'Admin',
                apellido: 'BloqueMundo',
                email: 'admin@bloquemundo.com',
                contrasena: hashedPw,
                telefono: '3446-999999',
                rol: 'administrador',
                id_direccion: 2
            },
            {
                id: 2,
                nombre: 'Facundo',
                apellido: 'Taller',
                email: 'facu@taller.com',
                contrasena: hashedPw,
                telefono: '3446-654321',
                rol: 'usuario',
                id_direccion: 3
            },
            {
                id: 9999, // Standard Guest User
                nombre: 'Invitado',
                apellido: 'BloqueMundo',
                email: 'guest@bloquemundo.com',
                contrasena: hashedPw,
                telefono: '3446-123456',
                rol: 'usuario',
                id_direccion: 1
            }
        ];

        for (const u of users) {
            await client.query(`
                INSERT INTO usuario (id_usuario, nombre, apellido, email, contrasena, telefono, rol, id_direccion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `, [u.id, u.nombre, u.apellido, u.email, u.contrasena, u.telefono, u.rol, u.id_direccion]);
        }
        // Sync sequence
        await client.query(`SELECT setval('usuario_id_usuario_seq', 2, true);`);
        console.log("✔ Seeded users successfully.");

        // 4. Create carts (carrito)
        console.log("4. Inserting shopping carts...");
        const carts = [
            { id_carrito: 1, id_usuario: 9999, total: 15000.00 }, // Guest
            { id_carrito: 2, id_usuario: 1, total: 0.00 }, // Admin
            { id_carrito: 3, id_usuario: 2, total: 310000.00 } // Facundo
        ];

        for (const c of carts) {
            await client.query(`
                INSERT INTO carrito (id_carrito, id_usuario, total)
                VALUES ($1, $2, $3);
            `, [c.id_carrito, c.id_usuario, c.total]);
        }
        // Sync sequence
        await client.query(`SELECT setval('carrito_id_carrito_seq', 3, true);`);
        console.log("✔ Seeded shopping carts successfully.");

        // 5. Create shopping cart items (linea_carrito)
        console.log("5. Inserting shopping cart lines...");
        const cartLines = [
            { id_carrito: 1, id_producto: 17, cantidad: 1, precio: 15000.00 }, // Guest has Bugs Bunny
            { id_carrito: 3, id_producto: 3, cantidad: 1, precio: 310000.00 } // Facundo has Daily Bugle
        ];

        for (const cl of cartLines) {
            await client.query(`
                INSERT INTO linea_carrito (id_carrito, id_producto, cantidad, precio)
                VALUES ($1, $2, $3, $4);
            `, [cl.id_carrito, cl.id_producto, cl.cantidad, cl.precio]);
        }
        console.log("✔ Seeded cart lines successfully.");

        // 6. Create realistic past purchases (compra)
        console.log("6. Inserting past purchase history...");
        const purchases = [
            {
                id: 1,
                id_usuario: 2, // Facundo
                fecha: '2026-05-15 14:30:00',
                metodo_pago: 'mercado_pago',
                estado: 'Pago confirmado',
                subtotal: 175000.00,
                total_descuento: 0.00,
                total: 175000.00
            },
            {
                id: 2,
                id_usuario: 2, // Facundo
                fecha: '2026-05-20 18:45:00',
                metodo_pago: 'mercado_pago',
                estado: 'Pedido Despachado',
                subtotal: 33500.00,
                total_descuento: 3500.00,
                total: 30000.00
            },
            {
                id: 3,
                id_usuario: 9999, // Guest
                fecha: '2026-05-26 11:20:00',
                metodo_pago: 'transferencia',
                estado: 'Preparando Pedido',
                subtotal: 95000.00,
                total_descuento: 0.00,
                total: 95000.00
            }
        ];

        for (const p of purchases) {
            await client.query(`
                INSERT INTO compra (id_compra, id_usuario, fecha, metodo_pago, estado, subtotal, total_descuento, total)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `, [p.id, p.id_usuario, p.fecha, p.metodo_pago, p.estado, p.subtotal, p.total_descuento, p.total]);
        }
        // Sync sequence
        await client.query(`SELECT setval('compra_id_compra_seq', 3, true);`);
        console.log("✔ Seeded purchase history successfully.");

        // 7. Create purchase lines (linea_compra)
        console.log("7. Inserting purchase lines...");
        const purchaseLines = [
            { id_compra: 1, id_producto: 15, cantidad: 1, precio: 175000.00 }, // Gran Comedor de Hogwarts
            { id_compra: 2, id_producto: 17, cantidad: 1, precio: 15000.00 }, // Bugs Bunny
            { id_compra: 2, id_producto: 18, cantidad: 1, precio: 18500.00 }, // Correcaminos
            { id_compra: 3, id_producto: 12, cantidad: 1, precio: 95000.00 } // Estación de Policía
        ];

        for (const pl of purchaseLines) {
            await client.query(`
                INSERT INTO linea_compra (id_compra, id_producto, cantidad, precio, id_promo)
                VALUES ($1, $2, $3, $4, NULL);
            `, [pl.id_compra, pl.id_producto, pl.cantidad, pl.precio]);
        }
        console.log("✔ Seeded purchase lines successfully.");

        // 8. Create shipments (envio)
        console.log("8. Inserting shipments...");
        const shipments = [
            { id_envio: 1, id_compra: 2, codigo_seguimiento: 'AR-TR-85472091' }
        ];

        for (const s of shipments) {
            await client.query(`
                INSERT INTO envio (id_envio, id_compra, codigo_seguimiento)
                VALUES ($1, $2, $3);
            `, [s.id_envio, s.id_compra, s.codigo_seguimiento]);
        }
        // Sync sequence
        await client.query(`SELECT setval('envio_id_envio_seq', 1, true);`);
        console.log("✔ Seeded shipments successfully.");

        // 9. Create product reviews (comentario) and ratings (calificacion)
        console.log("9. Inserting comments and star ratings...");
        const reviews = [
            {
                id: 1,
                id_usuario: 2, // Facundo
                id_producto: 17, // Bugs Bunny
                puntaje: 5,
                texto: 'Es un set hermoso. Las minifiguras tienen un nivel de detalle increíble, ideal para los nostálgicos de los dibujos animados clásicos.',
                fecha: '2026-05-25',
                anonimo: false
            },
            {
                id: 2,
                id_usuario: 2, // Facundo
                id_producto: 1, // Halcón Milenario
                puntaje: 5,
                texto: 'Sencillamente espectacular. Es gigante y armarlo fue un desafío súper entretenido. Vale cada centavo.',
                fecha: '2026-05-18',
                anonimo: false
            },
            {
                id: 3,
                id_usuario: 9999, // Guest
                id_producto: 19, // El Laboratorio de Dexter
                puntaje: 4,
                texto: 'Excelente set, muy original y lleno de detalles nostálgicos. Dee Dee quedó genial.',
                fecha: '2026-05-27',
                anonimo: true
            },
            {
                id: 4,
                id_usuario: 2, // Facundo
                id_producto: 3, // Daily Bugle
                puntaje: 5,
                texto: 'Increíble set de Marvel. La cantidad de minifiguras es asombrosa, especialmente Spider-Man y Venom.',
                fecha: '2026-05-21',
                anonimo: false
            },
            {
                id: 5,
                id_usuario: 9999, // Guest
                id_producto: 2, // Castillo de Hogwarts
                puntaje: 5,
                texto: 'Mágico de principio a fin. El nivel de detalle microescala es fascinante.',
                fecha: '2026-05-16',
                anonimo: true
            },
            {
                id: 6,
                id_usuario: 2, // Facundo
                id_producto: 10, // Porsche 911 GT3 RS
                puntaje: 4,
                texto: 'La complejidad de la ingeniería de Technic es de otro planeta. Muy divertido de construir.',
                fecha: '2026-05-14',
                anonimo: false
            }
        ];

        for (const r of reviews) {
            // Insert Rating
            await client.query(`
                INSERT INTO calificacion (id_usuario, id_producto, puntaje, fecha)
                VALUES ($1, $2, $3, $4);
            `, [r.id_usuario, r.id_producto, r.puntaje, r.fecha]);

            // Insert Comment
            await client.query(`
                INSERT INTO comentario (id_comentario, id_usuario, id_producto, texto, fecha, anonimo)
                VALUES ($1, $2, $3, $4, $5, $6);
            `, [r.id, r.id_usuario, r.id_producto, r.texto, r.fecha, r.anonimo]);
        }
        // Sync sequences
        await client.query(`SELECT setval('calificacion_id_calificacion_seq', (SELECT MAX(id_calificacion) FROM calificacion), true);`);
        await client.query(`SELECT setval('comentario_id_comentario_seq', 6, true);`);
        console.log("✔ Seeded reviews and ratings successfully.");

        // 10. Create active store promotions (promocion)
        console.log("10. Inserting active promotions...");
        const promos = [
            {
                id: 1,
                descripcion: 'Descuento Star Wars Mayo',
                fecha_inicio: '2026-05-01',
                fecha_fin: '2026-06-30',
                porcentaje: 10.00,
                id_producto: 1 // Halcón Milenario
            },
            {
                id: 2,
                descripcion: 'Lanzamiento Especial Cartoon Network',
                fecha_inicio: '2026-05-25',
                fecha_fin: '2026-06-15',
                porcentaje: 15.00,
                id_producto: 17 // Bugs Bunny y el Pato Lucas
            }
        ];

        for (const pr of promos) {
            await client.query(`
                INSERT INTO promocion (id_promo, descripcion, fecha_inicio, fecha_fin, porcentaje, id_producto)
                VALUES ($1, $2, $3, $4, $5, $6);
            `, [pr.id, pr.descripcion, pr.fecha_inicio, pr.fecha_fin, pr.porcentaje, pr.id_producto]);
        }
        // Sync sequence
        await client.query(`SELECT setval('promocion_id_promo_seq', 2, true);`);
        console.log("✔ Seeded promotions successfully.");

        // 11. Create restock logs (ingreso_producto)
        console.log("11. Inserting product stock restock logs...");
        const stockIngresos = [
            { id: 1, id_producto: 17, cantidad: 15, fecha: '2026-05-25' },
            { id: 2, id_producto: 18, cantidad: 10, fecha: '2026-05-25' },
            { id: 3, id_producto: 1, cantidad: 5, fecha: '2026-05-01' },
            { id: 4, id_producto: 3, cantidad: 8, fecha: '2026-05-10' }
        ];

        for (const si of stockIngresos) {
            await client.query(`
                INSERT INTO ingreso_producto (id_ingreso, id_producto, cantidad, fecha)
                VALUES ($1, $2, $3, $4);
            `, [si.id, si.id_producto, si.cantidad, si.fecha]);
        }
        // Sync sequence
        await client.query(`SELECT setval('ingreso_producto_id_ingreso_seq', 4, true);`);
        console.log("✔ Seeded restock logs successfully.");

        await client.query('COMMIT');
        console.log("⭐ SEEDING COMPLETED SUCCESSFULLY! All database tables are perfectly aligned and populated.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Seeding Error (Transaction rolled back):", e.message);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
