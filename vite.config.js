import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Serve the project root as public dir so /frames/*.jpg, /Flow img.jpg etc.
  // are all available as static assets in both dev and production build.
  publicDir: '.',

  build: {
    outDir: 'dist',
    // Prevent Vite from inlining large assets
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },

  server: {
    port: 5173,
    host: true,
    open: false,
  },
});

