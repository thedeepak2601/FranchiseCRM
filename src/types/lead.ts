/**
 * Lead Lifecycle Types
 * Enterprise-grade CRM system with audit trail
 */

// ============================================================
// ENUMS
// ============================================================

export type LeadSource = 'website' | 'ads' | 'whatsapp' | 'referral' | 'portal' | 'facebook' | 'google' | 'other'
export type LeadStatus = 'new' | 'in_progress' | 'qualified' | 'nurture' | 'disqualified' | 'converted' | 'pending' | 'approved' | 'active' | 'cold'
export type InteractionChannel = 'call' | 'whatsapp' | 'email' | 'sms' | 'meeting' | 'video_call'
export type InteractionOutcome = 'connected' | 'not_reachable' | 'busy' | 'wrong_number' | 'not_interested' | 'no_response' | 'scheduled_callback'
export type AttemptType = 'outbound' | 'inbound'
export type FollowUpPriority = 'low' | 'medium' | 'high' | 'urgent'
export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'cancelled'
export type NextActionType = 'call_again' | 'send_brochure' | 'schedule_meeting' | 'wait_response' | 'send_proposal' | 'follow_up_email' | 'other'

// ============================================================
// CORE LEAD OBJECT
// ============================================================

export interface Lead {
  // Identification
  id: string
  name: string
  phone: string
  email: string
  state?: string
  
  // Source & Capture
  source: LeadSource
  campaignId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  capturedAt: string
  capturedBy: string
  
  // Assignment
  assignedTo?: string
  assignedAt?: string
  assignedBy?: string
  
  // Business Info
  investment: number
  location: string
  preferredLocations?: string[]
  investmentRange?: string
  
  // Qualification
  budgetRange?: string
  businessExperience?: string
  timelineToInvest?: string
  isDecisionMaker?: boolean
  initialNotes?: string
  expectedClosureDate?: string
  nextConnectMode?: string
  nextConnectAt?: string
  referenceSource?: string
  
  // State
  stage: LeadStage
  status: LeadStatus
  score: number
  
  // Metadata
  owner: string
  created: string
  updated: string
  lastActivity: string
  
  // Relations
  opportunityId?: string
  brandId?: string
}

// ============================================================
// STAGES
// ============================================================

export type LeadStage = 
  | 'lead_capture'
  | 'first_contact'
  | 'qualification'
  | 'pipeline'
  | 'approvals'
  | 'agreement'
  | 'onboarding'
  | 'post_sale'

export interface StageConfig {
  id: LeadStage
  name: string
  description: string
  slaHours?: number
  requiredInteractions: number
  color: string
  icon: string
}

export const STAGE_CONFIG: Record<LeadStage, StageConfig> = {
  lead_capture: {
    id: 'lead_capture',
    name: 'Lead Capture',
    description: 'New lead captured from various sources',
    slaHours: 0,
    requiredInteractions: 0,
    color: '#8B7CF6',
    icon: 'UserPlus',
  },
  first_contact: {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Initial outreach and connection attempts',
    slaHours: 0.5, // 30 minutes
    requiredInteractions: 1,
    color: '#06B6D4',
    icon: 'Phone',
  },
  qualification: {
    id: 'qualification',
    name: 'Qualification',
    description: 'Qualify lead based on budget, timeline, authority',
    slaHours: 24,
    requiredInteractions: 2,
    color: '#F59E0B',
    icon: 'Target',
  },
  pipeline: {
    id: 'pipeline',
    name: 'Pipeline',
    description: 'Active opportunity in sales pipeline',
    slaHours: 72,
    requiredInteractions: 3,
    color: '#3B82F6',
    icon: 'TrendingUp',
  },
  approvals: {
    id: 'approvals',
    name: 'Approvals',
    description: 'Internal approvals (finance, legal)',
    slaHours: 48,
    requiredInteractions: 1,
    color: '#F43F5E',
    icon: 'Shield',
  },
  agreement: {
    id: 'agreement',
    name: 'Agreement',
    description: 'Contract signing and payment',
    slaHours: 24,
    requiredInteractions: 2,
    color: '#10B981',
    icon: 'FileText',
  },
  onboarding: {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Franchise setup and training',
    slaHours: 168, // 7 days
    requiredInteractions: 5,
    color: '#8B5CF6',
    icon: 'Briefcase',
  },
  post_sale: {
    id: 'post_sale',
    name: 'Post-Sale',
    description: 'Ongoing support and relationship',
    slaHours: undefined,
    requiredInteractions: 0,
    color: '#06B6D4',
    icon: 'Users',
  },
}

// ============================================================
// INTERACTION LOG (CORE CRM)
// ============================================================

export interface Interaction {
  id: string
  leadId: string
  
  // Who & When
  salesRep: string
  timestamp: string
  
  // How
  channel: InteractionChannel
  attemptType: AttemptType
  outcome: InteractionOutcome
  
  // What
  notes: string
  duration?: number // minutes
  recordingUrl?: string
  
  // Next Action
  nextAction?: NextActionType
  nextActionNotes?: string
  followUpTaskId?: string
}

// ============================================================
// FOLLOW-UP TASK
// ============================================================

export interface FollowUpTask {
  id: string
  leadId: string
  interactionId?: string
  
  // Task Details
  title: string
  description: string
  type: NextActionType
  
  // Scheduling
  scheduledAt: string
  completedAt?: string
  
  // Status
  status: FollowUpStatus
  priority: FollowUpPriority
  
  // Assignment
  owner: string
  createdBy: string
  
  // Metadata
  created: string
  updated: string
}

// ============================================================
// TIMELINE EVENT (AUDIT TRAIL)
// ============================================================

export type TimelineEventType = 
  | 'lead_created'
  | 'lead_assigned'
  | 'interaction_logged'
  | 'stage_changed'
  | 'status_changed'
  | 'score_updated'
  | 'qualification_completed'
  | 'lead_converted'
  | 'follow_up_created'
  | 'follow_up_completed'
  | 'lead_disqualified'
  | 'note_added'
  | 'document_uploaded'

export interface TimelineEvent {
  id: string
  leadId: string
  
  // Event Info
  type: TimelineEventType
  timestamp: string
  
  // Who & What
  user: string
  description: string
  
  // Details
  metadata?: Record<string, unknown>
  
  // Related Entities
  interactionId?: string
  taskId?: string
  previousValue?: string
  newValue?: string
}

// ============================================================
// LEAD METRICS
// ============================================================

export interface LeadMetrics {
  leadId: string
  
  // Interaction Stats
  totalAttempts: number
  totalConnects: number
  connectRate: number
  
  // Timing
  firstContactAt?: string
  lastContactAt: string
  avgResponseTimeHours: number
  
  // Channel Effectiveness
  channelStats: Record<InteractionChannel, {
    attempts: number
    connects: number
    rate: number
  }>
  
  // Best Channel
  bestChannel?: InteractionChannel
  
  // SLA Status
  slaBreached: boolean
  slaBreachAt?: string
}

// ============================================================
// QUALIFICATION DATA
// ============================================================

export interface QualificationData {
  leadId: string
  
  // Budget
  budgetMin: number
  budgetMax: number
  budgetFit: 'low' | 'medium' | 'high'
  
  // Timeline
  timeline: 'immediate' | '1_month' | '3_months' | '6_months' | 'exploring'
  urgency: 'low' | 'medium' | 'high'
  
  // Authority
  isDecisionMaker: boolean
  canInfluenceBudget: boolean
  hasFinalApproval: boolean
  
  // Experience
  hasFranchiseExperience: boolean
  relatedIndustryExperience: string[]
  capitalAvailable: boolean
  
  // Notes
  qualificationNotes: string
  qualifiedBy: string
  qualifiedAt: string
}

// ============================================================
// OPPORTUNITY (CONVERTED LEAD)
// ============================================================

export interface Opportunity {
  id: string
  leadId: string
  
  // Business
  expectedInvestment: number
  territory: string
  probability: number
  expectedCloseDate?: string
  
  // Stage
  opportunityStage: 'nda' | 'discovery' | 'proposal' | 'negotiation' | 'closing'
  
  // Links
  brandId?: string
  documents: {
    nda?: string
    proposal?: string
    agreement?: string
  }
  
  // Metadata
  created: string
  updated: string
  closedAt?: string
  won: boolean
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface LeadListResponse {
  data: Lead[]
  total: number
  page: number
  pageSize: number
}

export interface LeadDetailResponse {
  lead: Lead
  interactions: Interaction[]
  followUpTasks: FollowUpTask[]
  timeline: TimelineEvent[]
  metrics: LeadMetrics
}

export interface CreateLeadRequest {
  name: string
  phone: string
  email: string
  source: LeadSource
  investment: number
  location: string
  state?: string
  investmentRange?: string
  initialNotes?: string
  expectedClosureDate?: string
  nextConnectMode?: string
  nextConnectAt?: string
  referenceSource?: string
  capturedAt?: string
  campaignId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface CreateInteractionRequest {
  leadId: string
  channel: InteractionChannel
  attemptType: AttemptType
  outcome: InteractionOutcome
  notes: string
  duration?: number
  nextAction?: NextActionType
  nextActionNotes?: string
  scheduledFollowUp?: string
}

export interface UpdateLeadStageRequest {
  leadId: string
  newStage: LeadStage
  reason?: string
  notes?: string
}
