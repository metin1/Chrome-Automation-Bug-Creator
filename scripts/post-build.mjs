import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = 'dist';

// Copy HTML files to root
if (existsSync(join(distPath, 'src/popup/index.html'))) {
  const popupHtml = readFileSync(join(distPath, 'src/popup/index.html'), 'utf-8');
  const fixedPopupHtml = popupHtml.replace(/\.\.\/\.\.\//g, './');
  writeFileSync(join(distPath, 'popup.html'), fixedPopupHtml);
  console.log('✓ Fixed popup.html paths');
}

if (existsSync(join(distPath, 'src/options/index.html'))) {
  const optionsHtml = readFileSync(join(distPath, 'src/options/index.html'), 'utf-8');
  const fixedOptionsHtml = optionsHtml.replace(/\.\.\/\.\.\//g, './');
  writeFileSync(join(distPath, 'options.html'), fixedOptionsHtml);
  console.log('✓ Fixed options.html paths');
}

console.log('✓ Build post-processing complete!');

