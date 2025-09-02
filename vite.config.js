import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // اسم المستودع بين شرطتين مائلتين:
  base: '/mission-board-MEDIA/',
})
