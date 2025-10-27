// Simple icon generator using Node.js canvas (if available) or data URLs
// Creates minimal valid PNG files for Chrome extension

const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 transparent PNG (base64 encoded)
const createMinimalPNG = (size) => {
  // This is a valid 1x1 transparent PNG
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

// Create a simple colored PNG using SVG -> PNG conversion (data URL)
const createColoredIcon = (size, color = '#4F46E5') => {
  // Create an SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${color}"/>
      <text x="50%" y="50%" font-size="${size * 0.6}" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">G</text>
    </svg>
  `;

  // For now, let's use a simple solid color PNG
  // This is a 16x16 blue square PNG
  const png16 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVR42mNgGAWjYBQMHvD//38QYyABIwOKGkYcmhixKRhNAcRBQwejYBSMgsEHAKm1EhH+Yq6fAAAAAElFTkSuQmCC';
  const png48 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA3ElEQVR42u2YMQrCQBBFZ5O9gI2FYLW9pLXVXsBSO0sBK0vxBgqCjZWVYCWk8BaWQgqRNQFnYJD8YiH7YD7MsJudZP8rMAzjn0gBR+ANvIGrYt8gHRjZArfzqYUr0NRSgSswqaUCZ2BRSwVWQFZDBfbAqoYKbIB5DRVIgKyGCuSAb0l7lH0YhmEYxg+jAzzDe0DKjnKP4jj3AHLFfgBOig0gV2zOQWzOB2Co2J/jKPfnQN4dhmEY/4QWcKLc/xW2iq0tMFfsbyQDhop9gRDlODcMwzB+ig8wMhAiL+jUIQAAAABJRU5ErkJggg==';
  const png128 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAA8ElEQVR42u3SMQrCQBRF0Zn8K9jYCAquw1Xae2jtBSy1sxSwshRvoCAogoiFtbCQBAIpRNYEnIFB8ouF7IP5MMNudmZnZ2dnZ/+6BDgCb+ANXBWfQTowsgVu51MLV6CppQJXYFJLBc7AopYKrIAs/gVWQFZDBfbAqoYKbIB5DRVIgKyGCuSAL6U9yn4Ye4CP+ACU/Sj3KI5zDyBX7AfgpNgAcsXmHMTmfACGiv05jnJ/DuTdYWdnZ/+6FnCi3P8Vtoqt/TBWYKrY30gGDBX7AiHKOXd2dnb2Lz4AlRgiDNb1clAAAAAASUVORK5CYII=';

  if (size === 16) return Buffer.from(png16, 'base64');
  if (size === 48) return Buffer.from(png48, 'base64');
  if (size === 128) return Buffer.from(png128, 'base64');

  return createMinimalPNG(size);
};

const iconsDir = path.join(__dirname, '../public/icons');

// Create the icons
try {
  fs.writeFileSync(path.join(iconsDir, 'icon16.png'), createColoredIcon(16));
  console.log('✓ Created icon16.png');

  fs.writeFileSync(path.join(iconsDir, 'icon48.png'), createColoredIcon(48));
  console.log('✓ Created icon48.png');

  fs.writeFileSync(path.join(iconsDir, 'icon128.png'), createColoredIcon(128));
  console.log('✓ Created icon128.png');

  console.log('\n✓ All icons created successfully!');
  console.log('Run "npm run build" to rebuild the extension.');
} catch (error) {
  console.error('Error creating icons:', error);
  process.exit(1);
}

