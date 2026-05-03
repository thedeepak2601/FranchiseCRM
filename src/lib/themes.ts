export type ThemeName = 'dark' | 'light' | 'beige'

export interface Palette {
  bg: string
  bgElev: string
  bgCard: string
  bgCardHover: string
  border: string
  borderSoft: string
  text: string
  textDim: string
  textMute: string
  violet: string
  violetDim: string
  violetBg: string
  violetBorder: string
  emerald: string
  amber: string
  rose: string
  cyan: string
}

export const themes: Record<ThemeName, Palette> = {
  dark: {
    bg: '#0B0D14',
    bgElev: '#11141C',
    bgCard: '#161A24',
    bgCardHover: '#1C2030',
    border: '#1F2433',
    borderSoft: '#171B26',
    text: '#E5E7EB',
    textDim: '#9CA3AF',
    textMute: '#6B7280',
    violet: '#8B7CF6',
    violetDim: '#6D5FD8',
    violetBg: 'rgba(139,124,246,0.08)',
    violetBorder: 'rgba(139,124,246,0.25)',
    emerald: '#10B981',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
  },
  light: {
    bg: '#FFFFFF',
    bgElev: '#F9FAFB',
    bgCard: '#F3F4F6',
    bgCardHover: '#E5E7EB',
    border: '#D1D5DB',
    borderSoft: '#E5E7EB',
    text: '#1F2937',
    textDim: '#4B5563',
    textMute: '#6B7280',
    violet: '#7C3AED',
    violetDim: '#6D28D9',
    violetBg: 'rgba(124,58,237,0.08)',
    violetBorder: 'rgba(124,58,237,0.25)',
    emerald: '#059669',
    amber: '#D97706',
    rose: '#DC2626',
    cyan: '#0891B2',
  },
  beige: {
    bg: '#FAF8F3',
    bgElev: '#F5F1EB',
    bgCard: '#EFE9E0',
    bgCardHover: '#E8E1D7',
    border: '#D4C9BC',
    borderSoft: '#E8E1D7',
    text: '#3E3930',
    textDim: '#5F5A50',
    textMute: '#7A746A',
    violet: '#8B7CF6',
    violetDim: '#7861D9',
    violetBg: 'rgba(139,124,246,0.1)',
    violetBorder: 'rgba(139,124,246,0.25)',
    emerald: '#047857',
    amber: '#D97706',
    rose: '#BE123C',
    cyan: '#0891B2',
  },
}

export function getPalette(themeName: ThemeName): Palette {
  return themes[themeName]
}
