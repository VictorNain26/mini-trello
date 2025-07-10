import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    port: Number(process.env.PORT) || 5173,
    allowedHosts: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : [],
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    allowedHosts: process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : [],
  },
});
