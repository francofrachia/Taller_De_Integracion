-- Script para actualizar las descripciones de tus productos REALES en la base de datos PostgreSQL.
-- Puedes copiar y pegar esto en Supabase SQL Editor, DBeaver o pgAdmin.

-- 1. Halcón Milenario
UPDATE producto SET descripcion = 'Construye y expón el Halcón Milenario, la nave estelar más famosa de la galaxia de Star Wars. Este modelo cuenta con detalles increíbles como cañones cuádruples láser superiores e inferiores, patas de aterrizaje, rampa de embarque descendente y una cabina para 4 minifiguras con cubierta desmontable. El interior altamente detallado incluye el compartimento principal, zona de descanso y contrabando, además de una estación de artillería.' WHERE id_producto = 1;

-- 2. Ferrari Daytona SP3
UPDATE producto SET descripcion = 'Disfruta de una experiencia de construcción consciente con la maqueta a escala 1:8 del Ferrari Daytona SP3. Celebra la pasión por el Cavallino Rampante con detalles asombrosos: dirección, motor V12, caja de cambios secuencial de 8 velocidades con levas en el volante, puertas de mariposa que se abren, techo desmontable y amortiguadores.' WHERE id_producto = 2;

-- 3. Castillo de Hogwarts
UPDATE producto SET descripcion = '¡Haz que la magia cobre vida con el Castillo de Hogwarts de LEGO® Harry Potter™! Este modelo de colección enormemente detallado de más de 6,000 piezas ofrece una experiencia de construcción altamente gratificante. Descubre el Gran Comedor, cámaras, torres, aulas y muchas más características y lugares ocultos, además de la cabaña de Hagrid y el Sauce Boxeador.' WHERE id_producto = 3;

-- 4. Daily Bugle
UPDATE producto SET descripcion = 'Recrea la emoción del universo de Spider-Man con la impresionante maqueta del Daily Bugle. Con 4 pisos altamente detallados de oficinas y la icónica fachada del edificio, este set es un auténtico homenaje a la clásica serie de cómics. Incluye 25 minifiguras clásicas: Spider-Man, Venom, Duende Verde, Doctor Octopus y muchos más.' WHERE id_producto = 4;

-- 5. Comisaría de Policía
UPDATE producto SET descripcion = 'Sumérgete en un mundo de crimen e investigación con la Comisaría de Policía LEGO®. Repleta de sorpresas fascinantes y funciones ingeniosas, incluye una sala de interrogatorios, una celda, la oficina del investigador y un quiosco de donas adosado al edificio. Una adición perfecta para tu ciudad de bloques.' WHERE id_producto = 5;

-- 6. Templo del Dragón
UPDATE producto SET descripcion = 'Adéntrate en la mítica batalla ninja con el Templo del Dragón. Este set espectacular cuenta con múltiples niveles, trampas secretas, armerías y un majestuoso dragón articulado guardando el tesoro. Recrea las escenas más épicas con tus maestros del Spinjitzu favoritos.' WHERE id_producto = 6;

-- 7. Mansión de Vacaciones
UPDATE producto SET descripcion = '¡Disfruta del sol y el relax con la Mansión de Vacaciones 3 en 1! Construye una moderna casa de verano con piscina, tabla de surf, hamaca y balcón. Cuando quieras un cambio, reconstrúyela en un parque acuático o en un pequeño paraíso para campistas. Diversión infinita para los días calurosos.' WHERE id_producto = 7;

-- 8. Pirámide de Giza
UPDATE producto SET descripcion = 'Viaja en el tiempo hasta el antiguo Egipto y construye una detallada maqueta transversal de la Gran Pirámide de Giza. Levanta la cubierta exterior para revelar el sistema que, según se cree, se usó para mover enormes piedras durante la construcción. Observa los pasillos principales, las cámaras y los alrededores del río Nilo.' WHERE id_producto = 8;

-- 9. Titanic
UPDATE producto SET descripcion = 'Rinde homenaje al barco más famoso de la historia con este modelo colosal del Titanic. Con más de 9,000 piezas, esta fiel réplica a escala 1:200 permite explorar el interior del barco, incluyendo el puente de mando, la zona de paseo, la gran escalera de primera clase, la piscina y la sala de calderas.' WHERE id_producto = 9;

-- 10. Atari 2600
UPDATE producto SET descripcion = 'Viaja a la década de los 80 con la réplica de la mítica consola Atari® 2600. Este set incluye el clásico joystick y cartuchos de tres de los videojuegos más populares: Asteroids™, Adventure y Centipede™. Además, los cartuchos se pueden insertar en la ranura y cuenta con escenas 3D ocultas de cada juego.' WHERE id_producto = 10;

-- 11. Máquina de Escribir
UPDATE producto SET descripcion = 'Desconecta de la era digital y construye tu propia Máquina de Escribir de estilo retro. Inspirada en la máquina que usaba el fundador de LEGO Group, cuenta con una barra de tipos central que se eleva al presionar una tecla y mueve el carro transversal. ¡Incluso puedes colocar un folio real en el rodillo!' WHERE id_producto = 11;

-- 12. Porsche 911 Turbo
UPDATE producto SET descripcion = 'Celebra el inconfundible estilo de Porsche con el set 2 en 1 del Porsche 911. Elige entre construir el modelo Turbo, con su motor turboalimentado, o el modelo Targa, con su icónico arco protector y el techo desmontable que se guarda en el maletero. Disfruta de sus asientos reclinables, dirección funcional y motor de seis cilindros.' WHERE id_producto = 12;

-- 13. Tren de Vapor
UPDATE producto SET descripcion = 'Revive la época dorada de los ferrocarriles con esta locomotora clásica de vapor. Con un diseño auténtico, colores vibrantes y detalles móviles, este tren es perfecto tanto para coleccionistas como para aquellos que quieren agregar un toque vintage a su ciudad de bloques. Incluye vías de exposición.' WHERE id_producto = 13;

-- 14. La Granja de Cerdos
UPDATE producto SET descripcion = 'Traslada el popular universo de Minecraft™ al mundo real con La Granja de Cerdos. Usa tus habilidades para construir una casa con forma de cerdo gigante. Cuenta con un lateral que se abre para acceder a una gran sala y un tejado desmontable. Incluye a Alex, un Creeper™, dos cerdos y accesorios.' WHERE id_producto = 14;

-- 15. Caja de Ladrillos Creativa
UPDATE producto SET descripcion = 'Da rienda suelta a la imaginación sin límites con esta gran caja de ladrillos clásicos en 33 colores diferentes. Con multitud de ventanas, puertas y piezas especiales (como ojos, ruedas y hélices), este set es el complemento perfecto para cualquier colección y la base ideal para constructores de todas las edades.' WHERE id_producto = 15;
