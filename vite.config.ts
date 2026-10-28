import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `vite build` builds the public website. `vite build --mode app` builds the staff-only analyst workspace
// into its own folder, which the website's deploy never publishes.
export default defineConfig(({ mode }) => ({
  // Relative paths so the built site works from any folder or host.
  base: './',
  plugins: [react()],
  build:
    mode === 'app'
      ? { outDir: 'dist-app', rollupOptions: { input: { app: 'app/index.html' } } }
      : undefined,
}))
