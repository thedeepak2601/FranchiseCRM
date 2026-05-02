/**
 * Lead Detail Panel
 * Single-stream event view with exact timestamps
 */

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { InteractionLogger } from './InteractionLogger'
import { cn } from '@/lib/utils'
import { STAGE_CONFIG } from '@/types/lead'
import type {
  Lead,
  Interaction,
  FollowUpTask,
  TimelineEvent,
  LeadMetrics,
  CreateInteractionRequest,
  TimelineEventType,
} from '@/types/lead'

const palette = {
  bgCard: '#161A24',
  border: '#1F2433',
  text: '#E5E7EB',
  textMute: '#6B7280',
  violet: '#8B7CF6',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  cyan: '#06B6D4',
}

const sourceConfig: Record<string, { color: string; bg: string }> = {
  website: { color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  ads: { color: palette.violet, bg: 'rgba(139,124,246,0.15)' },
  whatsapp: { color: '#25D366', bg: 'rgba(37,211,102,0.15)' },
  referral: { color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  portal: { color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  facebook: { color: '#1877F2', bg: 'rgba(24,119,242,0.15)' },
  google: { color: '#4285F4', bg: 'rgba(66,133,244,0.15)' },
  other: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  new: { color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  in_progress: { color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  qualified: { color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  pending: { color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  approved: { color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  active: { color: palette.violet, bg: 'rgba(139,124,246,0.15)' },
  cold: { color: palette.textMute, bg: 'rgba(107,114,128,0.15)' },
  nurture: { color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  disqualified: { color: palette.rose, bg: 'rgba(244,63,94,0.15)' },
  converted: { color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
}

const timelineEventStyle: Record<TimelineEventType, { icon: React.ElementType; color: string; bg: string }> = {
  lead_created: { icon: UserPlus, color: palette.violet, bg: 'rgba(139,124,246,0.15)' },
  lead_assigned: { icon: UserPlus, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  interaction_logged: { icon: Phone, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  stage_changed: { icon: ArrowRight, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  status_changed: { icon: ArrowRight, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  score_updated: { icon: Check, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  qualification_completed: { icon: CheckCircle2, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  lead_converted: { icon: ArrowRight, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  follow_up_created: { icon: Calendar, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  follow_up_completed: { icon: CheckCircle2, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  lead_disqualified: { icon: AlertCircle, color: palette.rose, bg: 'rgba(244,63,94,0.15)' },
  note_added: { icon: MessageSquare, color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
  document_uploaded: { icon: FileText, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
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
    }

interface LeadDetailPanelProps {
  lead: Lead
  interactions?: Interaction[]
  followUpTasks?: FollowUpTask[]
  timeline?: TimelineEvent[]
  metrics?: LeadMetrics
  onUpdateStage?: (stage: string) => void
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
  className,
}: LeadDetailPanelProps) {
  const stageConfig = STAGE_CONFIG[lead.stage]
  const statusStyle = statusConfig[lead.status] ?? statusConfig.new
  const sourceStyle = sourceConfig[lead.source] ?? sourceConfig.other

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
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-4 border-b" style={{ borderColor: palette.border }}>
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
          <Button variant="ghost" size="sm" style={{ color: palette.textMute }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge style={{ background: sourceStyle.bg, color: sourceStyle.color }} className="capitalize">
            {lead.source}
          </Badge>
          <Badge style={{ background: statusStyle.bg, color: statusStyle.color }}>
            {lead.status.replace('_', ' ')}
          </Badge>
          <Badge style={{ background: stageConfig.color + '20', color: stageConfig.color }}>
            {stageConfig.name}
          </Badge>
          {slaStatus && (
            <Badge style={{ background: slaStatus.bg, color: slaStatus.color }}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {slaStatus.label}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      style={{ background: 'rgba(255,255,255,0.02)', borderColor: palette.border }}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold uppercase" style={{ color: item.color }}>
                            {item.title}
                          </span>
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
    </div>
  )
}

export default LeadDetailPanel
