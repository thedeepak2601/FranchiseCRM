import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, FileText, AlertCircle, UserPlus, Phone, Target, TrendingUp, Shield, Briefcase, Users, Upload, ScanText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { LeadDetailPanel } from '@/components/leads'
import { useCompleteTask, useCreateInteraction, useCreateLead, useLead, useLeads } from '@/hooks/useLeads'
import { extractLeadFieldsFromImage, getOcrBackendHealth } from '@/lib/lead-ocr'
import { STAGE_CONFIG } from '@/types/lead'
import type { CreateLeadRequest, LeadStage } from '@/types/lead'
import type { LeadOcrResult, OcrBackendHealth, OcrFieldKey } from '@/lib/lead-ocr'

const palette = {
  bgCard: '#161A24',
  border: '#1F2433',
  text: '#E5E7EB',
  textMute: '#6B7280',
  violet: '#8B7CF6',
  violetBg: 'rgba(139,124,246,0.08)',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  cyan: '#06B6D4',
}

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

export default function Leads() {
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
  const [selectedLeadId, setSelectedLeadId] = useState('')
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
      page: 1,
      pageSize: 50,
    }),
    [searchTerm, stageFilter]
  )

  const leadsQuery = useLeads(filters)
  const leads = leadsQuery.data?.data ?? []
  const selectedLeadName = selectedLeadId || leads[0]?.id || ''
  const leadDetailQuery = useLead(selectedLeadName)
  const createLead = useCreateLead()
  const createInteraction = useCreateInteraction()
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

  const selectedLead = leadDetailQuery.data?.lead ?? leads.find((lead) => lead.id === selectedLeadId)
  const stageEntries = Object.values(STAGE_CONFIG)

  const getStageIndex = (stageId: LeadStage) => stageEntries.findIndex((stage) => stage.id === stageId)

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
    if (ocrPreviewUrl) {
      URL.revokeObjectURL(ocrPreviewUrl)
    }
    if (file) {
      setOcrPreviewUrl(URL.createObjectURL(file))
    } else {
      setOcrPreviewUrl('')
    }
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
      const message = error instanceof Error ? error.message : 'Vision connection test failed'
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

    const numericInvestment = parseInt(leadCaptureForm.investmentRange.replace(/\D/g, '').slice(0, 3) || '0', 10)
    const payload: CreateLeadRequest = {
      name: leadCaptureForm.name,
      phone: leadCaptureForm.phone,
      email: leadCaptureForm.email,
      source: 'other',
      investment: numericInvestment,
      investmentRange: leadCaptureForm.investmentRange,
      location: leadCaptureForm.city,
      state: leadCaptureForm.state,
      initialNotes: leadCaptureForm.notes,
      expectedClosureDate: leadCaptureForm.approximateClosureDate || undefined,
      nextConnectMode: leadCaptureForm.nextConnectMode || undefined,
      nextConnectAt: leadCaptureForm.nextConnectAt || undefined,
      referenceSource: leadCaptureForm.reference || undefined,
      capturedAt: new Date(leadCaptureForm.capturedAt).toISOString(),
    }

    const createdLead = await createLead.mutateAsync(payload)
    setSelectedLeadId(createdLead.id)
    setStageFilter('all')
    closeLeadCaptureForm()
  }

  const applyOcrReviewResult = () => {
    if (!ocrReviewResult) return

    setLeadCaptureForm((current) => ({
      ...current,
      capturedAt: ocrReviewResult.capturedAt || current.capturedAt,
      name: ocrReviewResult.name || current.name,
      phone: ocrReviewResult.phone || current.phone,
      email: ocrReviewResult.email || current.email,
      city: ocrReviewResult.city || current.city,
      state: ocrReviewResult.state || current.state,
      investmentRange: ocrReviewResult.investmentRange || current.investmentRange,
      notes: ocrReviewResult.notes || current.notes,
      approximateClosureDate: ocrReviewResult.approximateClosureDate || current.approximateClosureDate,
      nextConnectMode: ocrReviewResult.nextConnectMode || current.nextConnectMode,
      nextConnectAt: ocrReviewResult.nextConnectAt || current.nextConnectAt,
      reference: ocrReviewResult.reference || current.reference,
    }))
    setOcrReviewResult(null)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: palette.text }}>Leads & Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: palette.textMute }}>
            End-to-end franchise lifecycle management from capture to post-sale
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" style={{ borderColor: palette.border, color: palette.text }}>
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button style={{ background: palette.violet }} onClick={() => (showLeadCaptureForm ? closeLeadCaptureForm() : setShowLeadCaptureForm(true))}>
            <Plus className="h-4 w-4 mr-2" />
            {showLeadCaptureForm ? 'Close Form' : 'Add Lead'}
          </Button>
        </div>
      </div>

      {showLeadCaptureForm && (
        <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
          <CardHeader>
            <CardTitle style={{ color: palette.text }}>Lead Capture Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLeadCaptureSubmit}>
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
                        ? 'Checking Google Vision server...'
                        : ocrBackendHealth?.ok && ocrBackendHealth.visionReady
                          ? 'Google Vision server connected'
                          : 'Google Vision server not ready'}
                    </div>
                    <div>
                      {ocrBackendHealth?.message || 'Google Vision OCR requires either a valid API key or the local Vision server.'}
                    </div>
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
                    {isTestingOcrConnection ? 'Testing Vision...' : 'Test Vision Connection'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {ocrReviewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="w-full max-w-5xl rounded-2xl border p-6 shadow-2xl"
            style={{ background: palette.bgCard, borderColor: palette.border }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: palette.text }}>Review Extracted Text</h3>
                <p className="text-sm mt-1" style={{ color: palette.textMute }}>
                  Check the OCR output against each field before filling the form.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOcrReviewResult(null)}
                style={{ borderColor: palette.border, color: palette.text }}
              >
                Close
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
              <div className="space-y-3">
                <div className="rounded-xl border p-3" style={{ borderColor: palette.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" style={{ color: palette.violet }} />
                    <span className="text-sm font-medium" style={{ color: palette.text }}>Typed OCR Text</span>
                  </div>
                  <Textarea
                    value={ocrReviewResult.rawText}
                    readOnly
                    rows={16}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </div>
                {ocrPreviewUrl && (
                  <div className="rounded-xl border p-3" style={{ borderColor: palette.border }}>
                    <div className="text-sm font-medium mb-2" style={{ color: palette.text }}>Uploaded Image</div>
                    <img
                      src={ocrPreviewUrl}
                      alt="Lead form review"
                      className="max-h-80 w-full rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: palette.border }}>
                <div className="text-sm font-medium mb-3" style={{ color: palette.text }}>Field Mapping Review</div>
                <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                  {ocrReviewFields.map(({ key, label }) => {
                    const value = ocrReviewResult[key] as string | undefined
                    const evidence = ocrReviewResult.fieldEvidence?.[key]

                    return (
                      <div key={key} className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                        <div className="text-sm font-medium" style={{ color: palette.text }}>{label}</div>
                        <div className="mt-1 text-sm" style={{ color: value ? palette.text : palette.textMute }}>
                          {value || 'No value extracted'}
                        </div>
                        <div className="mt-2 text-xs" style={{ color: palette.textMute }}>
                          Image text: {evidence || 'No matching text found'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOcrReviewResult(null)}
                style={{ borderColor: palette.border, color: palette.text }}
              >
                Keep Editing
              </Button>
              <Button type="button" style={{ background: palette.violet }} onClick={applyOcrReviewResult}>
                Apply Extracted Data
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
        <button
          onClick={() => setStageFilter('all')}
          className={cn(
            "p-3 rounded-lg border text-center transition-all",
            stageFilter === 'all' && "ring-2 ring-offset-2 ring-offset-[#0B0D14]"
          )}
          style={{
            background: stageFilter === 'all' ? palette.violetBg : palette.bgCard,
            borderColor: stageFilter === 'all' ? palette.violet : palette.border,
          }}
        >
          <div className="text-lg font-bold" style={{ color: palette.text }}>{leads.length}</div>
          <div className="text-xs" style={{ color: palette.textMute }}>All Leads</div>
        </button>
        {stageEntries.map((stage) => {
          const Icon = STAGE_ICONS[stage.id]
          const count = leads.filter((lead) => lead.stage === stage.id).length

          return (
            <button
              key={stage.id}
              onClick={() => setStageFilter(stage.id)}
              className={cn(
                "p-3 rounded-lg border text-center transition-all",
                stageFilter === stage.id && "ring-2 ring-offset-2 ring-offset-[#0B0D14]"
              )}
              style={{
                background: stageFilter === stage.id ? stage.color + '20' : palette.bgCard,
                borderColor: stageFilter === stage.id ? stage.color : palette.border,
              }}
            >
              <Icon className="h-5 w-5 mx-auto mb-2" style={{ color: stage.color }} />
              <div className="text-lg font-bold" style={{ color: palette.text }}>{count}</div>
              <div className="text-xs" style={{ color: palette.textMute }}>{stage.name}</div>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: palette.textMute }} />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as 'all' | LeadStage)}
              className="px-4 py-2 rounded-lg border capitalize"
              style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
            >
              <option value="all">All Stages</option>
              {stageEntries.map((stage) => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ background: palette.bgCard, borderColor: palette.border }}>
            {leadsQuery.isLoading ? (
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
              <table className="w-full">
                <thead>
                  <tr style={{ background: palette.violetBg }}>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Lead</th>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Source</th>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Investment</th>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Stage</th>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Score</th>
                    <th className="text-left p-4 text-xs font-medium" style={{ color: palette.violet }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const scoreTone = getScoreTone(lead.score)

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
                              <p className="text-sm font-medium" style={{ color: palette.text }}>{lead.name}</p>
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
                                  background: STAGE_CONFIG[lead.stage].color,
                                }}
                              />
                            </div>
                            <span className="text-xs capitalize" style={{ color: palette.textMute }}>
                              {STAGE_CONFIG[lead.stage].name}
                            </span>
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
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-4">
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
            <Card style={{ background: palette.bgCard, borderColor: palette.border }} className="overflow-hidden">
              <LeadDetailPanel
                lead={selectedLead}
                interactions={leadDetailQuery.data?.interactions ?? []}
                followUpTasks={leadDetailQuery.data?.followUpTasks ?? []}
                timeline={leadDetailQuery.data?.timeline ?? []}
                metrics={leadDetailQuery.data?.metrics}
                onLogInteraction={(data) => createInteraction.mutate(data)}
                onCompleteTask={(taskId) => completeTask.mutate(taskId)}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
