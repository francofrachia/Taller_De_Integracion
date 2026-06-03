import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = './src/assets';

const imagesToConvert = [
  'about_us_image.png',
  'starWars.jpg',
  'imagen_home_arriba.png',
  'Home.superheroe.jpg',
  'imagen no existente BM.png'
];

async function convertImages() {
  for (const img of imagesToConvert) {
    const inputPath = path.join(assetsDir, img);
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${img}, file not found.`);
      continue;
    }
    
    const parsed = path.parse(img);
    const outputPath = path.join(assetsDir, `${parsed.name}.webp`);
    
    try {
      console.log(`Converting ${img}...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Successfully converted to ${parsed.name}.webp`);
      
      // We will let git/bash handle the deletion safely later
    } catch (err) {
      console.error(`Error converting ${img}:`, err);
    }
  }
}

convertImages();
