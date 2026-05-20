-- Script para actualizar las descripciones de los productos en la base de datos PostgreSQL.
-- Puedes copiar y pegar esto en tu cliente de base de datos (como DBeaver, pgAdmin o Supabase SQL Editor).

-- 1. Dumbo Lego (BrickHeadz)
UPDATE producto 
SET descripcion = 'Da vida a la magia de Disney con el set de construcción LEGO® BrickHeadz™ | Disney Dumbo (40792) para niños y niñas a partir de 10 años. Este encantador regalo para apasionados de Disney de todas las edades hará volar su imaginación mientras usan los ladrillos para crear un Dumbo de juguete con orejas móviles, patas plegables, un gorrito amarillo y un cuello rojo. Una vez terminada la figura, los fans pueden usarla para recrear sus escenas favoritas de la película o exponerla con orgullo en su habitación sobre la base incluida.'
WHERE nombre ILIKE '%dumbo%';

-- 2. Figura de Batman
UPDATE producto 
SET descripcion = 'Defiende Ciudad Gótica con este increíble set de Batman. Recrea las escenas más icónicas de las películas con gran nivel de detalle. Incluye accesorios y la capa distintiva del Caballero de la Noche. Ideal para coleccionistas y fans del universo de DC Comics.'
WHERE nombre ILIKE '%batman%';

-- 3. EVE y WALL-E
UPDATE producto 
SET descripcion = '¡Celebra el amor y la amistad intergaláctica con el set LEGO® BrickHeadz™ de EVE y WALL•E! Construye a estos entrañables robots de la clásica película de Pixar. EVE viene con sus característicos ojos azules y diseño estilizado, mientras que WALL•E incluye sus ruedas tipo oruga y compartimento compactador.'
WHERE nombre ILIKE '%wall%e%';

-- 4. Mickey Mouse Fiesta de la Primavera
UPDATE producto 
SET descripcion = 'Celebra el Año Nuevo Lunar y la llegada de la primavera con esta festiva figura LEGO® BrickHeadz™ de Mickey Mouse. Vistiendo un atuendo tradicional para la ocasión, es la pieza de decoración perfecta para traer buena suerte y alegría a tu hogar.'
WHERE nombre ILIKE '%mickey%';

-- 5. Mini Palacio de Agrabah Disney
UPDATE producto 
SET descripcion = 'Revive el clásico de Disney Aladdin con este espectacular Mini Palacio de Agrabah. Cuenta con torres doradas, balcones detallados y un diseño fiel a la arquitectura de la película animada. Una pequeña pero mágica pieza de exhibición.'
WHERE nombre ILIKE '%agrabah%';

-- Nota: Si tienes otros productos, puedes usar este mismo formato:
-- UPDATE producto SET descripcion = 'Tu texto aquí' WHERE id_producto = 1;
