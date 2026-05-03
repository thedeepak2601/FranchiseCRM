import { Moon, Sun, Wheat } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import type { ThemeName } from '@/lib/themes'

const themeOptions: { name: ThemeName; label: string; icon: React.ReactNode }[] = [
  { name: 'dark',  label: 'Dark',  icon: <Moon  className="h-3.5 w-3.5" /> },
  { name: 'light', label: 'Light', icon: <Sun   className="h-3.5 w-3.5" /> },
  { name: 'beige', label: 'Beige', icon: <Wheat className="h-3.5 w-3.5" /> },
]

export function ThemeSwitcher() {
  const { theme, palette, setTheme } = useTheme()

  return (
    <div
      className="flex items-center rounded-full p-0.5 gap-0.5"
      style={{
        background: palette.bgCard,
        border: `1px solid ${palette.border}`,
      }}
    >
      {themeOptions.map((option) => {
        const isActive = theme === option.name
        return (
          <button
            key={option.name}
            onClick={() => setTheme(option.name)}
            title={`${option.label} theme`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              background: isActive ? palette.violet : 'transparent',
              color: isActive ? '#ffffff' : palette.textDim,
              boxShadow: isActive ? `0 1px 4px ${palette.violet}55` : 'none',
            }}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
