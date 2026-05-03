# Theme System Usage

The app now has a complete theme system with three themes: Dark, Light, and Beige.

## For Developers

### Using the Theme Hook

In any component, use the `useTheme` hook to access the current theme's palette:

```tsx
import { useTheme } from '@/lib/theme-context'

export function MyComponent() {
  const { theme, palette, setTheme } = useTheme()

  return (
    <div style={{ background: palette.bg, color: palette.text }}>
      Current theme: {theme}
    </div>
  )
}
```

### Available Palette Colors

- `bg` - Main background
- `bgElev` - Elevated background (sidebars, headers)
- `bgCard` - Card background
- `bgCardHover` - Card hover state
- `border` - Border color
- `borderSoft` - Soft border color
- `text` - Primary text color
- `textDim` - Dimmed text color
- `textMute` - Muted text color
- `violet` - Primary accent color
- `violetDim` - Dimmed violet
- `violetBg` - Semi-transparent violet background
- `violetBorder` - Violet border
- `emerald` - Success/positive color
- `amber` - Warning color
- `rose` - Error/negative color
- `cyan` - Info color

### Theme Switcher Component

The theme switcher is available in the top header. Users can:
- Click the circular button to cycle through themes
- Use the inline buttons (visible on md+ screens) to select a specific theme

Themes are automatically saved to `localStorage` and persist across page refreshes.

## Themes

1. **Dark** (Default) - Professional dark theme with violet accents
2. **Light** - Clean light theme for daytime use
3. **Beige** - Warm, calming beige/cream theme

All themes ensure text visibility and WCAG contrast compliance.
