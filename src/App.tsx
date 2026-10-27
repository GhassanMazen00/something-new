import { Checker } from './components/Checker'
import { Contact, Faq, Footer } from './components/Closing'
import { Demos } from './components/Demos'
import { Header } from './components/Header'
import { About, Hero } from './components/Hero'
import { Privacy } from './components/Privacy'
import { Process } from './components/Process'
import { Services } from './components/Services'
import { useLang } from './lang'
import { useTheme } from './theme'
import { useReveal } from './useReveal'

export default function App() {
  const { lang } = useLang()
  const [theme, setTheme] = useTheme()
  useReveal()
  return (
    <>
      <a className="skip" href="#about">
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <Header theme={theme} setTheme={setTheme} />
      <main>
        <Hero />
        <About />
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
