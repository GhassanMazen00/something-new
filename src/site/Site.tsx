// Which page this is comes from the HTML file: <body data-page="services"> and so on.

import { useReveal } from '../useReveal'
import type { Page } from './copy'
import { Hero } from './Hero'
import { Home } from './Home'
import { Shell } from './Layout'
import { HowPage, SecurityPage, ServicesPage } from './Pages'

const page = (document.body.dataset.page ?? 'home') as Page

export function Site() {
  useReveal()
  return (
    <Shell page={page}>
      {page === 'services' ? (
        <ServicesPage />
      ) : page === 'security' ? (
        <SecurityPage />
      ) : page === 'how' ? (
        <HowPage />
      ) : (
        <>
          <Hero />
          <Home />
        </>
      )}
    </Shell>
  )
}
