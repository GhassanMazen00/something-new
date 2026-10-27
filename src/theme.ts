import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// index.html sets data-theme before the first paint; this keeps React in step with it.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0f1c' : '#f5f7fa')
    try {
      localStorage.setItem('clearline:theme', theme)
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }, [theme])
  return [theme, setTheme] as const
}
