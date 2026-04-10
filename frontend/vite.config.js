import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3015',
        changeOrigin: true
      }
    }
  }
})
