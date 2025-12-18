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
    host: '0.0.0.0',              // 👈 REQUIRED
    port: process.env.PORT || 3000,
    open: false,                  // 👈 MUST be false on Render
  },
});
