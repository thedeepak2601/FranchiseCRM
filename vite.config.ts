import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const authProxyTarget = process.env.VITE_AUTH_PROXY_TARGET || 'http://localhost:3002'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/ocr-space': {
        target: 'https://api.ocr.space',
        changeOrigin: true,
        secure: true,
        rewrite: (requestPath) => requestPath.replace(/^\/ocr-space/, ''),
      },
      '/ocr': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: authProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
