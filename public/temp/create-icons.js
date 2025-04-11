// This is a simple Node.js script to create maskable icons and screenshots for PWA
// Requires sharp: npm install sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function checkInputFiles() {
  const logo192 = path.join(__dirname, '../pwa-192x192.png');
  const logo512 = path.join(__dirname, '../pwa-512x512.png');
  
  // Check if input files exist
  if (!fs.existsSync(logo192)) {
    throw new Error(`Input file not found: ${logo192}`);
  }
  
  if (!fs.existsSync(logo512)) {
    throw new Error(`Input file not found: ${logo512}`);
  }
  
  return { logo192, logo512 };
}

async function createMaskableIcons() {
  console.log('Creating maskable icons...');
  
  // Input files
  const { logo192, logo512 } = await checkInputFiles();
  
  // Output paths
  const maskable192 = path.join(__dirname, '../maskable-192x192.png');
  const maskable512 = path.join(__dirname, '../maskable-512x512.png');
  
  // Create 192x192 maskable icon with padding (10% on all sides)
  await sharp(logo192)
    .resize({
      width: Math.floor(192 * 0.8),
      height: Math.floor(192 * 0.8),
      fit: 'contain',
      background: { r: 25, g: 118, b: 210, alpha: 1 } // #1976d2 background color
    })
    .extend({
      top: Math.floor(192 * 0.1),
      bottom: Math.floor(192 * 0.1),
      left: Math.floor(192 * 0.1),
      right: Math.floor(192 * 0.1),
      background: { r: 25, g: 118, b: 210, alpha: 1 } // #1976d2 background color
    })
    .toFile(maskable192);
  
  // Create 512x512 maskable icon with padding (10% on all sides)
  await sharp(logo512)
    .resize({
      width: Math.floor(512 * 0.8),
      height: Math.floor(512 * 0.8),
      fit: 'contain',
      background: { r: 25, g: 118, b: 210, alpha: 1 } // #1976d2 background color
    })
    .extend({
      top: Math.floor(512 * 0.1),
      bottom: Math.floor(512 * 0.1),
      left: Math.floor(512 * 0.1),
      right: Math.floor(512 * 0.1),
      background: { r: 25, g: 118, b: 210, alpha: 1 } // #1976d2 background color
    })
    .toFile(maskable512);
  
  console.log('✅ Created maskable icons successfully');
}

async function createScreenshots() {
  console.log('Creating screenshot placeholders...');
  
  // Create a 1366x768 screenshot for wide form factor
  const screenshotWide = path.join(__dirname, '../screenshot-wide.png');
  
  await sharp({
    create: {
      width: 1366,
      height: 768,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: Buffer.from(`
        <svg width="1366" height="768" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1366" height="768" fill="#f5f9ff"/>
          <text x="683" y="384" font-family="Arial" font-size="48" text-anchor="middle" fill="#1976d2">Resume Matcher - Desktop View</text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .toFormat('png')
    .toFile(screenshotWide);
  
  // Create a 390x844 screenshot for mobile/narrow form factor
  const screenshotMobile = path.join(__dirname, '../screenshot-mobile.png');
  
  await sharp({
    create: {
      width: 390,
      height: 844,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: Buffer.from(`
        <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="390" height="844" fill="#f5f9ff"/>
          <text x="195" y="422" font-family="Arial" font-size="24" text-anchor="middle" fill="#1976d2">Resume Matcher - Mobile View</text>
        </svg>
      `),
      top: 0,
      left: 0
    }])
    .toFormat('png')
    .toFile(screenshotMobile);
  
  console.log('✅ Created screenshot placeholders successfully');
}

async function main() {
  try {
    // Check command-line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Usage: node create-icons.js [options]

Options:
  icons        Generate only maskable icons
  screenshots  Generate only screenshots
  --help, -h   Show this help message

If no option is provided, both icons and screenshots will be generated.
      `);
      return;
    }
    
    if (args.length === 0 || args.includes('all')) {
      // Generate everything
      await createMaskableIcons();
      await createScreenshots();
      console.log('✅ All PWA assets created successfully!');
    } else if (args.includes('icons')) {
      // Generate only icons
      await createMaskableIcons();
    } else if (args.includes('screenshots')) {
      // Generate only screenshots
      await createScreenshots();
    } else {
      console.log('Invalid option. Use --help to see available options.');
    }
  } catch (error) {
    console.error('❌ Error creating assets:', error.message);
    process.exit(1);
  }
}

main();