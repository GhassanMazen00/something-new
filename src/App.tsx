import { useState } from 'react'
import { Checker } from './components/Checker'
import { Contact, Faq, Footer } from './components/Closing'
import { Demos } from './components/Demos'
import { Hero } from './components/Hero'
import { Privacy } from './components/Privacy'
import { Process } from './components/Process'
import { Services } from './components/Services'
import { Sidebar, Topbar, useScrollState } from './components/Sidebar'
import { useLang } from './lang'
import { useTheme } from './theme'
import { useReveal } from './useReveal'

export default function App() {
  const { lang } = useLang()
  const [theme, setTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const { active, progress } = useScrollState()
  useReveal()
  return (
    <>
      <a className="skip" href="#privacy">
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <Sidebar open={open} setOpen={setOpen} theme={theme} setTheme={setTheme} active={active} progress={progress} />
      <div className="page">
        <Topbar open={open} setOpen={setOpen} theme={theme} setTheme={setTheme} progress={progress} />
        <main>
          <Hero />
          <Privacy />
          <Services />
          <Checker />
          <Demos />
          <Process />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}
