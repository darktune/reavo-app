const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/';
const images = [
  'DSC04369.b9a907ea.jpeg',
  '26.37738781.jpeg',
  '21.a3a213b3.jpeg',
  '2.adc787b5.jpeg',
  'IMG_0335.ea9bbfbb.jpeg',
  'IMG_0358.070b81ee.jpeg',
  'IMG_0311.1547b02a.jpeg',
  'IMG_0255.fb2308c7.jpeg',
  'IMG_0275.9046d256.jpeg',
  '6.a6921430.jpeg',
  'IMG_0408-1.5bc18a03.jpeg',
  'IMG_0203.318a82ed.jpeg',
  'IMG_0303-1.0dbd5734.jpeg',
  'IMG_0464.8079a1c8.jpeg'
];

const targetDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

images.forEach(img => {
  const url = baseUrl + img;
  const filePath = path.join(targetDir, img);
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${img}`);
      });
    } else {
      console.error(`Failed to download ${img}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${img}: ${err.message}`);
  });
});
