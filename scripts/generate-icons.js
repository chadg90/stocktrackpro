const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
  const inputFile = path.join(process.cwd(), 'public', 'logo.png');
  const outputDir = path.join(process.cwd(), 'public', 'icons');

  // Create icons directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Generate icons for each size
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
  }

  // Generate apple-touch-icon (180x180)
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  // Generate favicon-16x16.png
  await sharp(inputFile)
    .resize(16, 16, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(outputDir, 'favicon-16x16.png'));

  // Generate favicon-32x32.png
  await sharp(inputFile)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(outputDir, 'favicon-32x32.png'));

  // Generate og-image.jpg (1200x630)
  await sharp(inputFile)
    .resize(1200, 630, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .toFile(path.join(process.cwd(), 'public', 'og-image.jpg'));

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error); 