import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://saas-task-management-api.onrender.com',
        // target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
