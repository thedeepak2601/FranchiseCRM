/**
 * Lead Management Hooks
 * React Query hooks for lead lifecycle management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  leadApi, 
  interactionApi, 
  followUpApi, 
  timelineApi, 
  metricsApi,
  bulkApi,
} from '@/lib/lead-api'
import type {
  Lead,
  CreateLeadRequest,
  CreateInteractionRequest,
  LeadStage,
  Interaction,
  FollowUpTask,
} from '@/types/lead'

// ============================================================
// LEAD HOOKS
// ============================================================

export function useLeads(filters?: {
  stage?: LeadStage
  status?: string
  assignedTo?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadApi.getLeads(filters),
  })
}

export function useLead(name: string) {
  return useQuery({
    queryKey: ['lead', name],
    queryFn: () => leadApi.getLead(name),
    enabled: !!name,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: Partial<Lead> }) => 
      leadApi.updateLead(name, data),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', name] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useAssignLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ name, assignedTo }: { name: string; assignedTo: string }) =>
      leadApi.assignLead(name, assignedTo),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', name] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLeadStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { leadId: string; newStage: LeadStage; reason?: string; notes?: string }) =>
      leadApi.updateStage(data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useQualifyLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      name: string
      qualification: {
        budgetRange: string
        timelineToInvest: string
        isDecisionMaker: boolean
        businessExperience: string
      }
    }) => leadApi.qualifyLead(data.name, data.qualification),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', name] })
    },
  })
}

export function useConvertLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      name: string
      expectedInvestment: number
      territory: string
      brand?: string
    }) => leadApi.convertToOpportunity(data.name, data),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', name] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useDisqualifyLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string; reason: string; notes?: string }) =>
      leadApi.disqualifyLead(data.name, data.reason, data.notes),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['lead', name] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

// ============================================================
// INTERACTION HOOKS
// ============================================================

export function useInteractions(leadId: string) {
  return useQuery({
    queryKey: ['interactions', leadId],
    queryFn: () => interactionApi.getInteractions(leadId),
    enabled: !!leadId,
  })
}

export function useCreateInteraction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateInteractionRequest) => interactionApi.createInteraction(data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', leadId] })
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      queryClient.invalidateQueries({ queryKey: ['timeline', leadId] })
    },
  })
}

export function useUpdateInteraction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: Partial<Interaction> }) =>
      interactionApi.updateInteraction(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
    },
  })
}

// ============================================================
// FOLLOW-UP TASK HOOKS
// ============================================================

export function useFollowUpTasks(leadId: string) {
  return useQuery({
    queryKey: ['followUpTasks', leadId],
    queryFn: () => followUpApi.getTasks(leadId),
    enabled: !!leadId,
  })
}

export function useMyTasks() {
  return useQuery({
    queryKey: ['myTasks'],
    queryFn: () => followUpApi.getMyTasks(),
  })
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      leadId: string
      interactionId?: string
      title: string
      description: string
      type: string
      scheduledAt: string
      priority: 'low' | 'medium' | 'high' | 'urgent'
      owner: string
    }) => followUpApi.createTask(data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['followUpTasks', leadId] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (name: string) => followUpApi.completeTask(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUpTasks'] })
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
    },
  })
}

export function useSnoozeTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ name, newDate }: { name: string; newDate: string }) =>
      followUpApi.snoozeTask(name, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] })
    },
  })
}

// ============================================================
// TIMELINE HOOKS
// ============================================================

export function useTimeline(leadId: string) {
  return useQuery({
    queryKey: ['timeline', leadId],
    queryFn: () => timelineApi.getTimeline(leadId),
    enabled: !!leadId,
  })
}

export function useAddNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ leadId, note }: { leadId: string; note: string }) =>
      timelineApi.addNote(leadId, note),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['timeline', leadId] })
    },
  })
}

// ============================================================
// METRICS HOOKS
// ============================================================

export function useLeadMetrics(leadId: string) {
  return useQuery({
    queryKey: ['leadMetrics', leadId],
    queryFn: () => metricsApi.getMetrics(leadId),
    enabled: !!leadId,
  })
}

export function useDashboardMetrics(params?: {
  from?: string
  to?: string
  assignedTo?: string
}) {
  return useQuery({
    queryKey: ['dashboardMetrics', params],
    queryFn: () => metricsApi.getDashboardMetrics(params),
  })
}

// ============================================================
// BULK OPERATIONS
// ============================================================

export function useBulkAssign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ leadIds, assignedTo }: { leadIds: string[]; assignedTo: string }) =>
      bulkApi.bulkAssign(leadIds, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useBulkUpdateStage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ leadIds, stage }: { leadIds: string[]; stage: LeadStage }) =>
      bulkApi.bulkUpdateStage(leadIds, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

// Export bulk API
export { bulkApi } from '@/lib/lead-api'
