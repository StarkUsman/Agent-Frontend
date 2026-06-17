import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/features/flow-editor'),
    },
  },
  server: {
    allowedHosts: [
      'ed79-2407-aa80-126-ebcd-642f-756b-df95-b7d6.ngrok-free.app'
    ]
  }
})
