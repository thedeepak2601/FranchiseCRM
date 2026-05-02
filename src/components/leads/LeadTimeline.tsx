/**
 * Lead Timeline Component
 * Full audit trail and activity history
 */

import {
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TimelineEvent, TimelineEventType } from '@/types/lead'

const palette = {
  bgCard: '#161A24',
  border: '#1F2433',
  text: '#E5E7EB',
  textDim: '#9CA3AF',
  textMute: '#6B7280',
  violet: '#8B7CF6',
  violetBg: 'rgba(139,124,246,0.08)',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  cyan: '#06B6D4',
}

const eventConfig: Record<TimelineEventType, { icon: React.ElementType; color: string; bg: string }> = {
  lead_created: { icon: UserPlus, color: palette.violet, bg: 'rgba(139,124,246,0.15)' },
  lead_assigned: { icon: UserPlus, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  interaction_logged: { icon: Phone, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
  stage_changed: { icon: ArrowRight, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  status_changed: { icon: TrendingUp, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  score_updated: { icon: Target, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  qualification_completed: { icon: CheckCircle2, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  lead_converted: { icon: ArrowRight, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  follow_up_created: { icon: Calendar, color: palette.amber, bg: 'rgba(245,158,11,0.15)' },
  follow_up_completed: { icon: CheckCircle2, color: palette.emerald, bg: 'rgba(16,185,129,0.15)' },
  lead_disqualified: { icon: XCircle, color: palette.rose, bg: 'rgba(244,63,94,0.15)' },
  note_added: { icon: MessageSquare, color: palette.textDim, bg: 'rgba(156,163,175,0.15)' },
  document_uploaded: { icon: FileText, color: palette.cyan, bg: 'rgba(6,182,212,0.15)' },
}

interface LeadTimelineProps {
  events: TimelineEvent[]
  className?: string
}

export function LeadTimeline({ events, className }: LeadTimelineProps) {
  if (!events.length) {
    return (
      <div className={cn("p-8 text-center rounded-lg", className)} style={{ background: palette.bgCard }}>
        <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: palette.textMute }} />
        <p style={{ color: palette.textMute }}>No activity timeline yet</p>
        <p className="text-xs mt-1" style={{ color: palette.textMute }}>
          Interactions and updates will appear here
        </p>
      </div>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className={cn("space-y-1", className)}>
      {events.map((event, index) => {
        const config = eventConfig[event.type] ?? eventConfig.note_added
        const Icon = config.icon

        return (
          <div
            key={event.id}
            className="relative flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            {index < events.length - 1 && (
              <div
                className="absolute left-[18px] top-10 bottom-0 w-0.5"
                style={{ background: palette.border }}
              />
            )}

            <div
              className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: config.bg }}
            >
              <Icon className="h-4 w-4" style={{ color: config.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: config.color }}>
                  {event.type.split('_').join(' ')}
                </span>
                <span className="text-xs" style={{ color: palette.textMute }}>
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>

              <p className="text-sm mt-0.5" style={{ color: palette.text }}>
                {event.description}
              </p>

              {event.type === 'stage_changed' && (event.previousValue || event.newValue) && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span style={{ color: palette.textMute }}>{event.previousValue}</span>
                  <ArrowRight className="h-3 w-3" style={{ color: palette.textMute }} />
                  <span style={{ color: palette.emerald }}>{event.newValue}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
                  style={{ background: palette.violetBg, color: palette.violet }}
                >
                  {event.user.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs" style={{ color: palette.textMute }}>
                  {event.user}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LeadTimeline
