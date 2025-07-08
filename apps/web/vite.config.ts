import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: './tailwind.config.ts'
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // alias @ → /src
      '@api': fileURLToPath(new URL('../api/src', import.meta.url)), // alias @api → /api/src
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  preview: {
    host: true,
    port: 5173
  },
  server: {
    host: true,
    port: 5173
  }
});
