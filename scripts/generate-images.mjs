import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';

// Convert OG image SVG to PNG
const ogSvg = fs.readFileSync(path.join(publicDir, 'og-image.svg'));
await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile(path.join(publicDir, 'og-image.png'));
console.log('Created og-image.png');

// Create favicon PNGs from icon.svg
const iconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

// Create android-chrome icons
await sharp(iconSvg)
  .resize(192, 192)
  .png()
  .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
console.log('Created android-chrome-192x192.png');

await sharp(iconSvg)
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
console.log('Created android-chrome-512x512.png');

// Create favicon-16x16
await sharp(iconSvg)
  .resize(16, 16)
  .png()
  .toFile(path.join(publicDir, 'favicon-16x16.png'));
console.log('Created favicon-16x16.png');

// Create favicon-32x32
await sharp(iconSvg)
  .resize(32, 32)
  .png()
  .toFile(path.join(publicDir, 'favicon-32x32.png'));
console.log('Created favicon-32x32.png');

// Create apple-touch-icon
await sharp(iconSvg)
  .resize(180, 180)
  .png()
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));
console.log('Created apple-touch-icon.png');

// Create logo.png for backwards compatibility
await sharp(iconSvg)
  .resize(512, 512)
  .png()
  .toFile(path.join(publicDir, 'logo.png'));
console.log('Created logo.png');

console.log('\nAll images generated successfully!');
