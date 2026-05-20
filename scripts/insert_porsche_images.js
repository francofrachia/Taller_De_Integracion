const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function insertImages() {
  const images = [
    { src: 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\82a2466d-6bb0-4513-8dc3-7a505e3cee1c\\porsche_front_1779288111915.png', name: 'porsche_front.png' },
    { src: 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\82a2466d-6bb0-4513-8dc3-7a505e3cee1c\\porsche_side_1779288129049.png', name: 'porsche_side.png' },
    { src: 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\82a2466d-6bb0-4513-8dc3-7a505e3cee1c\\porsche_back_1779288142885.png', name: 'porsche_back.png' }
  ];

  const publicDir = path.join(__dirname, '../frontend/public/images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    for (const img of images) {
      fs.copyFileSync(img.src, path.join(publicDir, img.name));
      // Vamos a intentar hacer el insert, si la tabla usa un id_imagen como PK, postgres se encargará.
      await pool.query(
        "INSERT INTO imagen (id_producto, url, descripcion) VALUES ($1, $2, $3)",
        [12, `/images/${img.name}`, 'Imagen del Porsche']
      );
      console.log(`Insertada en DB y copiada: ${img.name}`);
    }
    console.log("¡Imágenes insertadas con éxito!");
    process.exit(0);
  } catch (err) {
    console.error("Error insertando imágenes:", err.message);
    process.exit(1);
  }
}

insertImages();
