/**
 * Lead Detail Panel
 * Single-stream event view with exact timestamps
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Clock,
  AlertCircle,
  UserPlus,
  Edit,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  FileText,
  Check,
  UserCheck,
  CalendarPlus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InteractionLogger } from './InteractionLogger'
import { cn, formatLabel } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'
import { getLeadOwner, getLeadSubStage, getOwnerActionTasks } from '@/lib/lead-stage'
import { STAGE_CONFIG } from '@/types/lead'
import type {
  Lead,
  Interaction,
  FollowUpTask,
  TimelineEvent,
  LeadMetrics,
  CreateInteractionRequest,
  TimelineEventType,
  LeadStatus,
  NextActionType,
  FollowUpPriority,
} from '@/types/lead'

type PaletteType = ReturnType<typeof useTheme>['palette']

function buildSourceConfig(p: PaletteType): Record<string, { color: string; bg: string }> {
  return {
    website: { color: p.cyan, bg: 'rgba(6,182,212,0.15)' },
    ads: { color: p.violet, bg: 'rgba(139,124,246,0.15)' },
    whatsapp: { color: '#25D366', bg: 'rgba(37,211,102,0.15)' },
    referral: { color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    portal: { color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    facebook: { color: '#1877F2', bg: 'rgba(24,119,242,0.15)' },
    instagram: { color: '#E1306C', bg: 'rgba(225,48,108,0.15)' },
    google: { color: '#4285F4', bg: 'rgba(66,133,244,0.15)' },
    other: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
  }
}

function buildStatusConfig(p: PaletteType): Record<string, { color: string; bg: string }> {
  return {
    new: { color: p.cyan, bg: 'rgba(6,182,212,0.15)' },
    in_progress: { color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    qualified: { color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    pending: { color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    approved: { color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    active: { color: p.violet, bg: 'rgba(139,124,246,0.15)' },
    cold: { color: p.textMute, bg: 'rgba(107,114,128,0.15)' },
    nurture: { color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    disqualified: { color: p.rose, bg: 'rgba(244,63,94,0.15)' },
    converted: { color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
  }
}

function buildTimelineEventStyle(p: PaletteType): Record<TimelineEventType, { icon: React.ElementType; color: string; bg: string }> {
  return {
    lead_created: { icon: UserPlus, color: p.violet, bg: 'rgba(139,124,246,0.15)' },
    lead_assigned: { icon: UserPlus, color: p.cyan, bg: 'rgba(6,182,212,0.15)' },
    interaction_logged: { icon: Phone, color: p.cyan, bg: 'rgba(6,182,212,0.15)' },
    stage_changed: { icon: ArrowRight, color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    status_changed: { icon: ArrowRight, color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    score_updated: { icon: Check, color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    qualification_completed: { icon: CheckCircle2, color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    lead_converted: { icon: ArrowRight, color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    follow_up_created: { icon: Calendar, color: p.amber, bg: 'rgba(245,158,11,0.15)' },
    follow_up_completed: { icon: CheckCircle2, color: p.emerald, bg: 'rgba(16,185,129,0.15)' },
    lead_disqualified: { icon: AlertCircle, color: p.rose, bg: 'rgba(244,63,94,0.15)' },
    note_added: { icon: MessageSquare, color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
    document_uploaded: { icon: FileText, color: p.cyan, bg: 'rgba(6,182,212,0.15)' },
  }
}

type FeedItem =
  | {
      id: string
      kind: 'timeline'
      timestamp: string
      title: string
      description: string
      user: string
      icon: React.ElementType
      color: string
      bg: string
      meta?: string
      ownerAction?: boolean
    }
  | {
      id: string
      kind: 'interaction'
      timestamp: string
      title: string
      description: string
      user: string
      icon: React.ElementType
      color: string
      bg: string
      meta?: string
      ownerAction?: boolean
    }
  | {
      id: string
      kind: 'task'
      timestamp: string
      title: string
      description: string
      user: string
      icon: React.ElementType
      color: string
      bg: string
      meta?: string
      status: FollowUpTask['status']
      taskId: string
      ownerAction?: boolean
    }

interface LeadDetailPanelProps {
  lead: Lead
  interactions?: Interaction[]
  followUpTasks?: FollowUpTask[]
  timeline?: TimelineEvent[]
  metrics?: LeadMetrics
  onUpdateStage?: (stage: string) => void
  onUpdateStatus?: (status: LeadStatus, comments?: string) => Promise<void> | void
  onCreateFollowUp?: (data: {
    leadId: string
    title: string
    description: string
    type: NextActionType
    scheduledAt: string
    priority: FollowUpPriority
    owner: string
  }) => void
  onEditLead?: () => void
  onLogInteraction?: (data: CreateInteractionRequest) => void
  onCompleteTask?: (taskId: string) => void
  className?: string
}

export function LeadDetailPanel({
  lead,
  interactions = [],
  followUpTasks = [],
  timeline = [],
  metrics,
  onLogInteraction,
  onCompleteTask,
  onUpdateStage,
  onUpdateStatus,
  onCreateFollowUp,
  onEditLead,
  className,
}: LeadDetailPanelProps) {
  const { palette } = useTheme()
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showStageStepsModal, setShowStageStepsModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status)
  const [statusComments, setStatusComments] = useState('')
  const [statusError, setStatusError] = useState('')
  const [stageStepWarning, setStageStepWarning] = useState('')
  const [stageStepChecks, setStageStepChecks] = useState<boolean[]>([])
  const [followUpStatus, setFollowUpStatus] = useState<LeadStatus>(lead.status)
  const [followUpIndicator, setFollowUpIndicator] = useState('warm')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpPriority, setFollowUpPriority] = useState<FollowUpPriority>('medium')
  const [followUpOwner, setFollowUpOwner] = useState(lead.assignedTo || lead.owner)
  const [callingAction, setCallingAction] = useState<NextActionType>('call_again')
  const [nextFollowUpAction, setNextFollowUpAction] = useState<NextActionType>('call_again')
  const [followUpComments, setFollowUpComments] = useState('')
  const [followUpError, setFollowUpError] = useState('')
  const sourceConfig = buildSourceConfig(palette)
  const statusConfig = buildStatusConfig(palette)
  const timelineEventStyle = buildTimelineEventStyle(palette)
  const stageConfig = STAGE_CONFIG[lead.stage]
  const stageEntries = Object.values(STAGE_CONFIG)
  const stageIndex = Math.max(stageEntries.findIndex((stage) => stage.id === lead.stage), 0)
  const stageProgress = ((stageIndex + 1) / stageEntries.length) * 100
  const previousStage = stageEntries[stageIndex - 1]
  const nextStage = stageEntries[stageIndex + 1]
  const statusSequence: LeadStatus[] = ['new', 'in_progress', 'qualified', 'nurture', 'pending', 'approved', 'active', 'cold', 'converted', 'disqualified']
  const currentStatusIndex = statusSequence.indexOf(lead.status)
  const nextStatus = currentStatusIndex >= 0 ? statusSequence[currentStatusIndex + 1] : undefined
  const leadOwner = getLeadOwner(lead)
  const activeSubStage = getLeadSubStage(lead, { interactions, followUpTasks, timeline })
  const ownerActionTasks = getOwnerActionTasks(lead, followUpTasks)
  const statusStyle = statusConfig[lead.status] ?? statusConfig.new
  const sourceStyle = sourceConfig[lead.source] ?? sourceConfig.other
  const stageStepStorageKey = `franchise-crm-stage-steps:${lead.id}:${lead.stage}`
  const completedStageSteps = stageStepChecks.filter(Boolean).length
  const allStageStepsComplete = stageConfig.steps.length > 0 && completedStageSteps === stageConfig.steps.length

  useEffect(() => {
    const saved = window.localStorage.getItem(stageStepStorageKey)
    const parsed = saved ? JSON.parse(saved) as boolean[] : []
    setStageStepChecks(stageConfig.steps.map((_, index) => Boolean(parsed[index])))
    setStageStepWarning('')
  }, [stageConfig.steps, stageStepStorageKey])

  const formatDateTime = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Not available'

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Not available'

  const resetFollowUpForm = () => {
    setFollowUpStatus(lead.status)
    setFollowUpIndicator('warm')
    setFollowUpDate('')
    setFollowUpPriority('medium')
    setFollowUpOwner(lead.assignedTo || lead.owner)
    setCallingAction('call_again')
    setNextFollowUpAction('call_again')
    setFollowUpComments('')
    setFollowUpError('')
  }

  const openFollowUpModal = () => {
    resetFollowUpForm()
    setShowFollowUpModal(true)
  }

  const closeFollowUpModal = () => {
    setShowFollowUpModal(false)
    setFollowUpError('')
  }

  const openStatusModal = (status: LeadStatus = nextStatus || lead.status) => {
    setSelectedStatus(status)
    setStatusComments('')
    setStatusError('')
    setShowStatusConfirm(true)
  }

  const closeStatusModal = () => {
    setShowStatusConfirm(false)
    setStatusError('')
  }

  const submitStatusChange = async () => {
    if (!onUpdateStatus) return
    if (selectedStatus === lead.status && !statusComments.trim()) {
      setStatusError('Select a new status or add a comment before saving.')
      return
    }

    await onUpdateStatus(selectedStatus, statusComments.trim() || undefined)
    closeStatusModal()
  }

  const toggleStageStep = (index: number) => {
    setStageStepChecks((current) => {
      const next = stageConfig.steps.map((_, stepIndex) => stepIndex === index ? !current[stepIndex] : Boolean(current[stepIndex]))
      window.localStorage.setItem(stageStepStorageKey, JSON.stringify(next))
      if (next.every(Boolean)) {
        setStageStepWarning('')
      }
      return next
    })
  }

  const openStageStepsModal = () => {
    setStageStepWarning('')
    setShowStageStepsModal(true)
  }

  const closeStageStepsModal = () => {
    setShowStageStepsModal(false)
    setStageStepWarning('')
  }

  const handleNextStageRequest = () => {
    if (!nextStage || !onUpdateStage) return

    if (!allStageStepsComplete) {
      setStageStepWarning('First fulfill all requirements in this stage, then move to the next stage.')
      setShowStageStepsModal(true)
      return
    }

    setShowStageStepsModal(false)
    setStageStepWarning('')
    onUpdateStage(nextStage.id)
  }

  const completeAllStageSteps = () => {
    const next = stageConfig.steps.map(() => true)
    window.localStorage.setItem(stageStepStorageKey, JSON.stringify(next))
    setStageStepChecks(next)
    setStageStepWarning('')
  }

  const handleCreateFollowUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFollowUpError('')

    if (!followUpDate) {
      setFollowUpError('Select the next follow-up date.')
      return
    }

    if (!followUpOwner.trim()) {
      setFollowUpError('Assign the follow-up to an owner.')
      return
    }

    if (!followUpComments.trim()) {
      setFollowUpError('Add follow-up comments.')
      return
    }

    if (followUpStatus !== lead.status) {
      onUpdateStatus?.(followUpStatus)
    }

    onCreateFollowUp?.({
      leadId: lead.id,
      title: nextFollowUpAction.replace(/_/g, ' '),
      description: followUpComments.trim(),
      type: nextFollowUpAction,
      scheduledAt: new Date(`${followUpDate}T09:00`).toISOString(),
      priority: followUpPriority,
      owner: followUpOwner.trim(),
    })
    closeFollowUpModal()
  }

  const slaStatus = metrics?.slaBreached
    ? { color: palette.rose, bg: 'rgba(244,63,94,0.15)', label: 'SLA Breached' }
    : stageConfig.slaHours
      ? { color: palette.amber, bg: 'rgba(245,158,11,0.15)', label: 'SLA Active' }
      : null

  const feedItems: FeedItem[] = [
    ...timeline.map((event) => {
      const style = timelineEventStyle[event.type]
      return {
        id: `timeline-${event.id}`,
        kind: 'timeline' as const,
        timestamp: event.timestamp,
        title: event.type.split('_').join(' '),
        description: event.description,
        user: event.user,
        icon: style.icon,
        color: style.color,
        bg: style.bg,
        meta:
          event.type === 'stage_changed' && (event.previousValue || event.newValue)
            ? `${event.previousValue || 'Unknown'} -> ${event.newValue || 'Unknown'}`
            : undefined,
        ownerAction: false,
      }
    }),
    ...interactions
      .filter((interaction) => !timeline.some((event) => event.interactionId === interaction.id))
      .map((interaction) => ({
        id: `interaction-${interaction.id}`,
        kind: 'interaction' as const,
        timestamp: interaction.timestamp,
        title: `${interaction.channel.replace('_', ' ')} ${interaction.outcome.replace('_', ' ')}`,
        description: interaction.notes,
        user: interaction.salesRep,
        icon: Phone,
        color: palette.cyan,
        bg: 'rgba(6,182,212,0.15)',
        meta: interaction.duration ? `Duration: ${interaction.duration} mins` : undefined,
        ownerAction: false,
      })),
    ...followUpTasks.map((task) => ({
      id: `task-${task.id}`,
      kind: 'task' as const,
      timestamp: task.completedAt || task.scheduledAt,
      title: task.status === 'completed' ? 'follow up completed' : 'follow up scheduled',
      description: `${task.title}: ${task.description}`,
      user: task.owner,
      icon: task.status === 'completed' ? CheckCircle2 : Calendar,
      color: task.status === 'completed' ? palette.emerald : palette.amber,
      bg: task.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
      meta: `${task.priority} priority`,
      status: task.status,
      taskId: task.id,
      ownerAction: task.owner === leadOwner && (task.status === 'pending' || task.status === 'overdue'),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const overlays = (
    <>
      {showStageStepsModal ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={closeStageStepsModal}
        >
          <div
            className="w-full max-w-2xl rounded-xl border shadow-2xl"
            style={{ background: palette.bgElev, borderColor: palette.border }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: palette.border }}>
              <div>
                <div className="text-xs font-semibold uppercase" style={{ color: stageConfig.color }}>
                  Stage {stageIndex + 1}
                </div>
                <h3 className="mt-1 text-xl font-semibold" style={{ color: palette.text }}>
                  {stageConfig.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: palette.textMute }}>
                  Tick every requirement before moving to {nextStage?.name || 'the next stage'}.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeStageStepsModal}>
                <X className="h-5 w-5" style={{ color: palette.textMute }} />
              </Button>
            </div>

            <div className="space-y-4 p-5">
              {stageStepWarning ? (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.amber, background: palette.amber + '12', color: palette.amber }}>
                  {stageStepWarning}
                </div>
              ) : null}

              <div className="rounded-lg border p-3" style={{ borderColor: palette.border, background: palette.bgCard }}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold" style={{ color: palette.text }}>
                    Stage steps
                  </div>
                  <Badge style={{ background: allStageStepsComplete ? palette.emerald + '20' : palette.amber + '20', color: allStageStepsComplete ? palette.emerald : palette.amber }}>
                    {completedStageSteps}/{stageConfig.steps.length} complete
                  </Badge>
                </div>

                <div className="space-y-2">
                  {stageConfig.steps.map((step, index) => {
                    const isComplete = Boolean(stageStepChecks[index])

                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => toggleStageStep(index)}
                        className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-white/5"
                        style={{
                          borderColor: isComplete ? stageConfig.color : palette.border,
                          background: isComplete ? stageConfig.color + '10' : 'transparent',
                        }}
                      >
                        <span
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                          style={{
                            background: isComplete ? stageConfig.color : stageConfig.color + '18',
                            color: isComplete ? 'white' : stageConfig.color,
                          }}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: palette.text }}>
                          {step}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={completeAllStageSteps}
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  Mark All Complete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeStageStepsModal}
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStageRequest}
                  disabled={!nextStage}
                  style={{ background: allStageStepsComplete ? stageConfig.color : palette.textMute }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {nextStage ? `Move to ${nextStage.shortName}` : 'Final Stage'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showStatusConfirm ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={closeStatusModal}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl"
            style={{ background: palette.bgElev, borderColor: palette.border }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b p-5" style={{ borderColor: palette.border, background: palette.bgCard }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase" style={{ color: palette.textMute }}>Change Lead Status</div>
                    <h3 className="mt-1 text-xl font-semibold" style={{ color: palette.text }}>{lead.name}</h3>
                    <p className="mt-1 text-sm" style={{ color: palette.textMute }}>
                      {lead.id} · Current status: {formatLabel(lead.status)}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={closeStatusModal}>
                  <X className="h-5 w-5" style={{ color: palette.textMute }} />
                </Button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-3 text-sm font-medium" style={{ color: palette.text }}>Select new status</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {statusSequence.map((status) => {
                    const style = statusConfig[status] ?? statusConfig.new
                    const isSelected = selectedStatus === status
                    const isCurrent = lead.status === status

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(status)
                          setStatusError('')
                        }}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-white/5"
                        style={{
                          borderColor: isSelected ? style.color : palette.border,
                          background: isSelected ? style.bg : palette.bgCard,
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full border"
                            style={{
                              borderColor: style.color,
                              background: isSelected ? style.color : 'transparent',
                              color: isSelected ? 'white' : style.color,
                            }}
                          >
                            {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                          </span>
                          <span className="font-medium" style={{ color: palette.text }}>{formatLabel(status)}</span>
                        </span>
                        {isCurrent ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium" style={{ color: palette.text }}>Comments</span>
                <Textarea
                  value={statusComments}
                  onChange={(event) => setStatusComments(event.target.value)}
                  placeholder="Add context for this status change..."
                  rows={4}
                  style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                />
              </label>

              {statusError ? (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                  {statusError}
                </div>
              ) : null}

              <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.border, background: palette.bgCard, color: palette.textMute }}>
                Status will change from <span style={{ color: palette.text }}>{formatLabel(lead.status)}</span> to{' '}
                <span style={{ color: palette.text }}>{formatLabel(selectedStatus)}</span>.
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeStatusModal}
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={submitStatusChange} style={{ background: palette.violet }}>
                  Save Status Change
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showFollowUpModal ? (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 p-4"
          onMouseDown={closeFollowUpModal}
        >
          <div
            className="mx-auto my-6 w-full max-w-5xl rounded-xl border shadow-2xl"
            style={{ background: palette.bgElev, borderColor: palette.border }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: palette.border }}>
              <div className="flex items-center gap-3">
                <CalendarPlus className="h-7 w-7" style={{ color: palette.cyan }} />
                <h3 className="text-2xl font-semibold" style={{ color: palette.text }}>Schedule Follow-up</h3>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeFollowUpModal}>
                <X className="h-5 w-5" style={{ color: palette.textMute }} />
              </Button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-6 p-5">
              <div className="rounded-lg border px-4 py-3 text-base font-semibold" style={{ borderColor: palette.cyan, background: palette.cyan + '10', color: palette.violet }}>
                Schedule next follow-up for {lead.name}
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: palette.text }}>Lead Status <span style={{ color: palette.rose }}>*</span></label>
                <div className="mt-3 flex flex-wrap gap-2 rounded-lg border p-3" style={{ borderColor: palette.border }}>
                  {(['new', 'in_progress', 'qualified', 'nurture', 'pending', 'approved', 'active', 'cold', 'disqualified', 'converted'] as LeadStatus[]).map((status) => {
                    const style = statusConfig[status] ?? statusConfig.new
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFollowUpStatus(status)}
                        className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm capitalize"
                        style={{
                          background: followUpStatus === status ? style.bg : 'transparent',
                          borderColor: followUpStatus === status ? style.color : palette.border,
                          color: style.color,
                        }}
                      >
                        <span className="h-3 w-3 rounded-full border" style={{ borderColor: style.color, background: followUpStatus === status ? style.color : 'transparent' }} />
                        {formatLabel(status)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Lead Indicator <span style={{ color: palette.rose }}>*</span></span>
                  <select
                    value={followUpIndicator}
                    onChange={(event) => setFollowUpIndicator(event.target.value)}
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  >
                    <option value="cold">Cold</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Next Follow-up Date <span style={{ color: palette.rose }}>*</span></span>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(event) => setFollowUpDate(event.target.value)}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                  <span className="block text-xs" style={{ color: palette.textMute }}>Created at 09:00 for the selected date.</span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Lead Priority <span style={{ color: palette.rose }}>*</span></span>
                  <select
                    value={followUpPriority}
                    onChange={(event) => setFollowUpPriority(event.target.value as FollowUpPriority)}
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Assign To <span style={{ color: palette.rose }}>*</span></span>
                  <Input
                    value={followUpOwner}
                    onChange={(event) => setFollowUpOwner(event.target.value)}
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Calling Action</span>
                  <select
                    value={callingAction}
                    onChange={(event) => setCallingAction(event.target.value as NextActionType)}
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  >
                    <option value="call_again">Call Again</option>
                    <option value="send_brochure">Send Brochure</option>
                    <option value="schedule_meeting">Schedule Meeting</option>
                    <option value="wait_response">Wait Response</option>
                    <option value="send_proposal">Send Proposal</option>
                    <option value="follow_up_email">Follow-up Email</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: palette.text }}>Next Follow Up Action</span>
                  <select
                    value={nextFollowUpAction}
                    onChange={(event) => setNextFollowUpAction(event.target.value as NextActionType)}
                    className="h-11 w-full rounded-lg border px-3 text-sm outline-none"
                    style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                  >
                    <option value="call_again">Call Again</option>
                    <option value="send_brochure">Send Brochure</option>
                    <option value="schedule_meeting">Schedule Meeting</option>
                    <option value="wait_response">Wait Response</option>
                    <option value="send_proposal">Send Proposal</option>
                    <option value="follow_up_email">Follow-up Email</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium" style={{ color: palette.text }}>Comments<span style={{ color: palette.rose }}>*</span></span>
                <Textarea
                  value={followUpComments}
                  onChange={(event) => setFollowUpComments(event.target.value)}
                  placeholder="Add any additional comments..."
                  rows={5}
                  style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
                />
              </label>

              {followUpError ? (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: palette.rose, color: palette.rose }}>
                  {followUpError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeFollowUpModal} style={{ borderColor: palette.border, color: palette.text }}>
                  Cancel
                </Button>
                <Button type="submit" style={{ background: palette.violet }}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create Follow-up
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="shrink-0 p-4 border-b" style={{ borderColor: palette.border }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback style={{ background: palette.violet, color: 'white', fontSize: '18px' }}>
                {lead.name.split(' ').map((part) => part[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: palette.text }}>{lead.name}</h2>
              <p className="text-sm" style={{ color: palette.textMute }}>{lead.id}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditLead}
            style={{ color: palette.textMute }}
            aria-label={`Edit ${lead.name}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge style={{ background: sourceStyle.bg, color: sourceStyle.color }} className="capitalize">
            {lead.source}
          </Badge>
          <Badge style={{ background: statusStyle.bg, color: statusStyle.color }}>
            {formatLabel(lead.status)}
          </Badge>
          <Badge style={{ background: stageConfig.color + '20', color: stageConfig.color }}>
            {stageConfig.name}
          </Badge>
          <Badge style={{ background: 'rgba(245,158,11,0.14)', color: palette.amber }}>
            {activeSubStage.shortDisplay}
          </Badge>
          {slaStatus && (
            <Badge style={{ background: slaStatus.bg, color: slaStatus.color }}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {slaStatus.label}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {nextStage && onUpdateStage ? (
            <Button
              type="button"
              size="sm"
              onClick={handleNextStageRequest}
              style={{ background: stageConfig.color }}
              className="min-w-[150px] flex-1"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Next Stage
            </Button>
          ) : null}
          {nextStatus && onUpdateStatus ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openStatusModal(nextStatus)}
              style={{ borderColor: palette.border, color: palette.text }}
              className="min-w-[150px] flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" style={{ color: palette.emerald }} />
              Next Status
            </Button>
          ) : null}
          {onCreateFollowUp ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={openFollowUpModal}
              style={{ borderColor: palette.border, color: palette.text }}
              className="min-w-[185px] flex-1"
            >
              <CalendarPlus className="mr-2 h-4 w-4" style={{ color: palette.cyan }} />
              Schedule Follow-up
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-4">
        <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base" style={{ color: palette.text }}>
                  Current Stage Plan
                </CardTitle>
                <p className="mt-1 text-sm" style={{ color: palette.textMute }}>
                  Stage {stageIndex + 1} of {stageEntries.length}
                </p>
                <p className="mt-1 text-xs" style={{ color: stageConfig.color }}>
                  {activeSubStage.display}
                </p>
              </div>
              <Badge style={{ background: stageConfig.color + '20', color: stageConfig.color }}>
                {stageConfig.shortName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold" style={{ color: palette.text }}>
                  {stageConfig.name}
                </h3>
                <span className="text-xs" style={{ color: palette.textMute }}>
                  {Math.round(stageProgress)}% lifecycle progress
                </span>
              </div>
              <Progress value={stageProgress} className="mt-2 h-2" />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.textDim }}>
                {stageConfig.description}
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: palette.textMute }}>
                Outcome: {stageConfig.outcome}
              </p>
              {onUpdateStage ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {previousStage ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStage(previousStage.id)}
                      style={{ borderColor: palette.border, color: palette.text }}
                      className="min-w-[150px] flex-1"
                    >
                      Back to {previousStage.shortName}
                    </Button>
                  ) : null}
                  {nextStage ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleNextStageRequest}
                      style={{ background: stageConfig.color }}
                      className="min-w-[170px] flex-1"
                    >
                      Move to {nextStage.shortName}
                    </Button>
                  ) : null}
                  {nextStatus && onUpdateStatus ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusModal(nextStatus)}
                      style={{ borderColor: palette.border, color: palette.text }}
                      className="min-w-[190px] flex-1"
                    >
                      Next Status: {formatLabel(nextStatus)}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {ownerActionTasks.length > 0 ? (
                <div className="mt-3 rounded-lg border p-3" style={{ borderColor: palette.amber, background: 'rgba(245,158,11,0.08)' }}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: palette.amber }}>
                    <UserCheck className="h-3.5 w-3.5" />
                    Owner action due
                  </div>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: palette.textDim }}>
                    {ownerActionTasks.length} task{ownerActionTasks.length > 1 ? 's' : ''} assigned to {leadOwner} need attention.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: stageConfig.color }} />
                  Stage steps
                </div>
                <button
                  type="button"
                  className="text-xs font-medium hover:underline"
                  style={{ color: stageConfig.color }}
                  onClick={openStageStepsModal}
                >
                  {completedStageSteps}/{stageConfig.steps.length} complete
                </button>
              </div>
              <div className="space-y-2">
                {stageConfig.steps.map((step, index) => {
                  const isComplete = Boolean(stageStepChecks[index])
                  return (
                  <button
                    key={step}
                    type="button"
                    className="flex w-full gap-2 rounded-md p-1 text-left transition-colors hover:bg-white/5"
                    onClick={() => toggleStageStep(index)}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                      style={{
                        background: isComplete ? stageConfig.color : stageConfig.color + '18',
                        color: isComplete ? 'white' : stageConfig.color,
                      }}
                    >
                      {isComplete ? <Check className="h-3 w-3" /> : index + 1}
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: isComplete ? palette.text : palette.textDim }}>
                      {step}
                    </span>
                  </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                <div className="text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                  Ownership
                </div>
                <div className="mt-2 text-sm font-medium" style={{ color: palette.text }}>
                  {stageConfig.primaryOwner}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stageConfig.supportingTeams.map((team) => (
                    <Badge key={team} variant="secondary">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
                <div className="text-xs font-semibold uppercase" style={{ color: palette.textMute }}>
                  Controls
                </div>
                <div className="mt-2 space-y-1.5">
                  {stageConfig.controls.map((control) => (
                    <div key={control} className="flex items-center gap-2 text-xs" style={{ color: palette.textDim }}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: stageConfig.color }} />
                      {control}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base" style={{ color: palette.text }}>
              Activity Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedItems.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: palette.textMute }} />
                <p style={{ color: palette.textMute }}>No activity yet</p>
              </div>
            ) : (
              feedItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="relative flex gap-3">
                    {index < feedItems.length - 1 && (
                      <div
                        className="absolute left-[17px] top-10 bottom-[-14px] w-0.5"
                        style={{ background: palette.border }}
                      />
                    )}

                    <div
                      className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: item.bg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>

                    <div
                      className="flex-1 rounded-xl border p-3"
                      style={{
                        background: item.ownerAction ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                        borderColor: item.ownerAction ? palette.amber : palette.border,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold uppercase" style={{ color: item.color }}>
                            {item.title}
                          </span>
                          {item.ownerAction ? (
                            <Badge style={{ background: 'rgba(245,158,11,0.16)', color: palette.amber }}>
                              Owner action
                            </Badge>
                          ) : null}
                          <span className="text-xs" style={{ color: palette.textMute }}>
                            {formatDateTime(item.timestamp)}
                          </span>
                        </div>
                        {item.kind === 'task' && item.status !== 'completed' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCompleteTask?.(item.taskId)}
                            style={{ color: palette.emerald }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        ) : null}
                      </div>

                      <p className="text-sm mt-2" style={{ color: palette.text }}>
                        {item.description}
                      </p>

                      {item.meta ? (
                        <p className="text-xs mt-2" style={{ color: palette.textMute }}>
                          {item.meta}
                        </p>
                      ) : null}

                      <div className="flex items-center gap-2 mt-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                          style={{ background: 'rgba(139,124,246,0.12)', color: palette.violet }}
                        >
                          {item.user.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs" style={{ color: palette.textMute }}>
                          {item.user}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <InteractionLogger
          leadId={lead.id}
          leadName={lead.name}
          onSubmit={onLogInteraction ?? (() => undefined)}
        />

        {onCreateFollowUp ? (
          <Button
            type="button"
            onClick={openFollowUpModal}
            className="w-full"
            variant="outline"
            style={{ background: palette.bgCard, borderColor: palette.border, color: palette.text }}
          >
            <CalendarPlus className="mr-2 h-4 w-4" style={{ color: palette.cyan }} />
            Schedule Follow-up
          </Button>
        ) : null}

        <div className="grid gap-4">
          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm" style={{ color: palette.text }}>Lead Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>{lead.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>{lead.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>{lead.location || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Investment</span>
                <span className="text-sm font-medium" style={{ color: palette.text }}>Rs {lead.investment}L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Lead Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={lead.score} className="w-20 h-2" />
                  <span className="text-sm font-medium" style={{ color: palette.text }}>{lead.score}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Owner</span>
                <span className="text-sm" style={{ color: palette.text }}>{lead.assignedTo || lead.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Created</span>
                <span className="text-sm" style={{ color: palette.text }}>{formatDateTime(lead.created)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: palette.textMute }}>Last Activity</span>
                <span className="text-sm" style={{ color: palette.text }}>{formatDateTime(lead.lastActivity)}</span>
              </div>
            </CardContent>
          </Card>

          {metrics ? (
            <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm" style={{ color: palette.text }}>Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: palette.textMute }}>Total Attempts</span>
                  <span className="text-sm font-medium" style={{ color: palette.text }}>{metrics.totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: palette.textMute }}>Connected</span>
                  <span className="text-sm font-medium" style={{ color: palette.emerald }}>{metrics.totalConnects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: palette.textMute }}>Connect Rate</span>
                  <span className="text-sm font-medium" style={{ color: palette.text }}>{metrics.connectRate}%</span>
                </div>
                {metrics.bestChannel ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: palette.textMute }}>Best Channel</span>
                    <Badge variant="secondary">{metrics.bestChannel}</Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card style={{ background: palette.bgCard, borderColor: palette.border }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm" style={{ color: palette.text }}>Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>
                  {lead.businessExperience || 'Business experience not captured yet'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <UserPlus className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>
                  Decision maker: {lead.isDecisionMaker ? 'Yes' : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>
                  Timeline to invest: {lead.timelineToInvest || 'Not captured'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" style={{ color: palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>
                  Captured at: {formatDateTime(lead.capturedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {createPortal(overlays, document.body)}
    </div>
  )
}

export default LeadDetailPanel
