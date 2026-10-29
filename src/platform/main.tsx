import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/geist-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../app/app.css'
import App from './App'
import './platform.css'

// A saved theme wins; otherwise the system decides. (Here, not in the page: the server allows no inline scripts.)
try {
  const t = localStorage.getItem('clearline:theme')
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t
} catch {
  // Storage blocked: follow the system.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
