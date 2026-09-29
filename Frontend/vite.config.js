import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Lắng nghe trên mọi interface mạng (0.0.0.0)
    allowedHosts: true, // Cho phép tất cả domain tunnel (loca.lt, ngrok, pinggy, v.v.)
  },
})
