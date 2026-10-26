import { Checker } from './components/Checker'
import { Contact, Faq, Footer } from './components/Closing'
import { Demos } from './components/Demos'
import { Hero, Nav } from './components/Hero'
import { Privacy } from './components/Privacy'
import { Process } from './components/Process'
import { Services } from './components/Services'
import { usePointerFx } from './fx'
import { useLang } from './lang'
import { useReveal } from './useReveal'

export default function App() {
  const { lang } = useLang()
  useReveal([lang])
  usePointerFx()
  return (
    <>
      <div className="bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="grid" />
        <span className="noise" />
      </div>
      <div className="cursor-glow" aria-hidden="true" />
      <a className="skip" href="#privacy">
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <Nav />
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
    </>
  )
}
