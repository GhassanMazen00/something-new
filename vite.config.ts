import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `vite build` builds the public website.
// `vite build --mode app` builds the analyst workspace demo into its own folder. The website's deploy never publishes it.
// `vite build --mode platform` builds the real workspace's screens into the Python app. The Python server serves them on
// this computer only. `vite --mode platform` runs those screens against a server already running on port 8000.
export default defineConfig(({ mode }) => {
  if (mode === 'platform')
    return {
      root: 'platform-ui',
      base: '/',
      plugins: [react()],
      // Keep the inlined fonts and images as files: the server's security policy allows no inline data except images.
      build: { outDir: '../platform/clearline/static', emptyOutDir: true, assetsInlineLimit: 0 },
      server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
    }
  return {
    // Relative paths so the built site works from any folder or host.
    base: './',
    plugins: [react()],
    build: mode === 'app' ? { outDir: 'dist-app', rollupOptions: { input: { app: 'app/index.html' } } } : undefined,
  }
})
