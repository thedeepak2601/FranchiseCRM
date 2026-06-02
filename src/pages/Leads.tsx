import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, FileText, AlertCircle, UserPlus, Phone, Target, TrendingUp, Shield, Briefcase, Users, Upload, ScanText, Image as ImageIcon, CheckCircle2, Clock, ListChecks, ShieldCheck, ChevronDown, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ViewToggle, type ViewMode } from '@/components/ui/view-toggle'
import { PageHeaderTitle } from '@/components/ui/page-header-title'
import { cn, formatLabel } from '@/lib/utils'
import { getLeadSubStage } from '@/lib/lead-stage'
import { LeadDetailPanel, LeadDetailsForm } from '@/components/leads'
import { useAddNote, useCompleteTask, useCreateFollowUp, useCreateInteraction, useCreateLead, useLead, useLeads, useUpdateLead, useUpdateLeadStage } from '@/hooks/useLeads'
import { extractLeadFieldsFromImage, getOcrBackendHealth } from '@/lib/lead-ocr'
import { STAGE_CONFIG } from '@/types/lead'
import type { CreateInteractionRequest, CreateLeadRequest, FollowUpPriority, Lead, LeadSource, LeadStage, LeadStatus, NextActionType } from '@/types/lead'
import type { LeadOcrResult, OcrBackendHealth, OcrFieldKey } from '@/lib/lead-ocr'
import { useTheme } from '@/lib/theme-context'


const STAGE_ICONS = {
  lead_capture: UserPlus,
  first_contact: Phone,
  qualification: Target,
  pipeline: TrendingUp,
  approvals: Shield,
  agreement: FileText,
  onboarding: Briefcase,
  post_sale: Users,
} satisfies Record<LeadStage, React.ElementType>

const LEADS_PAGE_SIZE = 12

export default function Leads() {
  const { palette } = useTheme()
  const emptyLeadCaptureForm = {
    capturedAt: new Date().toISOString().slice(0, 16),
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    investmentRange: '',
    notes: '',
    approximateClosureDate: '',
    nextConnectMode: '',
    nextConnectAt: '',
    reference: '',
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<'all' | LeadStage>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [expandedStageId, setExpandedStageId] = useState<LeadStage | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [showLeadDetailsForm, setShowLeadDetailsForm] = useState(false)
  const [showLeadCaptureForm, setShowLeadCaptureForm] = useState(false)
  const [ocrFile, setOcrFile] = useState<File | null>(null)
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState('')
  const [ocrRawText, setOcrRawText] = useState('')
  const [ocrProvider, setOcrProvider] = useState('')
  const [ocrError, setOcrError] = useState('')
  const [isExtractingOcr, setIsExtractingOcr] = useState(false)
  const [ocrBackendHealth, setOcrBackendHealth] = useState<OcrBackendHealth | null>(null)
  const [isCheckingOcrHealth, setIsCheckingOcrHealth] = useState(false)
  const [isTestingOcrConnection, setIsTestingOcrConnection] = useState(false)
  const [ocrHealthResponseText, setOcrHealthResponseText] = useState('')
  const [leadCaptureForm, setLeadCaptureForm] = useState(emptyLeadCaptureForm)
  const [ocrReviewResult, setOcrReviewResult] = useState<LeadOcrResult | null>(null)
  const [leadCaptureError, setLeadCaptureError] = useState('')
  const [leadActionError, setLeadActionError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [leadPage, setLeadPage] = useState(1)
  const [leadViewMode, setLeadViewMode] = useState<ViewMode>('list')
  const leadRegisterScrollRef = useRef<HTMLDivElement>(null)

  const ocrReviewFields: Array<{ key: OcrFieldKey; label: string }> = [
    { key: 'capturedAt', label: 'Date' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone No.' },
    { key: 'email', label: 'Email ID' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'investmentRange', label: 'Investment Range' },
    { key: 'approximateClosureDate', label: 'Approximate Closure Date' },
    { key: 'nextConnectMode', label: 'Next Connect Mode' },
    { key: 'nextConnectAt', label: 'Next Connect Time' },
    { key: 'reference', label: 'Reference' },
    { key: 'notes', label: 'Notes' },
  ]

  const filters = useMemo(
    () => ({
      search: searchTerm || undefined,
      stage: stageFilter === 'all' ? undefined : stageFilter,
      source: sourceFilter === 'all' ? undefined : sourceFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      assignedTo: ownerFilter === 'all' ? undefined : ownerFilter,
      page: leadPage,
      pageSize: LEADS_PAGE_SIZE,
    }),
    [leadPage, ownerFilter, searchTerm, sourceFilter, stageFilter, statusFilter]
  )

  const leadsQuery = useLeads(filters)
  const leads = leadsQuery.data?.data ?? []
  const totalLeadRecords = leadsQuery.data?.total ?? 0
  const totalLeadPages = Math.max(Math.ceil(totalLeadRecords / LEADS_PAGE_SIZE), 1)
  const hasNextLeadPage = leadPage < totalLeadPages
  const hasPreviousLeadPage = leadPage > 1
  const leadRecordStart = totalLeadRecords === 0 ? 0 : (leadPage - 1) * LEADS_PAGE_SIZE + 1
  const leadRecordEnd = Math.min(leadPage * LEADS_PAGE_SIZE, totalLeadRecords)
  const filterOptionsQuery = useLeads({ page: 1, pageSize: 500 })
  const allLeads = filterOptionsQuery.data?.data ?? leads
  const selectedLeadName = selectedLeadId || leads[0]?.id || ''
  const leadDetailQuery = useLead(selectedLeadName)
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const updateLeadStage = useUpdateLeadStage()
  const createInteraction = useCreateInteraction()
  const createFollowUp = useCreateFollowUp()
  const addNote = useAddNote()
  const completeTask = useCompleteTask()

  useEffect(() => {
    if (!selectedLeadId && leads[0]?.id) {
      setSelectedLeadId(leads[0].id)
    }
  }, [leads, selectedLeadId])

  useEffect(() => {
    if (!showLeadCaptureForm) {
      return
    }

    let active = true

    const checkHealth = async () => {
      setIsCheckingOcrHealth(true)
      const health = await getOcrBackendHealth()
      if (active) {
        setOcrBackendHealth(health)
        setIsCheckingOcrHealth(false)
      }
    }

    checkHealth()

    return () => {
      active = false
    }
  }, [showLeadCaptureForm])

  useEffect(() => {
    const closeOpenFormOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      if (ocrReviewResult) {
        setOcrReviewResult(null)
        return
      }

      if (showLeadCaptureForm) {
        closeLeadCaptureForm()
      }
    }

    window.addEventListener('keydown', closeOpenFormOnEscape)
    return () => window.removeEventListener('keydown', closeOpenFormOnEscape)
  }, [ocrReviewResult, showLeadCaptureForm])

  const selectedLeadDetail = leadDetailQuery.data?.lead.id === selectedLeadName ? leadDetailQuery.data : undefined
  const selectedLead = selectedLeadDetail?.lead ?? leads.find((lead) => lead.id === selectedLeadId)
  const selectedSubStage = selectedLead
    ? getLeadSubStage(selectedLead, {
        interactions: selectedLeadDetail?.interactions,
        followUpTasks: selectedLeadDetail?.followUpTasks,
        timeline: selectedLeadDetail?.timeline,
      })
    : null
  const stageEntries = Object.values(STAGE_CONFIG)

  const getStageIndex = (stageId: LeadStage) => stageEntries.findIndex((stage) => stage.id === stageId)
  const selectedStageIndex = selectedLead ? getStageIndex(selectedLead.stage) : -1
  const expandedStage = expandedStageId ? STAGE_CONFIG[expandedStageId] : null
  const expandedStageIndex = expandedStage ? getStageIndex(expandedStage.id) : -1
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    stageFilter !== 'all' ||
    sourceFilter !== 'all' ||
    statusFilter !== 'all' ||
    ownerFilter !== 'all'

  const uniqueSorted = <T extends string>(items: T[]) =>
    Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b))

  const sourceOptions = uniqueSorted(allLeads.map((lead) => lead.source))
  const statusOptions = uniqueSorted(allLeads.map((lead) => lead.status))
  const ownerOptions = uniqueSorted(allLeads.map((lead) => lead.assignedTo || lead.owner))

  useEffect(() => {
    setLeadPage(1)
    leadRegisterScrollRef.current?.scrollTo({ top: 0 })
  }, [ownerFilter, searchTerm, sourceFilter, stageFilter, statusFilter])

  useEffect(() => {
    leadRegisterScrollRef.current?.scrollTo({ top: 0 })
  }, [leadPage])

  const handleLeadRegisterScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 24

    if (isNearBottom && hasNextLeadPage && !leadsQuery.isFetching) {
      setLeadPage((current) => current + 1)
    }
  }

  const goToLeadPage = (page: number) => {
    setLeadPage(Math.min(Math.max(page, 1), totalLeadPages))
  }

  const matchesHeaderFilters = (lead: Lead) => {
    const term = searchTerm.trim().toLowerCase()
    const owner = lead.assignedTo || lead.owner
    const searchable = [lead.id, lead.name, lead.email, lead.phone, lead.location, lead.state, owner]

    return (
      (!term || searchable.some((value) => value?.toLowerCase().includes(term))) &&
      (sourceFilter === 'all' || lead.source === sourceFilter) &&
      (statusFilter === 'all' || lead.status === statusFilter) &&
      (ownerFilter === 'all' || owner === ownerFilter)
    )
  }

  const stageSummaryLeads = allLeads.filter(matchesHeaderFilters)

  const clearAllFilters = () => {
    setSearchTerm('')
    setStageFilter('all')
    setSourceFilter('all')
    setStatusFilter('all')
    setOwnerFilter('all')
  }

  const handleStageHeaderClick = (stageId: LeadStage) => {
    setExpandedStageId((current) => (current === stageId ? null : stageId))
    setStageFilter(stageId)
  }

  const openLeadDetailsForm = (leadId: string) => {
    setSelectedLeadId(leadId)
    setShowLeadDetailsForm(true)
  }

  const handleLeadStatusChange = async (status: LeadStatus, comments?: string) => {
    if (!selectedLead) return
    setLeadActionError('')
    if (status !== selectedLead.status) {
      await updateLead.mutateAsync({
        name: selectedLead.id,
        data: {
          status,
          updated: new Date().toISOString(),
        },
      })
    }

    if (comments?.trim()) {
      await addNote.mutateAsync({
        leadId: selectedLead.id,
        note: `Status note (${formatLabel(status)}): ${comments.trim()}`,
      })
    }
  }

  const handleLeadUpdate = async (data: Partial<Lead>) => {
    if (!selectedLead) return
    await updateLead.mutateAsync({
      name: selectedLead.id,
      data: {
        ...data,
        updated: new Date().toISOString(),
      },
    })
  }

  const showAllStages = () => {
    setStageFilter('all')
    setExpandedStageId(null)
  }

  const getScoreTone = (score: number) => {
    if (score >= 70) return { bg: palette.emerald + '20', color: palette.emerald }
    if (score >= 50) return { bg: palette.amber + '20', color: palette.amber }
    return { bg: palette.rose + '20', color: palette.rose }
  }

  const getOcrHealthTone = () => {
    if (isCheckingOcrHealth) {
      return {
        border: palette.amber,
        color: palette.amber,
      }
    }

    if (ocrBackendHealth?.ok && ocrBackendHealth.visionReady) {
      return {
        border: palette.emerald,
        color: palette.emerald,
      }
    }

    return {
      border: palette.rose,
      color: palette.rose,
    }
  }

  const ocrServiceLabel = ocrBackendHealth?.service === 'ocr-space' ? 'OCR.Space' : 'Google Vision'

  const updateLeadCaptureField = (field: keyof typeof leadCaptureForm, value: string) => {
    setLeadCaptureForm((current) => ({ ...current, [field]: value }))
  }

  const resetLeadCaptureState = () => {
    setLeadCaptureForm({
      ...emptyLeadCaptureForm,
      capturedAt: new Date().toISOString().slice(0, 16),
    })
    setOcrRawText('')
    setOcrProvider('')
    setOcrError('')
    setOcrHealthResponseText('')
    setOcrReviewResult(null)
    handleOcrFileChange(null)
  }

  const closeLeadCaptureForm = () => {
    resetLeadCaptureState()
    setShowLeadCaptureForm(false)
  }

  const handleOcrFileChange = (file: File | null) => {
    setOcrFile(file)
    setOcrRawText('')
    setOcrProvider('')
    setOcrError('')
    setOcrReviewResult(null)
    if (ocrPreviewUrl) {
      URL.revokeObjectURL(ocrPreviewUrl)
    }
    if (file) {
      setOcrPreviewUrl(URL.createObjectURL(file))
    } else {
      setOcrPreviewUrl('')
    }
  }

  const applyOcrResultToForm = (result: LeadOcrResult) => {
    setLeadCaptureForm((current) => ({
      ...current,
      capturedAt: result.capturedAt || current.capturedAt,
      name: result.name || current.name,
      phone: result.phone || current.phone,
      email: result.email || current.email,
      city: result.city || current.city,
      state: result.state || current.state,
      investmentRange: result.investmentRange || current.investmentRange,
      notes: result.notes || current.notes,
      approximateClosureDate: result.approximateClosureDate || current.approximateClosureDate,
      nextConnectMode: result.nextConnectMode || current.nextConnectMode,
      nextConnectAt: result.nextConnectAt || current.nextConnectAt,
      reference: result.reference || current.reference,
    }))
  }

  const handleExtractFromImage = async () => {
    if (!ocrFile) return
    setIsExtractingOcr(true)
    setOcrError('')
    try {
      const result = await extractLeadFieldsFromImage(ocrFile)
      setOcrRawText(result.rawText)
      setOcrProvider(result.provider || '')
      setOcrReviewResult(result)
      applyOcrResultToForm(result)
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : 'OCR extraction failed')
    } finally {
      setIsExtractingOcr(false)
    }
  }

  const handleTestVisionConnection = async () => {
    setIsTestingOcrConnection(true)
    setOcrError('')

    try {
      const health = await getOcrBackendHealth()
      setOcrBackendHealth(health)
      setOcrHealthResponseText(JSON.stringify(health, null, 2))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OCR connection test failed'
      setOcrError(message)
      setOcrHealthResponseText(
        JSON.stringify(
          {
            ok: false,
            message,
          },
          null,
          2
        )
      )
    } finally {
      setIsTestingOcrConnection(false)
      setIsCheckingOcrHealth(false)
    }
  }

  const handleLeadCaptureSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLeadCaptureError('')

    const numericInvestment = parseInt(leadCaptureForm.investmentRange.replace(/\D/g, '').slice(0, 3) || '0', 10)
    const trimmedName = leadCaptureForm.name.trim()
    const normalizedPhone = leadCaptureForm.phone.replace(/\D/g, '')
    const trimmedEmail = leadCaptureForm.email.trim()

    if (trimmedName.length < 2) {
      setLeadCaptureError('Lead name must be at least 2 characters.')
      return
    }

    if (normalizedPhone.length < 10) {
      setLeadCaptureError('Enter a valid phone number with at least 10 digits.')
      return
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLeadCaptureError('Enter a valid email address.')
      return
    }

    if (!leadCaptureForm.city.trim()) {
      setLeadCaptureError('City / location is required.')
      return
    }

    if (numericInvestment < 1) {
      setLeadCaptureError('Investment must be at least 1L. Add a value like 20L-30L.')
      return
    }

    const duplicateLead = allLeads.find((lead) => {
      const leadPhone = lead.phone.replace(/\D/g, '')
      return (
        (leadPhone && leadPhone === normalizedPhone) ||
        (trimmedEmail && lead.email?.toLowerCase() === trimmedEmail.toLowerCase())
      )
    })

    if (duplicateLead) {
      setLeadCaptureError(`Duplicate lead found: ${duplicateLead.name} (${duplicateLead.id}). Phone and email must be unique.`)
      return
    }

    const payload: CreateLeadRequest = {
      name: trimmedName,
      phone: leadCaptureForm.phone.trim(),
      email: trimmedEmail,
      source: 'other',
      investment: numericInvestment,
      investmentRange: leadCaptureForm.investmentRange,
      location: leadCaptureForm.city.trim(),
      state: leadCaptureForm.state.trim(),
      initialNotes: leadCaptureForm.notes,
      expectedClosureDate: leadCaptureForm.approximateClosureDate || undefined,
      nextConnectMode: leadCaptureForm.nextConnectMode || undefined,
      nextConnectAt: leadCaptureForm.nextConnectAt || undefined,
      referenceSource: leadCaptureForm.reference || undefined,
      capturedAt: new Date(leadCaptureForm.capturedAt).toISOString(),
    }

    try {
      const createdLead = await createLead.mutateAsync(payload)
      setSelectedLeadId(createdLead.id)
      setStageFilter('all')
      setExpandedStageId(null)
      closeLeadCaptureForm()
    } catch (error) {
      setLeadCaptureError(error instanceof Error ? error.message : 'Lead could not be captured.')
    }
  }

  const exportVisibleLeads = () => {
    setIsExporting(true)
    const headers = ['Lead ID', 'Name', 'Phone', 'Email', 'Source', 'Investment', 'Location', 'State', 'Stage', 'Status', 'Score', 'Owner']
    const rows = leads.map((lead) => [
      lead.id,
      lead.name,
      lead.phone,
      lead.email,
      lead.source,
      `${lead.investment}L`,
      lead.location,
      lead.state || '',
      STAGE_CONFIG[lead.stage].name,
      formatLabel(lead.status),
      String(lead.score),
      lead.assignedTo || lead.owner,
    ])
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `franchise-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    window.setTimeout(() => setIsExporting(false), 250)
  }

  const handleMoveStage = async (stage: LeadStage) => {
    if (!selectedLead) return
    setLeadActionError('')
    try {
      await updateLeadStage.mutateAsync({
        leadId: selectedLead.id,
        newStage: stage,
        reason: 'Lifecycle action from lead detail panel',
      })
    } catch (error) {
      setLeadActionError(error instanceof Error ? error.message : 'Stage update failed')
    }
  }

  const handleMoveStatus = async (status: LeadStatus, comments?: string) => {
    try {
      await handleLeadStatusChange(status, comments)
    } catch (error) {
      setLeadActionError(error instanceof Error ? error.message : 'Status update failed')
    }
  }

  const handleLogInteraction = (data: CreateInteractionRequest) => {
    setLeadActionError('')
    createInteraction.mutate(data, {
      onError: (error) => setLeadActionError(error instanceof Error ? error.message : 'Interaction could not be logged'),
    })
  }

  const handleCreateFollowUp = (data: {
    leadId: string
    title: string
    description: string
    type: NextActionType
    scheduledAt: string
    priority: FollowUpPriority
    owner: string
  }) => {
    setLeadActionError('')
    createFollowUp.mutate(data, {
      onError: (error) => setLeadActionError(error instanceof Error ? error.message : 'Follow-up could not be created'),
    })
  }

  const applyOcrReviewResult = () => {
    if (!ocrReviewResult) return
    applyOcrResultToForm(ocrReviewResult)
    setOcrReviewResult(null)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="rounded-xl border p-4 lg:p-5" style={{ background: palette.bgCard, borderColor: palette.border }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <PageHeaderTitle title="Leads & Pipeline" />
            <p className="text-sm mt-1" style={{ color: palette.textMute }}>
              End-to-end franchise lifecycle management from capture to post-sale.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge style={{ background: palette.violetBg, color: palette.violet }}>
                {leads.length} visible leads
              </Badge>
              <Badge variant="secondary">
                {stageFilter === 'all' ? 'All stages' : STAGE_CONFIG[stageFilter].name}
              </Badge>
              {selectedSubStage ? (
                <Badge style={{ background: 'rgba(245,158,11,0.14)', color: palette.amber }}>
                  {selectedSubStage.shortDisplay}
                </Badge>
              ) : null}
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-white/5"
                  style={{ borderColor: palette.border, color: palette.textDim }}
                >
                  <X className="h-3 w-3" />
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportVisibleLeads} disabled={isExporting || leads.length === 0} style={{ borderColor: palette.border, color: palette.text }}>
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button style={{ background: palette.violet }} onClick={() => (showLeadCaptureForm ? closeLeadCaptureForm() : setShowLeadCaptureForm(true))}>
              <Plus className="h-4 w-4 mr-2" />
              {showLeadCaptureForm ? 'Close Form' : 'Add Lead'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
            <Input
              placeholder="Search by lead, phone, email, city, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10"
              style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | LeadSource)}
              className="h-11 w-full appearance-none rounded-lg border py-2 pl-10 pr-9 text-sm capitalize outline-none"
              style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
            >
              <option value="all">All Sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
              className="h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-sm capitalize outline-none"
              style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{formatLabel(status)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
          </div>

          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-sm outline-none"
              style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
            >
              <option value="all">All Owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.textMute }} />
          </div>
        </div>
      </div>

      {showLeadCaptureForm && (
        <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
          <CardHeader>
            <CardTitle style={{ color: palette.text }}>Lead Capture Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLeadCaptureSubmit}>
              {leadCaptureError ? (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                  {leadCaptureError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                <div className="space-y-3">
                  <label className="text-sm" style={{ color: palette.textMute }}>Upload Lead Form Image</label>
                  <label
                    className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center transition-colors hover:bg-white/5"
                    style={{ borderColor: palette.border, color: palette.text }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleOcrFileChange(e.target.files?.[0] ?? null)}
                    />
                    {ocrPreviewUrl ? (
                      <img
                        src={ocrPreviewUrl}
                        alt="Uploaded lead form"
                        className="max-h-40 w-full rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mb-2" style={{ color: palette.violet }} />
                        <p className="text-sm">Click to upload form image</p>
                        <p className="text-xs mt-1" style={{ color: palette.textMute }}>
                          JPG, PNG, mobile camera photo
                        </p>
                      </>
                    )}
                  </label>
                  <div
                    className="rounded-lg border p-3 text-xs space-y-1"
                    style={getOcrHealthTone()}
                  >
                    <div className="font-medium">
                      {isCheckingOcrHealth
                        ? 'Checking OCR service...'
                        : ocrBackendHealth?.ok && ocrBackendHealth.visionReady
                          ? `${ocrServiceLabel} connected`
                          : 'OCR service not ready'}
                    </div>
                    <div>
                      {ocrBackendHealth?.message || 'OCR requires an OCR.Space API key.'}
                    </div>
                    {!ocrBackendHealth?.visionReady && !ocrBackendHealth?.credentialsConfigured && (
                      <div>
                        Set `VITE_OCR_SPACE_API_KEY` in `.env` and restart the Vite dev server.
                      </div>
                    )}
                    {ocrBackendHealth?.credentialsPath && (
                      <div className="break-all">
                        Credentials: {ocrBackendHealth.credentialsPath}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestVisionConnection}
                    disabled={isTestingOcrConnection}
                    style={{ borderColor: palette.border, color: palette.text }}
                  >
                    {isTestingOcrConnection ? 'Testing OCR...' : 'Test OCR Connection'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleExtractFromImage}
                      disabled={!ocrFile || isExtractingOcr}
                      style={{ background: palette.cyan }}
                      className="flex-1"
                    >
                      <ScanText className="h-4 w-4 mr-2" />
                      {isExtractingOcr ? 'Extracting...' : 'Extract Data'}
                    </Button>
                    {ocrFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOcrFileChange(null)}
                        style={{ borderColor: palette.border, color: palette.text }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetLeadCaptureState}
                    style={{ borderColor: palette.border, color: palette.text }}
                  >
                    Clear All Fields
                  </Button>
                  {ocrError && (
                    <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                      {ocrError}
                    </div>
                  )}
                  {(ocrHealthResponseText || ocrError) && (
                    <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: palette.border }}>
                      <div className="text-sm font-medium" style={{ color: palette.text }}>
                        Vision Debug
                      </div>
                      {ocrHealthResponseText && (
                        <>
                          <p className="text-xs" style={{ color: palette.textMute }}>
                            Exact `/health` response
                          </p>
                          <Textarea
                            value={ocrHealthResponseText}
                            readOnly
                            rows={8}
                            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                          />
                        </>
                      )}
                      {ocrError && (
                        <>
                          <p className="text-xs" style={{ color: palette.textMute }}>
                            Exact OCR failure message
                          </p>
                          <Textarea
                            value={ocrError}
                            readOnly
                            rows={3}
                            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                          />
                        </>
                      )}
                    </div>
                  )}
                  {ocrRawText && (
                    <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: palette.border }}>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" style={{ color: palette.violet }} />
                        <span className="text-sm font-medium" style={{ color: palette.text }}>OCR Raw Text</span>
                        {ocrProvider && (
                          <Badge variant="secondary" className="capitalize">
                            {ocrProvider}
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-lg border p-3 text-xs" style={{ borderColor: palette.emerald, color: palette.emerald }}>
                        Extracted data has been filled into this form. Review the fields before capturing the lead.
                      </div>
                      {ocrReviewResult ? (
                        <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                          <div className="mb-2 text-sm font-medium" style={{ color: palette.text }}>
                            Extracted Fields
                          </div>
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {ocrReviewFields.map(({ key, label }) => {
                              const value = ocrReviewResult[key] as string | undefined
                              const evidence = ocrReviewResult.fieldEvidence?.[key]

                              return (
                                <div key={key} className="rounded-md p-2" style={{ background: palette.bgElev }}>
                                  <div className="text-xs font-medium" style={{ color: palette.text }}>{label}</div>
                                  <div className="mt-0.5 text-xs" style={{ color: value ? palette.textDim : palette.textMute }}>
                                    {value || 'No value extracted'}
                                  </div>
                                  {evidence ? (
                                    <div className="mt-1 truncate text-[11px]" style={{ color: palette.textMute }} title={evidence}>
                                      Source: {evidence}
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                      <p className="text-xs" style={{ color: palette.textMute }}>
                        VillPower form parser is optimized for Name, Phone, City, State, notes like "No response / Call not picked / Call not connected", and handwritten follow-up dates.
                      </p>
                      <Textarea
                        value={ocrRawText}
                        readOnly
                        rows={10}
                        style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 content-start items-start gap-4 self-start md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Date</label>
                  <Input
                    type="datetime-local"
                    value={leadCaptureForm.capturedAt}
                    onChange={(e) => updateLeadCaptureField('capturedAt', e.target.value)}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Name</label>
                  <Input
                    value={leadCaptureForm.name}
                    onChange={(e) => updateLeadCaptureField('name', e.target.value)}
                    placeholder="Enter lead name"
                    required
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Phone No.</label>
                  <Input
                    value={leadCaptureForm.phone}
                    onChange={(e) => updateLeadCaptureField('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Email ID</label>
                  <Input
                    type="email"
                    value={leadCaptureForm.email}
                    onChange={(e) => updateLeadCaptureField('email', e.target.value)}
                    placeholder="Enter email"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>City</label>
                  <Input
                    value={leadCaptureForm.city}
                    onChange={(e) => updateLeadCaptureField('city', e.target.value)}
                    placeholder="Enter city"
                    required
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>State</label>
                  <Input
                    value={leadCaptureForm.state}
                    onChange={(e) => updateLeadCaptureField('state', e.target.value)}
                    placeholder="Enter state"
                    required
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Investment Range</label>
                  <Input
                    value={leadCaptureForm.investmentRange}
                    onChange={(e) => updateLeadCaptureField('investmentRange', e.target.value)}
                    placeholder="e.g. 20L-30L"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Approximate Closure Date</label>
                  <Input
                    type="date"
                    value={leadCaptureForm.approximateClosureDate}
                    onChange={(e) => updateLeadCaptureField('approximateClosureDate', e.target.value)}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Next Connect Mode</label>
                  <Input
                    value={leadCaptureForm.nextConnectMode}
                    onChange={(e) => updateLeadCaptureField('nextConnectMode', e.target.value)}
                    placeholder="Call / WhatsApp / Email"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Next Connect Time</label>
                  <Input
                    type="datetime-local"
                    value={leadCaptureForm.nextConnectAt}
                    onChange={(e) => updateLeadCaptureField('nextConnectAt', e.target.value)}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Reference</label>
                  <Input
                    value={leadCaptureForm.reference}
                    onChange={(e) => updateLeadCaptureField('reference', e.target.value)}
                    placeholder="Reference source or person"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm" style={{ color: palette.textMute }}>Notes</label>
                  <Textarea
                    value={leadCaptureForm.notes}
                    onChange={(e) => updateLeadCaptureField('notes', e.target.value)}
                    placeholder="Initial call notes, no response, follow-up context..."
                    rows={4}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeLeadCaptureForm}
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  Cancel
                </Button>
                <Button type="submit" style={{ background: palette.violet }} disabled={createLead.isPending}>
                  {createLead.isPending ? 'Saving...' : 'Capture Lead'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border shadow-sm" style={{ background: palette.bgCard, borderColor: palette.border }}>
        <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-start lg:justify-between" style={{ borderColor: palette.border, background: palette.bgElev }}>
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" style={{ color: palette.violet }} />
              <h2 className="text-lg font-semibold" style={{ color: palette.text }}>Franchise Pipeline Stage Map</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm" style={{ color: palette.textMute }}>
              Every stage includes the operating steps, controls, owner, and expected outcome from lead capture through post-sale management.
            </p>
          </div>

          <button
            type="button"
            onClick={showAllStages}
            className={cn(
              "rounded-lg border px-4 py-3 text-left transition-all",
              stageFilter === 'all' && "ring-2 ring-offset-2"
            )}
            style={{
              background: stageFilter === 'all' ? palette.violetBg : 'transparent',
              borderColor: stageFilter === 'all' ? palette.violet : palette.border,
              color: palette.text,
            }}
          >
            <div className="text-xs uppercase" style={{ color: palette.textMute }}>Total pipeline</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-bold">{stageSummaryLeads.length}</span>
              <span className="pb-1 text-xs" style={{ color: palette.textMute }}>leads visible</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-px md:grid-cols-2 xl:grid-cols-4" style={{ background: palette.border }}>
          {stageEntries.map((stage) => {
            const Icon = STAGE_ICONS[stage.id]
            const count = stageSummaryLeads.filter((lead) => lead.stage === stage.id).length
            const stageIndex = getStageIndex(stage.id)
            const isFiltered = stageFilter === stage.id
            const isExpanded = expandedStageId === stage.id
            const isCurrent = selectedLead?.stage === stage.id
            const stageState =
              selectedStageIndex < 0
                ? 'Tracked stage'
                : stageIndex < selectedStageIndex
                  ? 'Completed'
                  : stageIndex === selectedStageIndex
                    ? 'Current stage'
                    : 'Upcoming'

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageHeaderClick(stage.id)}
                className={cn(
                  "min-h-[132px] bg-clip-padding p-4 text-left transition-all hover:brightness-[1.02]",
                  isFiltered && "relative z-10"
                )}
                style={{
                  background: isExpanded || isFiltered ? palette.bgElev : palette.bgCard,
                  color: palette.text,
                  borderColor: stage.color,
                  boxShadow: isFiltered ? `inset 0 0 0 2px ${stage.color}, 0 12px 28px rgba(15,23,42,0.08)` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: stage.color + '18' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: stage.color }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase" style={{ color: stage.color }}>
                        Stage {stageIndex + 1}
                      </div>
                      <div className="text-sm font-semibold leading-snug" style={{ color: palette.text }}>
                        {stage.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: palette.text }}>{count}</div>
                      <div className="text-[11px]" style={{ color: palette.textMute }}>leads</div>
                    </div>
                    <ChevronDown
                      className={cn("mt-1 h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                      style={{ color: palette.textMute }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge style={{ background: isCurrent ? stage.color + '22' : palette.violetBg, color: isCurrent ? stage.color : palette.textDim }}>
                    {stageState}
                  </Badge>
                  {isCurrent && selectedSubStage ? (
                    <Badge style={{ background: 'rgba(245,158,11,0.14)', color: palette.amber }}>
                      {selectedSubStage.shortDisplay}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">
                    {stage.primaryOwner}
                  </Badge>
                  {stage.slaHours ? (
                    <Badge style={{ background: 'rgba(245,158,11,0.14)', color: palette.amber }}>
                      <Clock className="mr-1 h-3 w-3" />
                      {stage.slaHours < 1 ? '30m SLA' : `${stage.slaHours}h SLA`}
                    </Badge>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        {expandedStage && (
          <div className="border-t p-5" style={{ borderColor: palette.border, background: palette.bgElev }}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
              <div className="xl:w-[34%]">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ background: expandedStage.color + '18' }}
                  >
                    {(() => {
                      const ExpandedIcon = STAGE_ICONS[expandedStage.id]
                      return <ExpandedIcon className="h-5 w-5" style={{ color: expandedStage.color }} />
                    })()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase" style={{ color: expandedStage.color }}>
                      Stage {expandedStageIndex + 1}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: palette.text }}>
                      {expandedStage.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: palette.textDim }}>
                  {expandedStage.description}
                </p>
                <div className="mt-4 rounded-lg border p-3" style={{ borderColor: palette.border, background: palette.bgCard }}>
                  <div className="text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                    Expected outcome
                  </div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: palette.text }}>
                    {expandedStage.outcome}
                  </p>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border p-4" style={{ borderColor: palette.border, background: palette.bgCard }}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                    <ListChecks className="h-3.5 w-3.5" />
                    Stage steps
                  </div>
                  <div className="space-y-2.5">
                    {expandedStage.steps.map((step, stepIndex) => (
                      <div key={step} className="flex gap-2">
                        <span
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                          style={{ background: expandedStage.color + '18', color: expandedStage.color }}
                        >
                          {stepIndex + 1}
                        </span>
                        <span className="text-xs leading-relaxed" style={{ color: palette.textDim }}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4" style={{ borderColor: palette.border, background: palette.bgCard }}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Controls
                  </div>
                  <div className="space-y-2.5">
                    {expandedStage.controls.map((control) => (
                      <div key={control} className="flex items-center gap-2 text-xs" style={{ color: palette.textDim }}>
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: expandedStage.color }} />
                        {control}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4" style={{ borderColor: palette.border, background: palette.bgCard }}>
                  <div className="mb-3 text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                    Ownership
                  </div>
                  <div className="text-sm font-semibold" style={{ color: palette.text }}>
                    {expandedStage.primaryOwner}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {expandedStage.supportingTeams.map((team) => (
                      <Badge key={team} variant="secondary">
                        {team}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 text-xs leading-relaxed" style={{ color: palette.textMute }}>
                    {expandedStage.requiredInteractions} minimum interactions expected before movement.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(520px,0.85fr)]">
        <div className="min-w-0">
          <div
            className="flex h-[72vh] min-h-[520px] flex-col overflow-hidden rounded-xl border xl:h-[calc(100vh-7.5rem)]"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: palette.border }}>
              <div>
                <h2 className="text-base font-semibold" style={{ color: palette.text }}>Lead Register</h2>
                <p className="text-xs" style={{ color: palette.textMute }}>
                  Search and header filters are applied to this list.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {totalLeadRecords} records
                </Badge>
                <ViewToggle value={leadViewMode} onChange={setLeadViewMode} />
              </div>
            </div>
            {leadsQuery.isLoading && leads.length === 0 ? (
              <div className="p-8 text-center" style={{ color: palette.textMute }}>Loading leads...</div>
            ) : leadsQuery.isError ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto" style={{ color: palette.rose }} />
                <p style={{ color: palette.text }}>Unable to load leads</p>
                <p className="text-sm" style={{ color: palette.textMute }}>
                  Check your ERPNext connection and lead API methods.
                </p>
              </div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center" style={{ color: palette.textMute }}>
                No leads found for the current filters.
              </div>
            ) : (
              <>
                <div
                  ref={leadRegisterScrollRef}
                  className="min-h-0 flex-1 overflow-auto"
                  onScroll={handleLeadRegisterScroll}
                >
                  {leadViewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-2">
                      {leads.map((lead) => {
                        const scoreTone = getScoreTone(lead.score)
                        const leadStageConfig = STAGE_CONFIG[lead.stage]
                        const leadSubStage = getLeadSubStage(lead)

                        return (
                          <Card
                            key={lead.id}
                            className={cn("cursor-pointer transition-colors hover:bg-white/5", selectedLeadId === lead.id && "bg-white/5")}
                            style={{ background: palette.bgElev, borderColor: palette.border }}
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            <CardContent className="space-y-3 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                    <AvatarFallback style={{ background: palette.violet, color: 'white', fontSize: '12px' }}>
                                      {lead.name.split(' ').map((part) => part[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      className="truncate text-left text-sm font-medium hover:underline"
                                      style={{ color: palette.text }}
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        openLeadDetailsForm(lead.id)
                                      }}
                                    >
                                      {lead.name}
                                    </button>
                                    <p className="text-xs" style={{ color: palette.textMute }}>{lead.id}</p>
                                  </div>
                                </div>
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: scoreTone.bg, color: scoreTone.color }}>
                                  {lead.score}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="capitalize">{lead.source}</Badge>
                                <Badge variant={lead.status === 'qualified' || lead.status === 'approved' || lead.status === 'active' || lead.status === 'converted' ? 'success' : lead.status === 'new' ? 'info' : lead.status === 'pending' ? 'warning' : 'secondary'}>
                                  {formatLabel(lead.status)}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between border-t pt-3 text-sm" style={{ borderColor: palette.border }}>
                                <span style={{ color: palette.text }}>Rs {lead.investment}L</span>
                                <span style={{ color: palette.textMute }}>{leadStageConfig.shortName} · {leadSubStage.index + 1}/{leadSubStage.total}</span>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                  <table className="w-full min-w-[820px]">
                    <thead className="sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Lead</th>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Source</th>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Investment</th>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Stage</th>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Score</th>
                        <th className="text-left p-4 text-xs font-medium" style={{ background: palette.bgElev, color: palette.violet }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => {
                        const scoreTone = getScoreTone(lead.score)
                        const leadStageConfig = STAGE_CONFIG[lead.stage]
                        const leadSubStage = getLeadSubStage(lead)

                        return (
                          <tr
                            key={lead.id}
                            className={cn(
                              "border-t cursor-pointer hover:bg-white/5",
                              selectedLeadId === lead.id && "bg-white/5"
                            )}
                            style={{ borderColor: palette.border }}
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback style={{ background: palette.violet, color: 'white', fontSize: '12px' }}>
                                    {lead.name.split(' ').map((part) => part[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <button
                                    type="button"
                                    className="text-left text-sm font-medium transition-colors hover:underline"
                                    style={{ color: palette.text }}
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      openLeadDetailsForm(lead.id)
                                    }}
                                  >
                                    {lead.name}
                                  </button>
                                  <p className="text-xs" style={{ color: palette.textMute }}>{lead.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="capitalize">{lead.source}</Badge>
                            </td>
                            <td className="p-4 text-sm" style={{ color: palette.text }}>Rs {lead.investment}L</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-gray-700">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${((getStageIndex(lead.stage) + 1) / stageEntries.length) * 100}%`,
                                      background: leadStageConfig.color,
                                    }}
                                  />
                                </div>
                                <span className="text-xs capitalize" style={{ color: palette.textMute }} title={leadStageConfig.name}>
                                  {leadStageConfig.shortName}
                                </span>
                              </div>
                              <div className="mt-1 max-w-[220px] truncate text-[11px]" style={{ color: palette.textMute }} title={leadSubStage.label}>
                                {leadSubStage.shortDisplay}
                              </div>
                            </td>
                            <td className="p-4">
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium"
                                style={{ background: scoreTone.bg, color: scoreTone.color }}
                              >
                                {lead.score}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  lead.status === 'qualified' || lead.status === 'approved' || lead.status === 'active' || lead.status === 'converted'
                                    ? 'success'
                                    : lead.status === 'new'
                                      ? 'info'
                                      : lead.status === 'pending'
                                        ? 'warning'
                                        : 'secondary'
                                }
                              >
                                {formatLabel(lead.status)}
                              </Badge>
                              <div className="mt-1 text-[11px]" style={{ color: palette.textMute }}>
                                {leadSubStage.index + 1}/{leadSubStage.total} sub-stage
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  )}
                </div>

                <div
                  className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: palette.border, background: palette.bgElev }}
                >
                  <div className="text-xs" style={{ color: palette.textMute }}>
                    Showing {leadRecordStart}-{leadRecordEnd} of {totalLeadRecords} records · Page {leadPage} of {totalLeadPages}
                    {leadsQuery.isFetching ? ' · Loading...' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={!hasPreviousLeadPage || leadsQuery.isFetching}
                      onClick={() => goToLeadPage(leadPage - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalLeadPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          className="flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium"
                          style={{
                            background: page === leadPage ? palette.violet : palette.bgCard,
                            borderColor: page === leadPage ? palette.violet : palette.border,
                            color: page === leadPage ? '#ffffff' : palette.text,
                          }}
                          onClick={() => goToLeadPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      disabled={!hasNextLeadPage || leadsQuery.isFetching}
                      onClick={() => goToLeadPage(leadPage + 1)}
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
              )}
          </div>
        </div>

        <div className="min-w-0">
          {!selectedLead ? (
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader>
                <CardTitle style={{ color: palette.text }}>Lead Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: palette.textMute }}>
                  Select a lead to view the timeline, interactions, and follow-up tasks.
                </p>
              </CardContent>
            </Card>
          ) : leadDetailQuery.isLoading && !leadDetailQuery.data ? (
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardContent className="p-6">
                <p style={{ color: palette.textMute }}>Loading lead details...</p>
              </CardContent>
            </Card>
          ) : (
            <Card
              style={{ background: palette.bgCard, borderColor: palette.border }}
              className="h-[72vh] min-h-[520px] overflow-hidden flex flex-col xl:sticky xl:top-4 xl:h-[calc(100vh-7.5rem)]"
            >
              {leadActionError ? (
                <div className="shrink-0 border-b p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                  {leadActionError}
                </div>
              ) : null}
              <LeadDetailPanel
                lead={selectedLead}
                interactions={selectedLeadDetail?.interactions ?? []}
                followUpTasks={selectedLeadDetail?.followUpTasks ?? []}
                timeline={selectedLeadDetail?.timeline ?? []}
                metrics={selectedLeadDetail?.metrics}
                onUpdateStage={(stage) => handleMoveStage(stage as LeadStage)}
                onUpdateStatus={handleMoveStatus}
                onEditLead={() => openLeadDetailsForm(selectedLead.id)}
                onLogInteraction={handleLogInteraction}
                onCompleteTask={(taskId) => {
                  setLeadActionError('')
                  completeTask.mutate(taskId, {
                    onError: (error) => setLeadActionError(error instanceof Error ? error.message : 'Task could not be completed'),
                  })
                }}
                onCreateFollowUp={handleCreateFollowUp}
                className="flex-1 min-h-0"
              />
            </Card>
          )}
        </div>
      </div>

      {showLeadDetailsForm && selectedLead ? (
        <LeadDetailsForm
          lead={selectedLead}
          interactions={selectedLeadDetail?.interactions ?? []}
          followUpTasks={selectedLeadDetail?.followUpTasks ?? []}
          timeline={selectedLeadDetail?.timeline ?? []}
          metrics={selectedLeadDetail?.metrics}
          onClose={() => setShowLeadDetailsForm(false)}
          onStatusChange={handleLeadStatusChange}
          onUpdateLead={handleLeadUpdate}
          isSavingStatus={updateLead.isPending}
        />
      ) : null}
    </div>
  )
}
