/**
 * Interaction Logger Component
 * Core CRM - Log every interaction with structure
 */

import { useState } from 'react'
import { 
  Phone, MessageSquare, Mail, MessageCircle, Calendar, Video,
  ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'
import type {
  InteractionChannel,
  InteractionOutcome,
  AttemptType,
  NextActionType,
  CreateInteractionRequest
} from '@/types/lead'

// Next action options
const nextActionOptions: { value: NextActionType; label: string }[] = [
  { value: 'call_again', label: 'Call Again' },
  { value: 'send_brochure', label: 'Send Brochure' },
  { value: 'schedule_meeting', label: 'Schedule Meeting' },
  { value: 'wait_response', label: 'Wait for Response' },
  { value: 'send_proposal', label: 'Send Proposal' },
  { value: 'follow_up_email', label: 'Follow-up Email' },
  { value: 'other', label: 'Other' },
]

interface InteractionLoggerProps {
  leadId: string
  leadName: string
  onSubmit: (data: CreateInteractionRequest) => void
  isLoading?: boolean
  className?: string
}

export function InteractionLogger({
  leadId,
  leadName,
  onSubmit,
  isLoading,
  className
}: InteractionLoggerProps) {
  const { palette } = useTheme()

  const channelConfig: Record<InteractionChannel, { icon: React.ElementType; label: string; color: string }> = {
    call: { icon: Phone, label: 'Call', color: palette.cyan },
    whatsapp: { icon: MessageCircle, label: 'WhatsApp', color: '#25D366' },
    email: { icon: Mail, label: 'Email', color: palette.violet },
    sms: { icon: MessageSquare, label: 'SMS', color: palette.amber },
    meeting: { icon: Calendar, label: 'Meeting', color: palette.emerald },
    video_call: { icon: Video, label: 'Video Call', color: palette.cyan },
  }

  const outcomeConfig: Record<InteractionOutcome, { label: string; color: string; icon: React.ElementType }> = {
    connected: { label: 'Connected', color: palette.emerald, icon: CheckCircle2 },
    not_reachable: { label: 'Not Reachable', color: palette.rose, icon: XCircle },
    busy: { label: 'Busy', color: palette.amber, icon: AlertCircle },
    wrong_number: { label: 'Wrong Number', color: palette.rose, icon: XCircle },
    not_interested: { label: 'Not Interested', color: palette.textMute, icon: XCircle },
    no_response: { label: 'No Response', color: palette.amber, icon: Clock },
    scheduled_callback: { label: 'Callback Scheduled', color: palette.cyan, icon: Calendar },
  }

  const [isExpanded, setIsExpanded] = useState(false)
  
  // Form state
  const [channel, setChannel] = useState<InteractionChannel>('call')
  const [attemptType, setAttemptType] = useState<AttemptType>('outbound')
  const [outcome, setOutcome] = useState<InteractionOutcome>('connected')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [hasNextAction, setHasNextAction] = useState(false)
  const [nextAction, setNextAction] = useState<NextActionType>('call_again')
  const [nextActionNotes, setNextActionNotes] = useState('')
  const [scheduledFollowUp, setScheduledFollowUp] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({
      leadId,
      channel,
      attemptType,
      outcome,
      notes,
      duration: duration ? parseInt(duration) : undefined,
      ...(hasNextAction && {
        nextAction,
        nextActionNotes,
        scheduledFollowUp,
      }),
    })

    // Reset form
    setChannel('call')
    setAttemptType('outbound')
    setOutcome('connected')
    setNotes('')
    setDuration('')
    setHasNextAction(false)
    setNextAction('call_again')
    setNextActionNotes('')
    setScheduledFollowUp('')
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className={cn("w-full", className)}
        variant="outline"
        style={{ 
          background: palette.bgCard, 
          borderColor: palette.border,
          color: palette.text 
        }}
      >
        <Phone className="h-4 w-4 mr-2" style={{ color: palette.cyan }} />
        Log Interaction
      </Button>
    )
  }

  return (
    <Card 
      className={cn(className)}
      style={{ background: palette.bgCard, borderColor: palette.border }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2" style={{ color: palette.text }}>
          <Phone className="h-4 w-4" style={{ color: palette.cyan }} />
          Log Interaction
          <Badge variant="secondary" className="ml-auto text-xs">
            {leadName}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: palette.textDim }}>Channel</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(channelConfig) as InteractionChannel[]).map((ch) => {
                const config = channelConfig[ch]
                const Icon = config.icon
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2 rounded-lg border transition-all",
                      channel === ch && "ring-2 ring-offset-2 ring-offset-[#0B0D14]"
                    )}
                    style={{ 
                      background: channel === ch ? config.color + '20' : 'transparent',
                      borderColor: channel === ch ? config.color : palette.border,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: config.color }} />
                    <span className="text-xs" style={{ color: palette.text }}>{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Attempt Type */}
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: palette.textDim }}>Direction</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAttemptType('outbound')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all"
                )}
                style={{ 
                  background: attemptType === 'outbound' ? palette.cyan + '20' : 'transparent',
                  borderColor: attemptType === 'outbound' ? palette.cyan : palette.border,
                }}
              >
                <ArrowUpRight className="h-4 w-4" style={{ color: attemptType === 'outbound' ? palette.cyan : palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>Outbound</span>
              </button>
              <button
                type="button"
                onClick={() => setAttemptType('inbound')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all"
                )}
                style={{ 
                  background: attemptType === 'inbound' ? palette.emerald + '20' : 'transparent',
                  borderColor: attemptType === 'inbound' ? palette.emerald : palette.border,
                }}
              >
                <ArrowDownLeft className="h-4 w-4" style={{ color: attemptType === 'inbound' ? palette.emerald : palette.textMute }} />
                <span className="text-sm" style={{ color: palette.text }}>Inbound</span>
              </button>
            </div>
          </div>

          {/* Outcome */}
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: palette.textDim }}>Outcome</Label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as InteractionOutcome)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
            >
              {(Object.keys(outcomeConfig) as InteractionOutcome[]).map((o) => (
                <option key={o} value={o}>
                  {outcomeConfig[o].label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration (for calls/meetings) */}
          {(channel === 'call' || channel === 'meeting' || channel === 'video_call') && (
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: palette.textDim }}>Duration (minutes)</Label>
              <Input
                type="number"
                placeholder="e.g., 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs" style={{ color: palette.textDim }}>Notes</Label>
            <Textarea
              placeholder="What was discussed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
            />
          </div>

          {/* Next Action Toggle */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setHasNextAction(!hasNextAction)}
              className="flex items-center gap-2 text-sm"
              style={{ color: palette.textDim }}
            >
              <div 
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center",
                  hasNextAction && "bg-emerald-500 border-emerald-500"
                )}
                style={{ borderColor: hasNextAction ? palette.emerald : palette.border }}
              >
                {hasNextAction && <CheckCircle2 className="h-3 w-3 text-white" />}
              </div>
              Set Next Action
            </button>

            {hasNextAction && (
              <div className="space-y-3 pt-2 border-t" style={{ borderColor: palette.border }}>
                <select
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value as NextActionType)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
                >
                  {nextActionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Notes for next action"
                  value={nextActionNotes}
                  onChange={(e) => setNextActionNotes(e.target.value)}
                  style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
                />

                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: palette.textDim }}>Schedule Follow-up</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFollowUp}
                    onChange={(e) => setScheduledFollowUp(e.target.value)}
                    style={{ background: palette.bg, borderColor: palette.border, color: palette.text }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="flex-1"
              style={{ borderColor: palette.border, color: palette.textDim }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !notes.trim()}
              className="flex-1"
              style={{ background: palette.cyan }}
            >
              {isLoading ? 'Saving...' : 'Log Interaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default InteractionLogger
