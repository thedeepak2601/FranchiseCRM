import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ThemeName, Palette } from './themes'
import { getPalette } from './themes'

interface ThemeContextType {
  theme: ThemeName
  palette: Palette
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('app-theme')
    return (saved as ThemeName) || 'dark'
  })

  const palette = getPalette(theme)

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'beige')
    if (theme === 'dark') root.classList.add('dark')
    if (theme === 'beige') root.classList.add('beige')
    root.style.backgroundColor = palette.bg
    document.body.style.backgroundColor = palette.bg
  }, [theme, palette])

  return (
    <ThemeContext.Provider value={{ theme, palette, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
