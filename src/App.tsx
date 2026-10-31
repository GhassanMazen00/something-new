import { Checker } from './components/Checker'
import { Contact, Faq, Footer } from './components/Closing'
import { ContactDialog } from './components/ContactDialog'
import { Header } from './components/Header'
import { About, Hero } from './components/Hero'
import { AllServices, Services } from './components/Services'
import { useLang } from './lang'
import { useTheme } from './theme'
import { useGlassLight } from './useGlassLight'
import { useReveal } from './useReveal'

// services.html sets <body data-page="services">; everything else is the home page.
const page = document.body.dataset.page === 'services' ? 'services' : 'home'

export default function App() {
  const { lang } = useLang()
  const [theme, setTheme] = useTheme()
  useReveal()
  useGlassLight()
  const home = page === 'home'
  return (
    <>
      <a className="skip" href={home ? '#about' : '#main'}>
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <Header theme={theme} setTheme={setTheme} home={home} />
      <main id="main">
        {home ? (
          <>
            <Hero />
            <About />
            <Services />
            <Checker />
            <Faq />
            <Contact />
          </>
        ) : (
          <AllServices />
        )}
      </main>
      <Footer home={home} />
      <ContactDialog />
    </>
  )
}
