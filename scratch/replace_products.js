const pool = require('../src/config/db');

const newProducts = [
  {
    nombre: 'Halcón Milenario UCS',
    descripcion: 'Construí y exhibí el Halcón Milenario de Ultimate Collector Series de LEGO Star Wars, con más de 7,500 piezas, antenas intercambiables y minifiguras icónicas de la trilogía original y secuelas.',
    id_categoria: 2, // Star Wars
    tipo_coleccion: 'star wars',
    edad_recomendada: 18,
    precio: 650000,
    id_proveedor: 1,
    stock: 5
  },
  {
    nombre: 'Castillo de Hogwarts',
    descripcion: 'Hacé que la magia cobre vida en el Castillo de Hogwarts de LEGO Harry Potter. Este set microescala detallado cuenta con más de 6,000 piezas, aulas, el Gran Comedor, la Cámara de los Secretos y criaturas míticas.',
    id_categoria: 3, // Harry Potter
    tipo_coleccion: 'harry potter',
    edad_recomendada: 16,
    precio: 420000,
    id_proveedor: 2,
    stock: 7
  },
  {
    nombre: 'Daily Bugle',
    descripcion: 'El rascacielos definitivo del universo Marvel para fanáticos y coleccionistas. Con más de 3,700 piezas y 25 minifiguras icónicas, incluyendo a Spider-Man, Venom, Miles Morales, Doctor Octopus y el Duende Verde.',
    id_categoria: 4, // Marvel
    tipo_coleccion: 'marvel',
    edad_recomendada: 18,
    precio: 310000,
    id_proveedor: 3,
    stock: 8
  },
  {
    nombre: 'Batimóvil Tumbler',
    descripcion: 'Construí una de las máquinas de guerra más icónicas del cine: el Tumbler de la trilogía The Dark Knight de Christopher Nolan. Un set de exhibición espectacular para coleccionistas adultos con minifiguras de Batman y The Joker.',
    id_categoria: 10, // Icons
    tipo_coleccion: 'super heroes',
    edad_recomendada: 18,
    precio: 260000,
    id_proveedor: 4,
    stock: 6
  },
  {
    nombre: 'El Refugio del Dragón del End',
    descripcion: 'Entrá al End de Minecraft y combatí al temible Dragón del End y a los Endermen en una batalla épica. Incluye minifiguras de guerreros del End, el dragón articulado, el portal de retorno y accesorios de combate.',
    id_categoria: 14, // Minecraft
    tipo_coleccion: null,
    edad_recomendada: 8,
    precio: 85000,
    id_proveedor: 5,
    stock: 12
  },
  {
    nombre: 'La Mina de la Epopeya',
    descripcion: 'Explorá las profundidades y recursos de la gran mina de Minecraft. Extraé carbón, hierro y valiosos diamantes mientras te defendés de los Creepers y los Zombis con dinamita de detonación rápida y espadas de hierro.',
    id_categoria: 14, // Minecraft
    tipo_coleccion: null,
    edad_recomendada: 9,
    precio: 115000,
    id_proveedor: 6,
    stock: 10
  },
  {
    nombre: 'Guantelete del Infinito',
    descripcion: 'Recreá el poder supremo de Thanos con este icónico Guantelete del Infinito para armar y exhibir. Cuenta con dedos articulados, las 6 Gemas del Infinito brillantes, una base sólida con placa descriptiva metálica.',
    id_categoria: 4, // Marvel
    tipo_coleccion: 'marvel',
    edad_recomendada: 18,
    precio: 135000,
    id_proveedor: 7,
    stock: 15
  },
  {
    nombre: 'Hulkbuster de Iron Man',
    descripcion: 'El imponente Hulkbuster de Iron Man a escala masiva. Cuenta con más de 4,000 piezas, reactor de arco iluminado en el pecho, brazos completamente articulados y una cabina detallada compatible con la figura del hombre de hierro.',
    id_categoria: 4, // Marvel
    tipo_coleccion: 'marvel',
    edad_recomendada: 18,
    precio: 380000,
    id_proveedor: 8,
    stock: 4
  },
  {
    nombre: 'Batwing de 1989',
    descripcion: 'Construí la legendaria nave de combate aérea de Batman del clásico film de Tim Burton de 1989. Cuenta con interiores detallados, dos cúpulas de cabina intercambiables, y un soporte especial para colgarla en la pared.',
    id_categoria: 10, // Icons
    tipo_coleccion: 'super heroes',
    edad_recomendada: 18,
    precio: 195000,
    id_proveedor: 9,
    stock: 9
  },
  {
    nombre: 'Porsche 911 GT3 RS',
    descripcion: 'Desafiá tu pasión por la ingeniería mecánica con la réplica ultra detallada a escala 1:8 del Porsche 911 GT3 RS de LEGO Technic. Cuenta con alerón ajustable, suspensión funcional, y caja de cambios secuencial.',
    id_categoria: 1, // Technic
    tipo_coleccion: null,
    edad_recomendada: 16,
    precio: 480000,
    id_proveedor: 10,
    stock: 6
  },
  {
    nombre: 'Bugatti Chiron',
    descripcion: 'Explorá la cúspide del diseño automotriz con esta réplica a escala 1:8 de LEGO Technic Bugatti Chiron. Desarrollado en colaboración con Bugatti, incluye motor W16 funcional con pistones móviles y tracción integral.',
    id_categoria: 1, // Technic
    tipo_coleccion: null,
    edad_recomendada: 16,
    precio: 520000,
    id_proveedor: 11,
    stock: 3
  },
  {
    nombre: 'Estación de Policía Multiaventura',
    descripcion: 'Mantené la tranquilidad de la comunidad con la estación de policía de LEGO City de 3 niveles. Incluye un camión patrulla, helicóptero, moto de policía y celdas de escape rápido con minifiguras y perros policías.',
    id_categoria: 5, // City
    tipo_coleccion: 'city',
    edad_recomendada: 6,
    precio: 95000,
    id_proveedor: 12,
    stock: 20
  },
  {
    nombre: 'Caza Ala-X de Luke Skywalker',
    descripcion: 'Despegá a la batalla contra el Imperio con el mítico caza Ala-X (X-Wing). Cuenta con alas ajustables para modo de combate, cañones láser, cabina abatible y minifiguras de Luke y R2-D2.',
    id_categoria: 2, // Star Wars
    tipo_coleccion: 'star wars',
    edad_recomendada: 9,
    precio: 145000,
    id_proveedor: 13,
    stock: 14
  },
  {
    nombre: 'Casco de Darth Vader',
    descripcion: 'Capturá el look oscuro y siniestro del Lord Sith de la galaxia en este icónico casco de exhibición para adultos. Ideal para lucir en cualquier sala, repisa u oficina de un fanático de Star Wars.',
    id_categoria: 2, // Star Wars
    tipo_coleccion: 'star wars',
    edad_recomendada: 18,
    precio: 110000,
    id_proveedor: 14,
    stock: 11
  },
  {
    nombre: 'Gran Comedor de Hogwarts',
    descripcion: 'Reviví la magia de la ceremonia de selección en el Gran Comedor de Hogwarts. Incluye chimenea, mesas de las cuatro casas, estandartes reversibles y 10 minifiguras exclusivas, incluyendo a Harry, Hermione y Ron.',
    id_categoria: 3, // Harry Potter
    tipo_coleccion: 'harry potter',
    edad_recomendada: 9,
    precio: 175000,
    id_proveedor: 15,
    stock: 10
  },
  {
    nombre: 'Sombrero Seleccionador Parlante',
    descripcion: 'Descubrí a qué casa de Hogwarts pertenecés con este increíble Sombrero Seleccionador interactivo de LEGO para armar y exhibir. ¡Tiene un bloque de sonido real que habla al presionar la punta o colocártelo!',
    id_categoria: 3, // Harry Potter
    tipo_coleccion: 'harry potter',
    edad_recomendada: 18,
    precio: 155000,
    id_proveedor: 15,
    stock: 8
  }
];

async function replaceProducts() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Eliminando referencias en tablas dependientes...');
    await client.query('DELETE FROM comentario');
    await client.query('DELETE FROM calificacion');
    await client.query('DELETE FROM favorito');
    await client.query('DELETE FROM linea_carrito');
    await client.query('DELETE FROM linea_compra');
    await client.query('DELETE FROM promocion');
    await client.query('DELETE FROM ingreso_producto');
    await client.query('DELETE FROM imagen');

    console.log('2. Eliminando productos viejos...');
    await client.query('DELETE FROM producto');

    console.log('3. Insertando nuevos productos míticos...');
    for (const prod of newProducts) {
      const resProd = await client.query(`
        INSERT INTO producto (nombre, descripcion, id_categoria, tipo_coleccion, edad_recomendada, precio, id_proveedor, activo, stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
        RETURNING id_producto
      `, [
        prod.nombre,
        prod.descripcion,
        prod.id_categoria,
        prod.tipo_coleccion,
        prod.edad_recomendada,
        prod.precio,
        prod.id_proveedor,
        prod.stock
      ]);

      const id_producto = resProd.rows[0].id_producto;
      console.log(`- Insertado: "${prod.nombre}" con ID ${id_producto}`);
    }

    await client.query('COMMIT');
    console.log('¡Transacción completada exitosamente!');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la transacción (se aplicó ROLLBACK):', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

replaceProducts();
