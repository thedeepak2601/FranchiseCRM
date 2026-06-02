import { useEffect, useState } from 'react'
import { Package, Plus, Search, MoreHorizontal, TrendingUp, Building2, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

type Brand = {
  id: string
  name: string
  category: string
  franchises: number
  revenue: number
  growth: number
  color: string
  status: 'active' | 'pending'
}

const initialBrands: Brand[] = [
  { id: 'BR-001', name: 'Spice Route', category: 'Restaurant', franchises: 24, revenue: 8.2, growth: 15, color: '#8B7CF6', status: 'active' },
  { id: 'BR-002', name: 'Cafe Culture', category: 'Cafe', franchises: 12, revenue: 2.4, growth: 22, color: '#10B981', status: 'active' },
  { id: 'BR-003', name: 'Quick Bites', category: 'Fast Food', franchises: 8, revenue: 1.2, growth: 8, color: '#F59E0B', status: 'active' },
  { id: 'BR-004', name: 'Sweet Tooth', category: 'Bakery', franchises: 4, revenue: 0.6, growth: 12, color: '#06B6D4', status: 'pending' },
]
const pageSize = 12

export default function Brands() {
  const { palette } = useTheme()
  const [brands, setBrands] = useState(initialBrands)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [draft, setDraft] = useState<Omit<Brand, 'id'>>({
    name: '',
    category: '',
    franchises: 0,
    revenue: 0,
    growth: 0,
    color: palette.violet,
    status: 'active',
  })
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredBrands = brands.filter((brand) => {
    const term = searchTerm.trim().toLowerCase()
    return !term || [brand.name, brand.category, brand.id].some((value) => value.toLowerCase().includes(term))
  })
  const paginatedBrands = filteredBrands.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const openCreate = () => {
    setEditing(null)
    setDraft({ name: '', category: '', franchises: 0, revenue: 0, growth: 0, color: palette.violet, status: 'active' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setDraft({
      name: brand.name,
      category: brand.category,
      franchises: brand.franchises,
      revenue: brand.revenue,
      growth: brand.growth,
      color: brand.color,
      status: brand.status,
    })
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setError('')
  }

  const saveBrand = () => {
    if (!draft.name.trim() || !draft.category.trim()) {
      setError('Brand name and category are required.')
      return
    }
    if (editing) {
      setBrands((current) => current.map((brand) => brand.id === editing.id ? { ...editing, ...draft } : brand))
    } else {
      setBrands((current) => [{ id: `BR-${String(current.length + 1).padStart(3, '0')}`, ...draft }, ...current])
    }
    closeModal()
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeaderTitle title="Brands" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Manage your brand portfolio across different categories
          </p>
        </div>
        <Button style={{ background: palette.violet }} onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          />
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Brand Cards */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2' : 'space-y-3'}>
        {paginatedBrands.map((brand) => (
          <Card 
            key={brand.id}
            className={cn("cursor-pointer transition-all", viewMode === 'grid' && "hover:scale-[1.02]")}
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <CardContent className={cn("p-5", viewMode === 'list' && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
              <div className={cn("flex items-start justify-between", viewMode === 'grid' && "mb-4", viewMode === 'list' && "min-w-0 flex-1")}>
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${brand.color}20` }}
                  >
                    <Package className="h-6 w-6" style={{ color: brand.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
                      {brand.name}
                    </h3>
                    <p className="text-sm" style={{ color: palette.textMute }}>{brand.category}</p>
                  </div>
                </div>
                <button type="button" onClick={() => openEdit(brand)} aria-label={`Edit ${brand.name}`}>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </button>
              </div>

              <div className={cn("grid grid-cols-3 gap-4", viewMode === 'grid' && "mb-4", viewMode === 'list' && "min-w-[260px]")}>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Building2 className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Franchises</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.text }}>{brand.franchises}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Revenue</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.text }}>₹{brand.revenue}Cr</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Growth</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: palette.emerald }}>+{brand.growth}%</p>
                </div>
              </div>

              <div className={cn("flex items-center justify-between gap-3", viewMode === 'grid' && "border-t pt-3", viewMode === 'list' && "sm:w-40")} style={{ borderColor: palette.border }}>
                <span className="text-xs" style={{ color: palette.textMute }}>ID: {brand.id}</span>
                <Badge variant={brand.status === 'active' ? 'success' : 'warning'}>
                  {brand.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination page={page} pageSize={pageSize} totalItems={filteredBrands.length} onPageChange={setPage} itemLabel="brands" />
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{editing ? 'Edit Brand' : 'Add Brand'}</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>Maintain the brand catalog used by franchises.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error ? <div className="mb-3 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>{error}</div> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Brand name, e.g. Spice Route" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input placeholder="Category, e.g. Restaurant" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Franchise count, e.g. 24" value={draft.franchises || ''} onChange={(event) => setDraft({ ...draft, franchises: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Revenue in crores, e.g. 8.2" value={draft.revenue || ''} onChange={(event) => setDraft({ ...draft, revenue: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Growth percent, e.g. 15" value={draft.growth || ''} onChange={(event) => setDraft({ ...draft, growth: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <select className="h-10 rounded-md border px-3 text-sm capitalize" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Brand['status'] })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>Cancel</Button>
              <Button type="button" onClick={saveBrand} style={{ background: palette.violet }}>
                <Save className="mr-2 h-4 w-4" />
                Save Brand
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
