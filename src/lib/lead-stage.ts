import { STAGE_CONFIG } from '@/types/lead'
import type { FollowUpTask, Interaction, Lead, TimelineEvent } from '@/types/lead'

const statusRatios: Record<Lead['status'], number> = {
  new: 0.05,
  in_progress: 0.35,
  qualified: 0.75,
  nurture: 0.7,
  disqualified: 1,
  converted: 1,
  pending: 0.55,
  approved: 0.85,
  active: 0.9,
  cold: 0.5,
}

interface LeadSubStageInput {
  interactions?: Interaction[]
  followUpTasks?: FollowUpTask[]
  timeline?: TimelineEvent[]
}

export function getLeadOwner(lead: Lead) {
  return lead.assignedTo || lead.owner
}

export function getOwnerActionTasks(lead: Lead, followUpTasks: FollowUpTask[] = []) {
  const owner = getLeadOwner(lead)
  return followUpTasks.filter((task) => task.owner === owner && (task.status === 'pending' || task.status === 'overdue'))
}

export function getLeadSubStage(lead: Lead, input: LeadSubStageInput = {}) {
  const stageConfig = STAGE_CONFIG[lead.stage]
  const steps = stageConfig.steps
  const interactions = input.interactions ?? []
  const followUpTasks = input.followUpTasks ?? []
  const timeline = input.timeline ?? []
  const completedTasks = followUpTasks.filter((task) => task.status === 'completed').length
  const connected = interactions.some((interaction) => interaction.outcome === 'connected')
  const ownerActionTasks = getOwnerActionTasks(lead, followUpTasks)

  let ratio = statusRatios[lead.status] ?? 0.2

  if (lead.stage === 'lead_capture') {
    ratio = Math.max(ratio, lead.assignedTo ? 0.8 : 0.35)
  }

  if (lead.stage === 'first_contact') {
    ratio = Math.max(ratio, connected ? 0.8 : interactions.length > 0 ? 0.45 : 0.1)
  }

  if (lead.stage === 'qualification') {
    const capturedFields = [
      lead.budgetRange || lead.investmentRange,
      lead.businessExperience,
      lead.timelineToInvest,
      typeof lead.isDecisionMaker === 'boolean' ? 'decision-maker-captured' : '',
      lead.score >= 50 ? 'score-ready' : '',
    ].filter(Boolean).length
    ratio = Math.max(ratio, capturedFields / 5)
  }

  if (lead.stage === 'pipeline') {
    ratio = Math.max(ratio, lead.opportunityId ? 0.35 : 0.2)
  }

  if (lead.stage === 'approvals') {
    ratio = Math.max(ratio, lead.status === 'pending' ? 0.6 : ratio)
  }

  if (lead.stage === 'agreement') {
    ratio = Math.max(ratio, lead.status === 'approved' ? 0.75 : ratio)
  }

  if (lead.stage === 'onboarding' || lead.stage === 'post_sale') {
    ratio = Math.max(ratio, lead.status === 'active' || lead.status === 'converted' ? 0.8 : ratio)
  }

  if (stageConfig.requiredInteractions > 0) {
    ratio = Math.max(ratio, Math.min(1, (interactions.length + completedTasks * 0.5) / (stageConfig.requiredInteractions + 1)))
  }

  if (ownerActionTasks.length > 0) {
    ratio = Math.max(ratio, 0.35)
  }

  if (timeline.some((event) => event.type === 'stage_changed' && event.newValue?.toLowerCase().includes(stageConfig.name.toLowerCase()))) {
    ratio = Math.max(ratio, 0.2)
  }

  const index = Math.min(steps.length - 1, Math.max(0, Math.floor(ratio * steps.length)))
  const label = steps[index] ?? stageConfig.outcome

  return {
    index,
    total: steps.length,
    label,
    display: `Sub-stage ${index + 1}/${steps.length}: ${label}`,
    shortDisplay: `${index + 1}/${steps.length}: ${label}`,
  }
}
