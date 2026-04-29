import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy API calls to the backend during local development.
  // This avoids CORS issues when running `npm run dev` — all /api/* calls
  // are forwarded to the Express server on port 5000.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output to dist/ — this is what backend/server.js serves in production
    outDir: 'dist',
    sourcemap: false,
  },
})
