import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mission-board-MEDIA/', // اسم الريبو بالضبط
})
