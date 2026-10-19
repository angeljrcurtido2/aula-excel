import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Aula Excel (web). En desarrollo, /api se reenvía al servidor Node (puerto 3010).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true, proxy: { '/api': 'http://localhost:3010' } },
})
