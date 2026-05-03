/**
 * Lead Lifecycle Types
 * Enterprise-grade CRM system with audit trail
 */

// ============================================================
// ENUMS
// ============================================================

export type LeadSource = 'website' | 'ads' | 'whatsapp' | 'referral' | 'portal' | 'facebook' | 'instagram' | 'google' | 'other'
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
  shortName: string
  description: string
  outcome: string
  steps: string[]
  controls: string[]
  primaryOwner: string
  supportingTeams: string[]
  slaHours?: number
  requiredInteractions: number
  color: string
  icon: string
}

export const STAGE_CONFIG: Record<LeadStage, StageConfig> = {
  lead_capture: {
    id: 'lead_capture',
    name: 'Lead Capture & Assignment',
    shortName: 'Capture',
    description: 'Capture the enquiry, prevent duplicates, tag the source, and assign a clear sales owner.',
    outcome: 'A clean, owned lead record ready for immediate outreach.',
    steps: [
      'Lead generated from website, ads, WhatsApp, portals, or referrals',
      'Lead created in CRM with source and campaign details',
      'Phone and email duplicate check completed',
      'Sales owner assigned automatically or by the lead desk',
    ],
    controls: [
      'Phone + email de-duplication',
      'Source and campaign tagging',
      'Sales owner assignment',
    ],
    primaryOwner: 'Sales',
    supportingTeams: ['Marketing'],
    slaHours: 0,
    requiredInteractions: 0,
    color: '#8B7CF6',
    icon: 'UserPlus',
  },
  first_contact: {
    id: 'first_contact',
    name: 'First Contact',
    shortName: 'Contact',
    description: 'Run the first outreach attempts and capture the prospect response before qualification.',
    outcome: 'A contacted prospect with a logged response and next action.',
    steps: [
      'Call, WhatsApp, email, or SMS outreach attempted',
      'Connection outcome recorded with exact timestamp',
      'Callback or follow-up task scheduled when required',
      'Lead readiness moved into qualification once contact is made',
    ],
    controls: [
      'Every attempt logged',
      'Follow-up created for no response or busy outcomes',
      'No silent stage movement',
    ],
    primaryOwner: 'Sales',
    supportingTeams: ['Manager'],
    slaHours: 0.5, // 30 minutes
    requiredInteractions: 1,
    color: '#06B6D4',
    icon: 'Phone',
  },
  qualification: {
    id: 'qualification',
    name: 'Qualification',
    shortName: 'Qualify',
    description: 'Validate budget, preferred territory, business experience, authority, and investment timeline.',
    outcome: 'A scored lead that is either nurtured, disqualified, or converted to a franchise opportunity.',
    steps: [
      'Initial contact completed and qualification questions asked',
      'Budget, location, and business experience captured',
      'Lead score calculated from fit and intent signals',
      'Qualified decision made: nurture, disqualify, or proceed',
      'Qualified lead converted to franchise opportunity',
    ],
    controls: [
      'Minimum investment threshold',
      'Territory availability soft check',
      'Manager review for borderline leads',
    ],
    primaryOwner: 'Sales',
    supportingTeams: ['Manager'],
    slaHours: 24,
    requiredInteractions: 2,
    color: '#F59E0B',
    icon: 'Target',
  },
  pipeline: {
    id: 'pipeline',
    name: 'Franchise Sales Pipeline',
    shortName: 'Pipeline',
    description: 'Progress the qualified opportunity through NDA, pitch, discovery, and territory evaluation.',
    outcome: 'A fully evaluated franchise opportunity ready for formal application and internal review.',
    steps: [
      'Opportunity created from qualified lead',
      'NDA sent and signed',
      'Franchise presentation shared',
      'Discovery call or meeting completed',
      'Location and territory evaluation recorded',
    ],
    controls: [
      'Signed NDA mandatory',
      'Meeting notes attached',
      'Preferred territory documented',
    ],
    primaryOwner: 'Sales',
    supportingTeams: ['Legal'],
    slaHours: 72,
    requiredInteractions: 3,
    color: '#3B82F6',
    icon: 'TrendingUp',
  },
  approvals: {
    id: 'approvals',
    name: 'Application & Internal Approvals',
    shortName: 'Approvals',
    description: 'Route the franchise application through legal, finance, operations, and management review.',
    outcome: 'A decisioned application with approval, rejection reason, or sales rework instructions.',
    steps: [
      'Franchise application submitted',
      'Legal review completed',
      'Finance review completed',
      'Operations review completed',
      'Management approval decision captured',
    ],
    controls: [
      'Approved leads proceed to agreement',
      'Rejected applications require a reason',
      'Rework loops back to sales with notes',
    ],
    primaryOwner: 'Management',
    supportingTeams: ['Legal', 'Finance', 'Operations'],
    slaHours: 48,
    requiredInteractions: 1,
    color: '#F43F5E',
    icon: 'Shield',
  },
  agreement: {
    id: 'agreement',
    name: 'Agreement & Payment',
    shortName: 'Agreement',
    description: 'Complete contract signing, franchise fee invoicing, payment receipt, and verification.',
    outcome: 'A paid and verified franchise agreement that can be handed to onboarding.',
    steps: [
      'Franchise agreement drafted',
      'Digital signing completed',
      'Franchise fee invoice generated',
      'Payment received',
      'Payment verified by finance',
    ],
    controls: [
      'Agreement mandatory before customer creation',
      'No payment means no onboarding',
      'Finance verification required',
    ],
    primaryOwner: 'Legal',
    supportingTeams: ['Finance', 'Sales'],
    slaHours: 24,
    requiredInteractions: 2,
    color: '#10B981',
    icon: 'FileText',
  },
  onboarding: {
    id: 'onboarding',
    name: 'Franchise Onboarding & Launch',
    shortName: 'Onboarding',
    description: 'Create the onboarding project, assign launch work, finish training, and approve go-live.',
    outcome: 'A trained and system-ready franchise location approved for launch.',
    steps: [
      'Onboarding project auto-created',
      'Training tasks assigned',
      'Store setup checklist completed',
      'Vendor and system access provisioned',
      'Go-live approval completed',
    ],
    controls: [
      'Operations-owned checklist',
      'Training completion required',
      'IT and ERP access verified',
    ],
    primaryOwner: 'Operations',
    supportingTeams: ['Training', 'IT / ERP Admin'],
    slaHours: 168, // 7 days
    requiredInteractions: 5,
    color: '#8B5CF6',
    icon: 'Briefcase',
  },
  post_sale: {
    id: 'post_sale',
    name: 'Post-Franchise Sale Management',
    shortName: 'Post-Sale',
    description: 'Manage the active franchisee relationship through royalties, compliance, support, and growth.',
    outcome: 'An active franchisee lifecycle with support, renewal, and expansion visibility.',
    steps: [
      'Active franchisee record maintained',
      'Royalty tracking monitored',
      'Compliance monitoring completed',
      'Support tickets managed',
      'Renewal or expansion opportunities identified',
    ],
    controls: [
      'Agreement renewal tracking',
      'Multi-unit expansion review',
      'Performance review cadence',
    ],
    primaryOwner: 'Operations',
    supportingTeams: ['Support', 'Finance'],
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
