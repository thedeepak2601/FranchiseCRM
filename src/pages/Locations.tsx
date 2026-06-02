import { useEffect, useState } from 'react'
import { MapPin, Plus, Search, MoreHorizontal, Building2, IndianRupee, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

type Location = {
  id: string
  name: string
  region: string
  franchises: number
  revenue: number
  occupancy: number
  status: 'active' | 'pending' | 'average'
}

const initialLocations: Location[] = [
  { id: 'LOC-001', name: 'Delhi NCR', region: 'North', franchises: 12, revenue: 3.2, occupancy: 95, status: 'active' },
  { id: 'LOC-002', name: 'Mumbai', region: 'West', franchises: 8, revenue: 2.8, occupancy: 88, status: 'active' },
  { id: 'LOC-003', name: 'Bangalore', region: 'South', franchises: 6, revenue: 2.1, occupancy: 92, status: 'active' },
  { id: 'LOC-004', name: 'Chennai', region: 'South', franchises: 5, revenue: 1.9, occupancy: 85, status: 'active' },
  { id: 'LOC-005', name: 'Hyderabad', region: 'South', franchises: 4, revenue: 1.4, occupancy: 90, status: 'active' },
  { id: 'LOC-006', name: 'Kolkata', region: 'East', franchises: 3, revenue: 1.1, occupancy: 78, status: 'average' },
  { id: 'LOC-007', name: 'Pune', region: 'West', franchises: 2, revenue: 0.8, occupancy: 82, status: 'active' },
  { id: 'LOC-008', name: 'Ahmedabad', region: 'West', franchises: 2, revenue: 0.6, occupancy: 75, status: 'pending' },
]
const pageSize = 12

export default function Locations() {
  const { palette } = useTheme()
  const [locations, setLocations] = useState(initialLocations)
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [draft, setDraft] = useState<Omit<Location, 'id'>>({
    name: '',
    region: '',
    franchises: 0,
    revenue: 0,
    occupancy: 0,
    status: 'active',
  })
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const regions = ['all', ...new Set(locations.map(l => l.region))]

  const filteredLocations = locations.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === 'all' || l.region === regionFilter
    return matchesSearch && matchesRegion
  })
  const paginatedLocations = filteredLocations.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [regionFilter, searchTerm])

  const openCreate = () => {
    setEditing(null)
    setDraft({ name: '', region: '', franchises: 0, revenue: 0, occupancy: 0, status: 'active' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (location: Location) => {
    setEditing(location)
    setDraft({
      name: location.name,
      region: location.region,
      franchises: location.franchises,
      revenue: location.revenue,
      occupancy: location.occupancy,
      status: location.status,
    })
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setError('')
  }

  const saveLocation = () => {
    if (!draft.name.trim() || !draft.region.trim()) {
      setError('Location and region are required.')
      return
    }
    if (draft.occupancy < 0 || draft.occupancy > 100) {
      setError('Occupancy must be between 0 and 100.')
      return
    }
    if (editing) {
      setLocations((current) => current.map((location) => location.id === editing.id ? { ...editing, ...draft } : location))
    } else {
      setLocations((current) => [{ id: `LOC-${String(current.length + 1).padStart(3, '0')}`, ...draft }, ...current])
    }
    closeModal()
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeaderTitle title="Locations" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Track franchise presence across geographic regions
          </p>
        </div>
        <Button style={{ background: palette.violet }} onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setRegionFilter(region)}
              className="px-4 py-2 text-sm rounded-lg capitalize transition-colors"
              style={{
                background: regionFilter === region ? palette.violet : palette.bgCard,
                color: regionFilter === region ? 'white' : palette.textDim,
                border: `1px solid ${palette.border}`,
              }}
            >
              {region}
            </button>
          ))}
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Location Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
        {paginatedLocations.map((location) => (
          <Card 
            key={location.id}
            className="cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <CardContent className={cn("p-4", viewMode === 'list' && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
              <div className={cn("flex items-start justify-between", viewMode === 'grid' && "mb-3", viewMode === 'list' && "min-w-0 flex-1")}>
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ background: palette.violetBg }}
                  >
                    <MapPin className="h-5 w-5" style={{ color: palette.violet }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium" style={{ color: palette.text }}>
                      {location.name}
                    </h3>
                    <p className="text-xs" style={{ color: palette.textMute }}>{location.region}</p>
                  </div>
                </div>
                <button type="button" onClick={() => openEdit(location)} aria-label={`Edit ${location.name}`}>
                  <MoreHorizontal className="h-4 w-4" style={{ color: palette.textMute }} />
                </button>
              </div>

              <div className={cn("grid grid-cols-2 gap-2", viewMode === 'grid' && "mb-3", viewMode === 'list' && "sm:w-56")}>
                <div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Franchises</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>{location.franchises}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" style={{ color: palette.textMute }} />
                    <span className="text-xs" style={{ color: palette.textMute }}>Revenue</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: palette.text }}>₹{location.revenue}Cr</p>
                </div>
              </div>

              <div className={cn(viewMode === 'grid' && "border-t pt-3", viewMode === 'list' && "sm:w-56")} style={{ borderColor: palette.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: palette.textMute }}>Occupancy</span>
                  <span className="text-sm font-medium" style={{ 
                    color: location.occupancy >= 90 ? palette.emerald : 
                           location.occupancy >= 80 ? palette.amber : palette.rose 
                  }}>
                    {location.occupancy}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full" style={{ background: palette.border }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${location.occupancy}%`,
                      background: location.occupancy >= 90 ? palette.emerald : 
                                 location.occupancy >= 80 ? palette.amber : palette.rose 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination page={page} pageSize={pageSize} totalItems={filteredLocations.length} onPageChange={setPage} itemLabel="locations" />
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{editing ? 'Edit Location' : 'Add Location'}</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>Keep territory capacity and region data current.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error ? <div className="mb-3 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>{error}</div> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input placeholder="Location name, e.g. Delhi NCR" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input placeholder="Region, e.g. North" value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.target.value })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Franchise count, e.g. 12" value={draft.franchises || ''} onChange={(event) => setDraft({ ...draft, franchises: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Revenue in crores, e.g. 3.2" value={draft.revenue || ''} onChange={(event) => setDraft({ ...draft, revenue: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <Input type="number" placeholder="Occupancy percent, e.g. 95" value={draft.occupancy || ''} onChange={(event) => setDraft({ ...draft, occupancy: Number(event.target.value) })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }} />
              <select className="h-10 rounded-md border px-3 text-sm capitalize" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Location['status'] })} style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="average">Average</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>Cancel</Button>
              <Button type="button" onClick={saveLocation} style={{ background: palette.violet }}>
                <Save className="mr-2 h-4 w-4" />
                Save Location
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
