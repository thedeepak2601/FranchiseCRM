import { Grid2X2, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'

export type ViewMode = 'grid' | 'list'

type ViewToggleProps = {
  value: ViewMode
  onChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { palette } = useTheme()

  return (
    <div className="flex h-11 shrink-0 items-center rounded-lg border p-1" style={{ borderColor: palette.border, background: palette.bgCard }}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        title="Grid view"
        style={{ background: value === 'grid' ? palette.violet : 'transparent', color: value === 'grid' ? 'white' : palette.textDim }}
      >
        <Grid2X2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange('list')}
        aria-label="List view"
        title="List view"
        style={{ background: value === 'list' ? palette.violet : 'transparent', color: value === 'list' ? 'white' : palette.textDim }}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
