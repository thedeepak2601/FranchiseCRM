import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'

type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  itemLabel?: string
}

export function Pagination({ page, pageSize, totalItems, onPageChange, itemLabel = 'records' }: PaginationProps) {
  const { palette } = useTheme()
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const changePage = (nextPage: number) => {
    onPageChange(Math.min(Math.max(nextPage, 1), totalPages))
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24
      if (isNearBottom && currentPage < totalPages) {
        changePage(currentPage + 1)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: palette.border, background: palette.bgCard }}>
      <div className="text-sm" style={{ color: palette.textMute }}>
        Showing {start}-{end} of {totalItems} {itemLabel}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          style={{ borderColor: palette.border, color: palette.text }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((nextPage) => (
          <Button
            key={nextPage}
            type="button"
            variant={nextPage === currentPage ? 'default' : 'outline'}
            className="h-9 min-w-9"
            onClick={() => changePage(nextPage)}
            style={{
              background: nextPage === currentPage ? palette.violet : palette.bgElev,
              borderColor: nextPage === currentPage ? palette.violet : palette.border,
              color: nextPage === currentPage ? 'white' : palette.text,
            }}
          >
            {nextPage}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          style={{ borderColor: palette.border, color: palette.text }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
