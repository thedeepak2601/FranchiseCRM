import { useEffect, useMemo, useState } from 'react'
import { Edit, ListChecks, Plus, Save, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { useTheme } from '@/lib/theme-context'

type LeadStatusMasterRecord = {
  id: string
  name: string
  code: string
  color: string
  description: string
  sortOrder: number
  active: boolean
}

const initialStatuses: LeadStatusMasterRecord[] = [
  { id: 'LS-001', name: 'New', code: 'new', color: '#2563EB', description: 'Fresh lead captured in CRM.', sortOrder: 1, active: true },
  { id: 'LS-002', name: 'In Progress', code: 'in_progress', color: '#F59E0B', description: 'Sales team is working the lead.', sortOrder: 2, active: true },
  { id: 'LS-003', name: 'Qualified', code: 'qualified', color: '#10B981', description: 'Lead has passed basic qualification.', sortOrder: 3, active: true },
  { id: 'LS-004', name: 'Nurture', code: 'nurture', color: '#8B5CF6', description: 'Lead needs follow-up over time.', sortOrder: 4, active: true },
  { id: 'LS-005', name: 'Disqualified', code: 'disqualified', color: '#EF4444', description: 'Lead is not suitable right now.', sortOrder: 5, active: true },
  { id: 'LS-006', name: 'Converted', code: 'converted', color: '#059669', description: 'Lead has become a customer/franchise opportunity.', sortOrder: 6, active: true },
]
const pageSize = 12

const emptyDraft: Omit<LeadStatusMasterRecord, 'id'> = {
  name: '',
  code: '',
  color: '#2563EB',
  description: '',
  sortOrder: 1,
  active: true,
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export default function LeadStatusMaster() {
  const { palette } = useTheme()
  const [statuses, setStatuses] = useState(initialStatuses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LeadStatusMasterRecord | null>(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filteredStatuses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return statuses
      .filter((status) => {
        const matchesSearch = !term || [status.name, status.code, status.description].some((value) => value.toLowerCase().includes(term))
        const matchesFilter = statusFilter === 'all' || (statusFilter === 'active' ? status.active : !status.active)
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [searchTerm, statusFilter, statuses])
  const paginatedStatuses = filteredStatuses.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter])

  const openCreate = () => {
    setEditing(null)
    setDraft({ ...emptyDraft, sortOrder: statuses.length + 1 })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (status: LeadStatusMasterRecord) => {
    setEditing(status)
    setDraft({
      name: status.name,
      code: status.code,
      color: status.color,
      description: status.description,
      sortOrder: status.sortOrder,
      active: status.active,
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

  const saveStatus = () => {
    const code = slugify(draft.code || draft.name)
    if (!draft.name.trim() || !code) {
      setError('Status name and code are required.')
      return
    }

    const duplicate = statuses.some((status) => status.code === code && status.id !== editing?.id)
    if (duplicate) {
      setError('Status code must be unique.')
      return
    }

    const nextDraft = {
      ...draft,
      name: draft.name.trim(),
      code,
      description: draft.description.trim(),
      sortOrder: Math.max(1, Number(draft.sortOrder) || 1),
    }

    if (editing) {
      setStatuses((current) => current.map((status) => (status.id === editing.id ? { ...editing, ...nextDraft } : status)))
    } else {
      const nextId = `LS-${String(statuses.length + 1).padStart(3, '0')}`
      setStatuses((current) => [{ id: nextId, ...nextDraft }, ...current])
    }

    closeModal()
  }

  const deleteStatus = (statusId: string) => {
    const status = statuses.find((item) => item.id === statusId)
    if (!status || !window.confirm(`Delete ${status.name}?`)) return
    setStatuses((current) => current.filter((item) => item.id !== statusId))
  }

  const filterCounts = {
    all: statuses.length,
    active: statuses.filter((status) => status.active).length,
    inactive: statuses.filter((status) => !status.active).length,
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageHeaderTitle title="Lead Status Master" />
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            Maintain lead statuses used across the sales lifecycle.
          </p>
        </div>
        <Button style={{ background: palette.violet }} onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Status
        </Button>
      </div>

      <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'inactive'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm capitalize transition-colors"
                  style={{
                    background: statusFilter === filter ? palette.violet : palette.bgElev,
                    color: statusFilter === filter ? 'white' : palette.text,
                    borderColor: statusFilter === filter ? palette.violet : palette.border,
                  }}
                >
                  {filter}
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: statusFilter === filter ? 'rgba(255,255,255,0.18)' : palette.bg }}>
                    {filterCounts[filter]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="relative min-w-[260px] flex-1 lg:w-[430px] lg:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search status name or code"
                  className="h-11 pl-10"
                  style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
                />
              </div>
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paginatedStatuses.map((status) => (
                <Card key={status.id} style={{ background: palette.bgElev, borderColor: palette.border }}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full border" style={{ background: status.color, borderColor: palette.border }} />
                          <span className="truncate text-sm font-medium" style={{ color: palette.text }}>{status.name}</span>
                        </div>
                        <div className="mt-1 text-xs" style={{ color: palette.textMute }}>{status.code}</div>
                      </div>
                      <Badge variant={status.active ? 'success' : 'secondary'}>{status.active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-sm" style={{ color: palette.textDim }}>{status.description || 'No description'}</p>
                    <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: palette.border }}>
                      <span className="text-xs" style={{ color: palette.textMute }}>Order {status.sortOrder}</span>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(status)} aria-label={`Edit ${status.name}`}>
                          <Edit className="h-4 w-4" style={{ color: palette.amber }} />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => deleteStatus(status.id)} aria-label={`Delete ${status.name}`}>
                          <Trash2 className="h-4 w-4" style={{ color: palette.rose }} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: palette.border }}>
            <div className="grid grid-cols-[80px_minmax(180px,1fr)_160px_140px_120px_120px] border-b px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ background: palette.bgElev, borderColor: palette.border, color: palette.textMute }}>
              <div>Order</div>
              <div>Status Name</div>
              <div>Code</div>
              <div>Color</div>
              <div>State</div>
              <div className="text-right">Actions</div>
            </div>
            {paginatedStatuses.map((status) => (
              <div key={status.id} className="grid grid-cols-[80px_minmax(180px,1fr)_160px_140px_120px_120px] items-center border-b px-4 py-3 last:border-b-0" style={{ borderColor: palette.border }}>
                <div className="text-sm" style={{ color: palette.textDim }}>{status.sortOrder}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 shrink-0" style={{ color: status.color }} />
                    <span className="truncate text-sm font-medium" style={{ color: palette.text }}>{status.name}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs" style={{ color: palette.textMute }}>{status.description || 'No description'}</p>
                </div>
                <div className="text-sm" style={{ color: palette.textDim }}>{status.code}</div>
                <div className="flex items-center gap-2 text-sm" style={{ color: palette.textDim }}>
                  <span className="h-5 w-5 rounded-full border" style={{ background: status.color, borderColor: palette.border }} />
                  {status.color}
                </div>
                <div>
                  <Badge variant={status.active ? 'success' : 'secondary'}>{status.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(status)} aria-label={`Edit ${status.name}`}>
                    <Edit className="h-4 w-4" style={{ color: palette.amber }} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => deleteStatus(status.id)} aria-label={`Delete ${status.name}`}>
                    <Trash2 className="h-4 w-4" style={{ color: palette.rose }} />
                  </Button>
                </div>
              </div>
            ))}
            {filteredStatuses.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm" style={{ color: palette.textMute }}>No lead status found.</div>
            ) : null}
          </div>
          )}
          <div className="mt-4">
            <Pagination page={page} pageSize={pageSize} totalItems={filteredStatuses.length} onPageChange={setPage} itemLabel="statuses" />
          </div>
        </CardContent>
      </Card>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
          <div className="w-full max-w-xl rounded-xl border p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} style={{ background: palette.bgCard, borderColor: palette.border }}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{editing ? 'Edit Lead Status' : 'Add Lead Status'}</h2>
                <p className="text-sm" style={{ color: palette.textMute }}>Status code is used for filters and integrations.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error ? <div className="mb-3 rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>{error}</div> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                placeholder="Status name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value, code: draft.code || slugify(event.target.value) })}
                style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
              />
              <Input
                placeholder="Status code"
                value={draft.code}
                onChange={(event) => setDraft({ ...draft, code: slugify(event.target.value) })}
                style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
              />
              <Input
                type="number"
                min={1}
                placeholder="Sort order"
                value={draft.sortOrder}
                onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })}
                style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
              />
              <Input
                type="color"
                value={draft.color}
                onChange={(event) => setDraft({ ...draft, color: event.target.value })}
                className="h-10"
                style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
              />
              <Input
                className="sm:col-span-2"
                placeholder="Description"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
              />
              <label className="flex items-center gap-2 text-sm" style={{ color: palette.text }}>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
                  style={{ accentColor: palette.violet }}
                />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModal} style={{ borderColor: palette.border, color: palette.text }}>Cancel</Button>
              <Button type="button" onClick={saveStatus} style={{ background: palette.violet }}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
