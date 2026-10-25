import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works from any folder (GitHub Pages, Netlify, a USB stick...)
  base: './',
  plugins: [react(), tailwindcss()],
})
