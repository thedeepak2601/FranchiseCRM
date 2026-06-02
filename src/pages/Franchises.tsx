import { useEffect, useMemo, useState } from 'react'
import { Building2, Edit, MoreHorizontal, Plus, Save, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

type Franchise = {
  id: string
  name: string
  owner: string
  location: string
  revenue: number
  growth: number
  status: 'active' | 'pending' | 'inactive'
  since: string
}

const initialFranchises: Franchise[] = [
  { id: 'FR-001', name: 'Spice Route - Connaught Place', owner: 'Rajesh Kumar', location: 'Delhi NCR', revenue: 45.2, growth: 18, status: 'active', since: '2024-01' },
  { id: 'FR-002', name: 'Spice Route - Marine Drive', owner: 'Priya Sharma', location: 'Mumbai', revenue: 38.5, growth: 12, status: 'active', since: '2024-03' },
  { id: 'FR-003', name: 'Spice Route - Indiranagar', owner: 'Amit Patel', location: 'Bangalore', revenue: 32.1, growth: 15, status: 'active', since: '2024-02' },
  { id: 'FR-004', name: 'Spice Route - Jubilee Hills', owner: 'Sneha Reddy', location: 'Hyderabad', revenue: 28.8, growth: 22, status: 'active', since: '2024-04' },
  { id: 'FR-005', name: 'Spice Route - Salt Lake', owner: 'Vikram Singh', location: 'Kolkata', revenue: 24.5, growth: 8, status: 'pending', since: '2025-01' },
  { id: 'FR-006', name: 'Spice Route - T Nagar', owner: 'Karthik R', location: 'Chennai', revenue: 22.1, growth: 5, status: 'active', since: '2024-05' },
]
const pageSize = 12

const emptyDraft: Omit<Franchise, 'id'> = {
  name: '',
  owner: '',
  location: '',
  revenue: 0,
  growth: 0,
  status: 'active',
  since: new Date().toISOString().slice(0, 7),
}

export default function Franchises() {
  const { palette } = useTheme()
  const [franchises, setFranchises] = useState(initialFranchises)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Franchise['status']>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Franchise | null>(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const filteredFranchises = useMemo(() => franchises.filter((franchise) => {
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch = !term || [franchise.name, franchise.owner, franchise.location, franchise.id].some((value) => value.toLowerCase().includes(term))
    const matchesStatus = statusFilter === 'all' || franchise.status === statusFilter
    return matchesSearch && matchesStatus
  }), [franchises, searchTerm, statusFilter])
  const paginatedFranchises = filteredFranchises.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (franchise: Franchise) => {
    setEditing(franchise)
    setDraft({
      name: franchise.name,
      owner: franchise.owner,
      location: franchise.location,
      revenue: franchise.revenue,
      growth: franchise.growth,
      status: franchise.status,
      since: franchise.since,
    })
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setError('')
    setModalOpen(false)
  }

  const saveFranchise = () => {
    if (!draft.name.trim() || !draft.owner.trim() || !draft.location.trim()) {
      setError('Franchise name, owner, and location are required.')
      return
    }
    if (draft.revenue < 0) {
      setError('Revenue cannot be negative.')
      return
    }

    if (editing) {
      setFranchises((current) => current.map((item) => item.id === editing.id ? { ...editing, ...draft } : item))
    } else {
      const nextId = `FR-${String(franchises.length + 1).padStart(3, '0')}`
      setFranchises((current) => [{ id: nextId, ...draft }, ...current])
    }
    closeModal()
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageHeaderTitle title="Franchises" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Manage your franchise network across all locations
          </p>
        </div>
        <Button style={{ background: palette.violet }} onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Franchise
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
          <Input
            placeholder="Search franchises..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 pl-10"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className="h-11 rounded-lg border px-4 text-sm capitalize transition-colors"
              style={{
                background: statusFilter === status ? palette.violet : palette.bgCard,
                color: statusFilter === status ? 'white' : palette.textDim,
                borderColor: statusFilter === status ? palette.violet : palette.border,
              }}
            >
              {status}
            </button>
          ))}
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
        {paginatedFranchises.map((franchise) => (
          <Card key={franchise.id} className="transition-all hover:-translate-y-0.5" style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardContent className={cn("p-4", viewMode === 'list' && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
              <div className={cn("flex items-start justify-between gap-3", viewMode === 'grid' && "mb-3", viewMode === 'list' && "min-w-0 flex-1")}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-medium" style={{ background: palette.violetBg, color: palette.violet }}>
                    {franchise.name.split('-').pop()?.trim().slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium" style={{ color: palette.text }}>{franchise.name}</h3>
                    <p className="text-xs" style={{ color: palette.textMute }}>{franchise.id}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(franchise)} aria-label={`Edit ${franchise.name}`}>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </Button>
              </div>

              <div className={cn("space-y-2", viewMode === 'grid' && "mb-3", viewMode === 'list' && "sm:w-56")}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback style={{ background: palette.violet, color: 'white', fontSize: '10px' }}>
                      {franchise.owner.split(' ').map((name) => name[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm" style={{ color: palette.textDim }}>{franchise.owner}</span>
                </div>
                <div className="text-sm" style={{ color: palette.textMute }}>{franchise.location}</div>
              </div>

              <div className={cn("flex items-center justify-between gap-3", viewMode === 'grid' && "border-t pt-3", viewMode === 'list' && "sm:w-72")} style={{ borderColor: palette.border }}>
                <div>
                  <p className="text-xs" style={{ color: palette.textMute }}>Revenue</p>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>Rs {franchise.revenue}L</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: palette.textMute }}>Growth</p>
                  <p className="text-sm font-medium" style={{ color: franchise.growth >= 0 ? palette.emerald : palette.rose }}>{franchise.growth >= 0 ? '+' : ''}{franchise.growth}%</p>
                </div>
                <Badge variant={franchise.status === 'active' ? 'success' : franchise.status === 'pending' ? 'warning' : 'secondary'}>
                  {franchise.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination page={page} pageSize={pageSize} totalItems={filteredFranchises.length} onPageChange={setPage} itemLabel="franchises" />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{editing ? 'Edit Franchise' : 'Add Franchise'}</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>All required operating fields are editable.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error ? <div className="mb-3 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>{error}</div> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Franchise name, e.g. Spice Route - Pune" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input placeholder="Owner name, e.g. Rajesh Kumar" value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input placeholder="City / location, e.g. Mumbai" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="month" value={draft.since} onChange={(event) => setDraft({ ...draft, since: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Revenue in lakhs, e.g. 45.2" value={draft.revenue || ''} onChange={(event) => setDraft({ ...draft, revenue: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Growth percent, e.g. 18" value={draft.growth || ''} onChange={(event) => setDraft({ ...draft, growth: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <select className="h-10 rounded-md border px-3 text-sm capitalize" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Franchise['status'] })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>Cancel</Button>
              <Button type="button" onClick={saveFranchise} style={{ background: palette.violet }}>
                {editing ? <Edit className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {editing ? 'Save Changes' : 'Create Franchise'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
