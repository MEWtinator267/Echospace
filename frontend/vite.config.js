import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss()
  ],
   server: {
    proxy: {
      "/api": {
        target: "https://echospace-backend-z188.onrender.com", // Your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});