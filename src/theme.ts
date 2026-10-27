import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

// Dark by default. index.html sets data-theme before the first paint; this keeps React in step with it.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#05080f' : '#eef2f8')
    try {
      localStorage.setItem('clearline:theme', theme)
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }, [theme])
  return [theme, setTheme] as const
}
