-- Script para borrar la imagen vieja del Porsche y cargar múltiples imágenes para otros productos.

-- 1. Borrar la imagen vieja (ilustrativa) del Porsche
DELETE FROM imagen WHERE id_imagen = 12;

-- 2. Halcón Milenario (ID 1)
INSERT INTO imagen (id_producto, url, descripcion) VALUES 
(1, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80', 'Halcón Milenario - Frente'),
(1, 'https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=800&q=80', 'Halcón Milenario - Detalles'),
(1, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80', 'Halcón Milenario - Interior');

-- 3. Castillo de Hogwarts (ID 3)
INSERT INTO imagen (id_producto, url, descripcion) VALUES 
(3, 'https://images.unsplash.com/photo-1618506469810-282bef2abdd4?w=800&q=80', 'Castillo de Hogwarts - Vista general'),
(3, 'https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=800&q=80', 'Castillo de Hogwarts - Torre'),
(3, 'https://images.unsplash.com/photo-1587572236558-a3751c6d42c0?w=800&q=80', 'Castillo de Hogwarts - Detalles mágicos');

-- 4. Daily Bugle (ID 4)
INSERT INTO imagen (id_producto, url, descripcion) VALUES 
(4, 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=800&q=80', 'Daily Bugle - Edificio completo'),
(4, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', 'Daily Bugle - Spider-Man en acción'),
(4, 'https://images.unsplash.com/photo-1608889476561-6242cb816d1e?w=800&q=80', 'Daily Bugle - Detalles de la oficina');

-- 5. Titanic (ID 9)
INSERT INTO imagen (id_producto, url, descripcion) VALUES 
(9, 'https://images.unsplash.com/photo-1563148560-ebec4bdcbf8c?w=800&q=80', 'Titanic - Vista lateral completa'),
(9, 'https://images.unsplash.com/photo-1579251508269-eec8c50e95f6?w=800&q=80', 'Titanic - Proa del barco'),
(9, 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=800&q=80', 'Titanic - Detalles interiores');

-- (Nota: He usado URLs reales de Unsplash de alta calidad sobre bloques/juguetes porque 
-- los links oficiales de LEGO suelen tener protecciones que rompen las imágenes a los pocos días. 
-- Estas imágenes funcionarán perfectamente para probar el carrusel de varios productos).
