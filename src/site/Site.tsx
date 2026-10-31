import { useReveal } from '../useReveal'
import { Hero } from './Hero'
import { Home } from './Home'
import { Shell } from './Layout'

export function Site() {
  useReveal()
  return (
    <Shell>
      <Hero />
      <Home />
    </Shell>
  )
}
