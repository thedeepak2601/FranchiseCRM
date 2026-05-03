import type {
  CreateInteractionRequest,
  CreateLeadRequest,
  FollowUpTask,
  Interaction,
  Lead,
  LeadMetrics,
  LeadStage,
  TimelineEvent,
  UpdateLeadStageRequest,
} from '@/types/lead'
import {
  completeMockTask,
  createMockLead,
  createMockInteraction,
  getMockLead,
  getMockLeads,
  updateMockLead,
} from '@/mocks/app-data'

export const leadApiMock = {
  getLeads: getMockLeads,
  getLead: getMockLead,
  createLead: (data: CreateLeadRequest): Promise<Lead> => createMockLead(data),
  updateLead: (name: string, data: Partial<Lead>): Promise<Lead> => updateMockLead(name, data),
  deleteLead: async (_name: string): Promise<void> => undefined,
  assignLead: async (_name: string, _assignedTo: string): Promise<Lead> => {
    throw new Error('Mock assignLead is not implemented yet')
  },
  updateStage: async (_data: UpdateLeadStageRequest): Promise<Lead> => {
    throw new Error('Mock updateStage is not implemented yet')
  },
  qualifyLead: async (_name: string, _qualification: unknown): Promise<Lead> => {
    throw new Error('Mock qualifyLead is not implemented yet')
  },
  convertToOpportunity: async (_name: string, _data: unknown): Promise<{ opportunity: string; lead: Lead }> => {
    throw new Error('Mock convertToOpportunity is not implemented yet')
  },
  disqualifyLead: async (_name: string, _reason: string, _notes?: string): Promise<Lead> => {
    throw new Error('Mock disqualifyLead is not implemented yet')
  },
}

export const interactionApiMock = {
  createInteraction: (data: CreateInteractionRequest): Promise<Interaction> => createMockInteraction(data),
  getInteractions: async (leadId: string): Promise<Interaction[]> => (await getMockLead(leadId)).interactions,
  updateInteraction: async (_name: string, _data: Partial<Interaction>): Promise<Interaction> => {
    throw new Error('Mock updateInteraction is not implemented yet')
  },
  deleteInteraction: async (_name: string): Promise<void> => undefined,
}

export const followUpApiMock = {
  createTask: async (_data: {
    leadId: string
    interactionId?: string
    title: string
    description: string
    type: string
    scheduledAt: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    owner: string
  }): Promise<FollowUpTask> => {
    throw new Error('Mock createTask is not implemented yet')
  },
  getTasks: async (leadId: string): Promise<FollowUpTask[]> => (await getMockLead(leadId)).followUpTasks,
  getMyTasks: async (): Promise<FollowUpTask[]> => {
    const leadIds = (await getMockLeads()).data.map((lead) => lead.id)
    const details = await Promise.all(leadIds.map((leadId) => getMockLead(leadId)))
    return details.flatMap((detail) => detail.followUpTasks).filter((task) => task.status !== 'completed')
  },
  completeTask: (name: string): Promise<FollowUpTask> => completeMockTask(name),
  cancelTask: async (_name: string, _reason: string): Promise<FollowUpTask> => {
    throw new Error('Mock cancelTask is not implemented yet')
  },
  snoozeTask: async (_name: string, _newDate: string): Promise<FollowUpTask> => {
    throw new Error('Mock snoozeTask is not implemented yet')
  },
}

export const timelineApiMock = {
  getTimeline: async (leadId: string): Promise<TimelineEvent[]> => (await getMockLead(leadId)).timeline,
  addNote: async (_leadId: string, _note: string): Promise<TimelineEvent> => {
    throw new Error('Mock addNote is not implemented yet')
  },
}

export const metricsApiMock = {
  getMetrics: async (leadId: string): Promise<LeadMetrics> => (await getMockLead(leadId)).metrics,
  getDashboardMetrics: async (): Promise<{
    totalLeads: number
    newToday: number
    qualifiedThisWeek: number
    convertedThisMonth: number
    avgResponseTime: number
    connectRate: number
  }> => ({
    totalLeads: 18,
    newToday: 3,
    qualifiedThisWeek: 7,
    convertedThisMonth: 2,
    avgResponseTime: 3.5,
    connectRate: 74,
  }),
}

export const bulkApiMock = {
  bulkAssign: async (_leadIds: string[], _assignedTo: string): Promise<void> => undefined,
  bulkUpdateStage: async (_leadIds: string[], _stage: LeadStage): Promise<void> => undefined,
  exportLeads: async (): Promise<Blob> => new Blob(),
}
