import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/600.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './LangProvider'
import { Site } from './site/Site'
import './site/site.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <Site />
    </LangProvider>
  </StrictMode>,
)
