import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'

type PageHeaderTitleProps = {
  title: string
}

export function PageHeaderTitle({ title }: PageHeaderTitleProps) {
  const navigate = useNavigate()
  const { palette } = useTheme()

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={goBack}
        aria-label="Go back"
        title="Go back"
      >
        <ChevronLeft className="h-5 w-5" style={{ color: palette.text }} />
      </Button>
      <h1 className="text-2xl font-bold" style={{ color: palette.text }}>{title}</h1>
    </div>
  )
}
