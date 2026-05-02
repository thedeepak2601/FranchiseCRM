/**
 * Lead API Client
 * Switches between ERPNext and app-wide mock mode
 */

import { frappeClient } from './frappe-client'
import { isMockMode } from './app-mode'
import {
  bulkApiMock,
  followUpApiMock,
  interactionApiMock,
  leadApiMock,
  metricsApiMock,
  timelineApiMock,
} from './lead-api.mock'
import type {
  Lead,
  LeadListResponse,
  LeadDetailResponse,
  CreateLeadRequest,
  CreateInteractionRequest,
  Interaction,
  FollowUpTask,
  TimelineEvent,
  LeadMetrics,
  LeadStage,
  UpdateLeadStageRequest,
} from '../types/lead'

const leadApiReal = {
  getLeads: async (params?: {
    stage?: LeadStage
    status?: string
    assignedTo?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<LeadListResponse> => {
    return frappeClient.get<LeadListResponse>('resource/Lead', params)
  },

  getLead: async (name: string): Promise<LeadDetailResponse> => {
    const [lead, interactions, tasks, timeline, metrics] = await Promise.all([
      frappeClient.get<Lead>(`resource/Lead/${name}`),
      frappeClient.get<{ data: Interaction[] }>('resource/Interaction Log', {
        filters: JSON.stringify({ lead: name }),
        order_by: 'creation desc',
      }),
      frappeClient.get<{ data: FollowUpTask[] }>('resource/Follow-up Task', {
        filters: JSON.stringify({ lead: name }),
        order_by: 'scheduled_at asc',
      }),
      frappeClient.get<{ data: TimelineEvent[] }>('resource/Activity Timeline', {
        filters: JSON.stringify({ lead: name }),
        order_by: 'timestamp desc',
      }),
      frappeClient.get<LeadMetrics>(`resource/Lead Metrics/${name}`),
    ])

    return {
      lead,
      interactions: interactions.data || [],
      followUpTasks: tasks.data || [],
      timeline: timeline.data || [],
      metrics,
    }
  },

  createLead: async (data: CreateLeadRequest): Promise<Lead> =>
    frappeClient.post<Lead>('resource/Lead', {
      ...data,
      doctype: 'Lead',
    }),

  updateLead: async (name: string, data: Partial<Lead>): Promise<Lead> =>
    frappeClient.put<Lead>(`resource/Lead/${name}`, data),

  deleteLead: async (name: string): Promise<void> =>
    frappeClient.delete(`resource/Lead/${name}`),

  assignLead: async (name: string, assignedTo: string): Promise<Lead> =>
    frappeClient.post<Lead>('method/assign_lead', {
      lead_name: name,
      user: assignedTo,
    }),

  updateStage: async (data: UpdateLeadStageRequest): Promise<Lead> =>
    frappeClient.post<Lead>('method/update_lead_stage', data),

  qualifyLead: async (
    name: string,
    qualification: {
      budgetRange: string
      timelineToInvest: string
      isDecisionMaker: boolean
      businessExperience: string
    }
  ): Promise<Lead> =>
    frappeClient.post<Lead>('method/qualify_lead', {
      lead_name: name,
      ...qualification,
    }),

  convertToOpportunity: async (
    name: string,
    data: { expectedInvestment: number; territory: string; brand?: string }
  ): Promise<{ opportunity: string; lead: Lead }> =>
    frappeClient.post('method/convert_lead_to_opportunity', {
      lead_name: name,
      ...data,
    }),

  disqualifyLead: async (name: string, reason: string, notes?: string): Promise<Lead> =>
    frappeClient.post<Lead>('method/disqualify_lead', {
      lead_name: name,
      reason,
      notes,
    }),
}

const interactionApiReal = {
  createInteraction: async (data: CreateInteractionRequest): Promise<Interaction> =>
    frappeClient.post<Interaction>('resource/Interaction Log', {
      ...data,
      doctype: 'Interaction Log',
    }),

  getInteractions: async (leadId: string): Promise<Interaction[]> => {
    const response = await frappeClient.get<{ data: Interaction[] }>('resource/Interaction Log', {
      filters: JSON.stringify({ lead: leadId }),
      order_by: 'creation desc',
    })
    return response.data || []
  },

  updateInteraction: async (name: string, data: Partial<Interaction>): Promise<Interaction> =>
    frappeClient.put<Interaction>(`resource/Interaction Log/${name}`, data),

  deleteInteraction: async (name: string): Promise<void> =>
    frappeClient.delete(`resource/Interaction Log/${name}`),
}

const followUpApiReal = {
  createTask: async (data: {
    leadId: string
    interactionId?: string
    title: string
    description: string
    type: string
    scheduledAt: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    owner: string
  }): Promise<FollowUpTask> =>
    frappeClient.post<FollowUpTask>('resource/Follow-up Task', {
      ...data,
      doctype: 'Follow-up Task',
    }),

  getTasks: async (leadId: string): Promise<FollowUpTask[]> => {
    const response = await frappeClient.get<{ data: FollowUpTask[] }>('resource/Follow-up Task', {
      filters: JSON.stringify({ lead: leadId }),
      order_by: 'scheduled_at asc',
    })
    return response.data || []
  },

  getMyTasks: async (): Promise<FollowUpTask[]> => {
    const response = await frappeClient.get<{ data: FollowUpTask[] }>('resource/Follow-up Task', {
      filters: JSON.stringify({
        owner: 'session.user',
        status: ['in', ['pending', 'overdue']],
      }),
      order_by: 'scheduled_at asc',
    })
    return response.data || []
  },

  completeTask: async (name: string): Promise<FollowUpTask> =>
    frappeClient.post<FollowUpTask>('method/complete_follow_up_task', {
      task_name: name,
    }),

  cancelTask: async (name: string, reason: string): Promise<FollowUpTask> =>
    frappeClient.put<FollowUpTask>(`resource/Follow-up Task/${name}`, {
      status: 'cancelled',
      notes: reason,
    }),

  snoozeTask: async (name: string, newDate: string): Promise<FollowUpTask> =>
    frappeClient.post<FollowUpTask>('method/snooze_follow_up_task', {
      task_name: name,
      new_scheduled_at: newDate,
    }),
}

const timelineApiReal = {
  getTimeline: async (leadId: string): Promise<TimelineEvent[]> => {
    const response = await frappeClient.get<{ data: TimelineEvent[] }>('resource/Activity Timeline', {
      filters: JSON.stringify({ lead: leadId }),
      order_by: 'timestamp desc',
    })
    return response.data || []
  },

  addNote: async (leadId: string, note: string): Promise<TimelineEvent> =>
    frappeClient.post<TimelineEvent>('method/add_lead_note', {
      lead_name: leadId,
      note,
    }),
}

const metricsApiReal = {
  getMetrics: async (leadId: string): Promise<LeadMetrics> =>
    frappeClient.get<LeadMetrics>(`resource/Lead Metrics/${leadId}`),

  getDashboardMetrics: async (params?: {
    from?: string
    to?: string
    assignedTo?: string
  }): Promise<{
    totalLeads: number
    newToday: number
    qualifiedThisWeek: number
    convertedThisMonth: number
    avgResponseTime: number
    connectRate: number
  }> => frappeClient.get('method/get_lead_dashboard_metrics', params),
}

const bulkApiReal = {
  bulkAssign: async (leadIds: string[], assignedTo: string): Promise<void> =>
    frappeClient.post('method/bulk_assign_leads', {
      leads: leadIds,
      user: assignedTo,
    }),

  bulkUpdateStage: async (leadIds: string[], stage: LeadStage): Promise<void> =>
    frappeClient.post('method/bulk_update_lead_stage', {
      leads: leadIds,
      stage,
    }),

  exportLeads: async (filters?: Record<string, unknown>): Promise<Blob> => {
    const response = await fetch(`${frappeClient.getUrl('method/export_leads')}`, {
      method: 'POST',
      headers: frappeClient.getHeaders(),
      body: JSON.stringify({ filters }),
    })
    return response.blob()
  },
}

export const leadApi = isMockMode ? leadApiMock : leadApiReal
export const interactionApi = isMockMode ? interactionApiMock : interactionApiReal
export const followUpApi = isMockMode ? followUpApiMock : followUpApiReal
export const timelineApi = isMockMode ? timelineApiMock : timelineApiReal
export const metricsApi = isMockMode ? metricsApiMock : metricsApiReal
export const bulkApi = isMockMode ? bulkApiMock : bulkApiReal
