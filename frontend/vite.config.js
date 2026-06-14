import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
 
export default defineConfig({
  plugins: [react()],
  // Alias @ apunta a src/ — así importas así: import X from '@/components/X'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Proxy para que el frontend llame al backend sin problemas de CORS en dev
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
 