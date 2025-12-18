import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',              // required for Render
    port: process.env.PORT || 3000,
    open: false,                  // must be false on Render
    allowedHosts: [
      'syntaxxxx.onrender.com',   // 👈 allow your Render domain
    ],
  },
});
