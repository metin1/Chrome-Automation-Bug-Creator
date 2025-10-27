import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest.json to dist
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        copyFileSync('public/manifest.json', 'dist/manifest.json');
        
        // Move HTML files to root
        try {
          if (existsSync('dist/src/popup/index.html')) {
            copyFileSync('dist/src/popup/index.html', 'dist/popup.html');
          }
          if (existsSync('dist/src/options/index.html')) {
            copyFileSync('dist/src/options/index.html', 'dist/options.html');
          }
        } catch (e) {
          console.log('Warning: Could not move HTML files');
        }
        
        // Copy icons
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        try {
          copyFileSync('public/icons/icon16.png', 'dist/icons/icon16.png');
          copyFileSync('public/icons/icon48.png', 'dist/icons/icon48.png');
          copyFileSync('public/icons/icon128.png', 'dist/icons/icon128.png');
        } catch (e) {
          console.log('Warning: Could not copy all icons');
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.html' || assetInfo.name === 'options.html') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
});

