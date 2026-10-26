import { Contact, Faq, Footer } from './components/Closing'
import { Masthead } from './components/Masthead'
import { Privacy } from './components/Privacy'
import { Process } from './components/Process'
import { Services } from './components/Services'
import { Showcase } from './components/Showcase'
import { useLang } from './lang'
import { useReveal } from './useReveal'

export default function App() {
  const { lang } = useLang()
  useReveal([lang])
  return (
    <>
      <a className="skip sr-only" href="#privacy">
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <main>
        <Masthead />
        <Privacy />
        <Services />
        <Showcase />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
