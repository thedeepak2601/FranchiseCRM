import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Save,
  Target,
  UserCheck,
  User,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from '@/lib/theme-context'
import { getLeadOwner, getLeadSubStage, getOwnerActionTasks } from '@/lib/lead-stage'
import { cn } from '@/lib/utils'
import { STAGE_CONFIG } from '@/types/lead'
import type { FollowUpTask, Interaction, Lead, LeadMetrics, LeadStage, LeadStatus, TimelineEvent } from '@/types/lead'

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'new',
  'in_progress',
  'qualified',
  'nurture',
  'pending',
  'approved',
  'active',
  'cold',
  'converted',
  'disqualified',
]

interface LeadDetailsFormProps {
  lead: Lead
  interactions?: Interaction[]
  followUpTasks?: FollowUpTask[]
  timeline?: TimelineEvent[]
  metrics?: LeadMetrics
  onClose: () => void
  onStatusChange: (status: LeadStatus) => Promise<void> | void
  isSavingStatus?: boolean
}

export function LeadDetailsForm({
  lead,
  interactions = [],
  followUpTasks = [],
  timeline = [],
  metrics,
  onClose,
  onStatusChange,
  isSavingStatus = false,
}: LeadDetailsFormProps) {
  const { palette } = useTheme()
  const [draftStatus, setDraftStatus] = useState<LeadStatus>(lead.status)
  const [expandedJourneyStageId, setExpandedJourneyStageId] = useState<LeadStage | null>(null)
  const stageEntries = Object.values(STAGE_CONFIG)
  const currentStageIndex = Math.max(stageEntries.findIndex((stage) => stage.id === lead.stage), 0)
  const stageConfig = STAGE_CONFIG[lead.stage]
  const stageProgress = ((currentStageIndex + 1) / stageEntries.length) * 100
  const leadOwner = getLeadOwner(lead)
  const activeSubStage = getLeadSubStage(lead, { interactions, followUpTasks, timeline })
  const ownerActionTasks = getOwnerActionTasks(lead, followUpTasks)

  useEffect(() => {
    setDraftStatus(lead.status)
  }, [lead.id, lead.status])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const formatDateTime = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Required'

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Required'

  const requiredFields = [
    { label: 'Lead ID', value: lead.id, icon: Target },
    { label: 'Full Name', value: lead.name, icon: User },
    { label: 'Phone Number', value: lead.phone, icon: Phone },
    { label: 'Email ID', value: lead.email, icon: Mail },
    { label: 'City / Location', value: lead.location, icon: MapPin },
    { label: 'State', value: lead.state, icon: MapPin },
    { label: 'Source', value: lead.source.replace('_', ' '), icon: Target },
    { label: 'Investment', value: `Rs ${lead.investment}L`, icon: Briefcase },
    { label: 'Investment Range', value: lead.investmentRange || lead.budgetRange, icon: Briefcase },
    { label: 'Owner', value: lead.assignedTo || lead.owner, icon: User },
    { label: 'Captured By', value: lead.capturedBy, icon: User },
    { label: 'Captured At', value: formatDateTime(lead.capturedAt), icon: Calendar },
    { label: 'Last Activity', value: formatDateTime(lead.lastActivity), icon: Clock },
    { label: 'Expected Closure', value: formatDate(lead.expectedClosureDate), icon: Calendar },
    { label: 'Next Connect Mode', value: lead.nextConnectMode, icon: Phone },
    { label: 'Next Connect Time', value: formatDateTime(lead.nextConnectAt), icon: Calendar },
    { label: 'Reference', value: lead.referenceSource, icon: Target },
    { label: 'Business Experience', value: lead.businessExperience, icon: Briefcase },
    { label: 'Timeline To Invest', value: lead.timelineToInvest, icon: Clock },
    { label: 'Decision Maker', value: typeof lead.isDecisionMaker === 'boolean' ? (lead.isDecisionMaker ? 'Yes' : 'No') : 'Required', icon: CheckCircle2 },
  ]

  const recentJourney = useMemo(() => {
    const timelineItems = timeline.map((event) => ({
      id: `timeline-${event.id}`,
      timestamp: event.timestamp,
      title: event.type.split('_').join(' '),
      description: event.description,
      meta: event.previousValue || event.newValue ? `${event.previousValue || 'Unknown'} -> ${event.newValue || 'Unknown'}` : undefined,
      user: event.user,
      ownerAction: false,
    }))

    const interactionItems = interactions.map((interaction) => ({
      id: `interaction-${interaction.id}`,
      timestamp: interaction.timestamp,
      title: `${interaction.channel.replace('_', ' ')} ${interaction.outcome.replace('_', ' ')}`,
      description: interaction.notes,
      meta: interaction.duration ? `${interaction.duration} min` : undefined,
      user: interaction.salesRep,
      ownerAction: false,
    }))

    const taskItems = followUpTasks.map((task) => ({
      id: `task-${task.id}`,
      timestamp: task.completedAt || task.scheduledAt,
      title: task.status === 'completed' ? 'follow up completed' : 'follow up scheduled',
      description: task.description,
      meta: `${task.priority} priority`,
      user: task.owner,
      ownerAction: task.owner === leadOwner && (task.status === 'pending' || task.status === 'overdue'),
    }))

    return [...timelineItems, ...interactionItems, ...taskItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
  }, [followUpTasks, interactions, leadOwner, timeline])

  const saveStatus = async () => {
    if (draftStatus === lead.status) return
    await onStatusChange(draftStatus)
  }

  const getJourneySubStageText = (stage: typeof stageEntries[number], isCurrent: boolean, isDone: boolean) => {
    if (isCurrent) return activeSubStage.shortDisplay
    if (isDone) return `${stage.steps.length}/${stage.steps.length}: ${stage.steps[stage.steps.length - 1]}`
    return `1/${stage.steps.length}: ${stage.steps[0]}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-3 sm:p-5">
      <div
        className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: palette.bg, borderColor: palette.border }}
      >
        <div className="border-b p-4 sm:p-5" style={{ borderColor: palette.border, background: palette.bgCard }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold" style={{ color: palette.text }}>{lead.name}</h2>
                <Badge variant="secondary">{lead.id}</Badge>
                <Badge style={{ background: stageConfig.color + '20', color: stageConfig.color }}>
                  Current: {stageConfig.shortName}
                </Badge>
                <Badge style={{ background: 'rgba(245,158,11,0.14)', color: palette.amber }}>
                  {activeSubStage.shortDisplay}
                </Badge>
              </div>
              <p className="mt-1 text-sm" style={{ color: palette.textMute }}>
                Comprehensive required lead form, current lifecycle position, and full journey context.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[220px]">
                <Select
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value as LeadStatus)}
                  style={{ background: palette.bgElev, borderColor: palette.border, color: palette.text }}
                  className="capitalize"
                  aria-label="Lead status"
                >
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="button"
                onClick={saveStatus}
                disabled={draftStatus === lead.status || isSavingStatus}
                style={{ background: palette.violet }}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingStatus ? 'Saving...' : 'Save Status'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                style={{ borderColor: palette.border, color: palette.text }}
                aria-label="Close lead form"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="space-y-5 p-4 sm:p-5">
            <section className="rounded-xl border p-4" style={{ background: palette.bgCard, borderColor: palette.border }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: palette.text }}>Required Lead Details</h3>
                  <p className="text-xs" style={{ color: palette.textMute }}>
                    Every field is shown with required context; missing values are marked as Required.
                  </p>
                </div>
                <Badge style={{ background: palette.violetBg, color: palette.violet }}>
                  Score {lead.score}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {requiredFields.map((field) => {
                  const Icon = field.icon
                  const value = field.value || 'Required'
                  const isMissing = value === 'Required'

                  return (
                    <label key={field.label} className="space-y-1.5">
                      <span className="flex items-center gap-2 text-xs font-medium uppercase" style={{ color: palette.textMute }}>
                        <Icon className="h-3.5 w-3.5" />
                        {field.label}
                        <span style={{ color: palette.rose }}>*</span>
                      </span>
                      <Input
                        value={value}
                        readOnly
                        required
                        className={cn(isMissing && 'font-medium')}
                        style={{
                          background: palette.bgElev,
                          borderColor: isMissing ? palette.rose : palette.border,
                          color: isMissing ? palette.rose : palette.text,
                        }}
                      />
                    </label>
                  )
                })}
              </div>

              <div className="mt-3 space-y-1.5">
                <span className="text-xs font-medium uppercase" style={{ color: palette.textMute }}>
                  Notes <span style={{ color: palette.rose }}>*</span>
                </span>
                <Textarea
                  value={lead.initialNotes || 'Required'}
                  readOnly
                  required
                  rows={4}
                  style={{
                    background: palette.bgElev,
                    borderColor: lead.initialNotes ? palette.border : palette.rose,
                    color: lead.initialNotes ? palette.text : palette.rose,
                  }}
                />
              </div>
            </section>

            <section className="rounded-xl border p-4" style={{ background: palette.bgCard, borderColor: palette.border }}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: palette.text }}>Current Option</h3>
                  <p className="text-xs" style={{ color: palette.textMute }}>
                    Stage, status, next action, and operational metrics for this lead.
                  </p>
                </div>
                <Badge style={{ background: stageConfig.color + '20', color: stageConfig.color }}>
                  {stageConfig.name}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                  <div className="text-xs" style={{ color: palette.textMute }}>Status</div>
                  <div className="mt-1 text-sm font-semibold capitalize" style={{ color: palette.text }}>
                    {lead.status.replace('_', ' ')}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug" style={{ color: palette.textMute }}>
                    {activeSubStage.shortDisplay}
                  </div>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                  <div className="text-xs" style={{ color: palette.textMute }}>Owner</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: palette.text }}>
                    {leadOwner}
                  </div>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                  <div className="text-xs" style={{ color: palette.textMute }}>Connect Rate</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: palette.text }}>
                    {metrics?.connectRate ?? 0}%
                  </div>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                  <div className="text-xs" style={{ color: palette.textMute }}>Next Connect</div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: palette.text }}>
                    {lead.nextConnectMode || 'Required'}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug" style={{ color: ownerActionTasks.length > 0 ? palette.amber : palette.textMute }}>
                    {ownerActionTasks.length > 0 ? `${ownerActionTasks.length} owner task${ownerActionTasks.length > 1 ? 's' : ''} due` : 'No owner task due'}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs" style={{ color: palette.textMute }}>
                  <span>Lifecycle Progress</span>
                  <span>{Math.round(stageProgress)}%</span>
                </div>
                <Progress value={stageProgress} className="h-2" />
                <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.textDim }}>
                  {stageConfig.description}
                </p>
                <div className="mt-3 rounded-lg border p-3" style={{ borderColor: stageConfig.color, background: stageConfig.color + '10' }}>
                  <div className="text-xs font-semibold uppercase" style={{ color: stageConfig.color }}>
                    Current sub-stage
                  </div>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: palette.text }}>
                    {activeSubStage.label}
                  </p>
                </div>
              </div>
            </section>

            {ownerActionTasks.length > 0 ? (
              <section className="rounded-xl border p-4" style={{ background: 'rgba(245,158,11,0.08)', borderColor: palette.amber }}>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" style={{ color: palette.amber }} />
                  <h3 className="text-base font-semibold" style={{ color: palette.text }}>Owner Tasks Need Action</h3>
                </div>
                <div className="mt-3 grid gap-2">
                  {ownerActionTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3" style={{ background: palette.bgCard, borderColor: palette.amber }}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold" style={{ color: palette.text }}>{task.title}</div>
                        <Badge style={{ background: task.status === 'overdue' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.16)', color: task.status === 'overdue' ? palette.rose : palette.amber }}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textDim }}>
                        {task.description}
                      </p>
                      <p className="mt-2 text-xs" style={{ color: palette.textMute }}>
                        Due {formatDateTime(task.scheduledAt)} by {task.owner}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 border-t p-4 sm:p-5 lg:border-l lg:border-t-0" style={{ borderColor: palette.border }}>
            <section className="rounded-xl border p-4" style={{ background: palette.bgCard, borderColor: palette.border }}>
              <h3 className="text-base font-semibold" style={{ color: palette.text }}>Lead Journey</h3>
              <div className="mt-4 space-y-3">
                {stageEntries.map((stage, index) => {
                  const isDone = index < currentStageIndex
                  const isCurrent = index === currentStageIndex

                  const isExpanded = expandedJourneyStageId === stage.id

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setExpandedJourneyStageId((current) => (current === stage.id ? null : stage.id))}
                      className="flex w-full gap-3 rounded-lg p-1 text-left transition-colors hover:bg-white/5"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          background: isDone || isCurrent ? stage.color : palette.bgElev,
                          color: isDone || isCurrent ? 'white' : palette.textMute,
                        }}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium" style={{ color: isCurrent ? stage.color : palette.text }}>
                            {stage.shortName}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isCurrent ? 'default' : 'secondary'}>
                              {isCurrent ? 'Current' : isDone ? 'Completed' : 'Upcoming'}
                            </Badge>
                            <ChevronDown
                              className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                              style={{ color: palette.textMute }}
                            />
                          </div>
                        </div>
                        {isExpanded ? (
                          <div className="mt-1 text-xs font-medium" style={{ color: isCurrent ? stage.color : palette.textDim }}>
                            {getJourneySubStageText(stage, isCurrent, isDone)}
                          </div>
                        ) : null}
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textMute }}>
                          {stage.outcome}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-xl border p-4" style={{ background: palette.bgCard, borderColor: palette.border }}>
              <h3 className="text-base font-semibold" style={{ color: palette.text }}>Recent Journey Activity</h3>
              <div className="mt-4 space-y-3">
                {recentJourney.length === 0 ? (
                  <div className="rounded-lg border p-4 text-sm" style={{ borderColor: palette.border, color: palette.textMute }}>
                    No journey activity has been logged yet.
                  </div>
                ) : (
                  recentJourney.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-3"
                      style={{
                        borderColor: item.ownerAction ? palette.amber : palette.border,
                        background: item.ownerAction ? 'rgba(245,158,11,0.08)' : 'transparent',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold uppercase capitalize" style={{ color: item.ownerAction ? palette.amber : palette.violet }}>
                            {item.title}
                          </div>
                          {item.ownerAction ? (
                            <Badge style={{ background: 'rgba(245,158,11,0.16)', color: palette.amber }}>
                              Owner action
                            </Badge>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-[11px]" style={{ color: palette.textMute }}>
                          {formatDateTime(item.timestamp)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: palette.text }}>
                        {item.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: palette.textMute }}>
                        <span>{item.user}</span>
                        {item.meta ? (
                          <>
                            <span>-</span>
                            <span>{item.meta}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {metrics?.slaBreached ? (
              <div className="rounded-xl border p-4" style={{ borderColor: palette.rose, color: palette.rose }}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  SLA attention required
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
