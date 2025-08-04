import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/manualService': 'https://app.zumarlawfirm.com',
      '/uploads': 'https://app.zumarlawfirm.com',
    },
  },
})
