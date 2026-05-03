import type {
  CreateLeadRequest,
  CreateInteractionRequest,
  FollowUpTask,
  Interaction,
  Lead,
  LeadDetailResponse,
  LeadListResponse,
  LeadMetrics,
  LeadSource,
  TimelineEvent,
} from '@/types/lead'
import { STAGE_CONFIG } from '@/types/lead'

export const dashboardData = {
  brand: {
    name: 'Spice Route Hospitality',
    logo: 'SR',
  },
  stats: [
    { label: 'Total Revenue', value: '12.4Cr', change: '+12.5%', positive: true },
    { label: 'Active Franchises', value: '48', change: '+3', positive: true },
    { label: 'Pending Invoices', value: '12', change: '-5', positive: true },
    { label: 'New Enquiries', value: '28', change: '+8', positive: true },
  ],
  revenueData: [
    { month: 'Jul', revenue: 8.5, target: 9 },
    { month: 'Aug', revenue: 9.2, target: 9.5 },
    { month: 'Sep', revenue: 8.8, target: 10 },
    { month: 'Oct', revenue: 10.2, target: 10.5 },
    { month: 'Nov', revenue: 11.5, target: 11 },
    { month: 'Dec', revenue: 12.4, target: 12 },
    { month: 'Jan', revenue: 11.8, target: 12.5 },
    { month: 'Feb', revenue: 13.2, target: 13 },
    { month: 'Mar', revenue: 14.1, target: 13.5 },
  ],
  franchisePerformance: [
    { name: 'Delhi NCR', revenue: 3.2, growth: 15, franchises: 12, status: 'excellent' },
    { name: 'Mumbai', revenue: 2.8, growth: 12, franchises: 8, status: 'excellent' },
    { name: 'Bangalore', revenue: 2.1, growth: 8, franchises: 6, status: 'good' },
    { name: 'Chennai', revenue: 1.9, growth: 5, franchises: 5, status: 'good' },
    { name: 'Hyderabad', revenue: 1.4, growth: 18, franchises: 4, status: 'excellent' },
    { name: 'Kolkata', revenue: 1.1, growth: -2, franchises: 3, status: 'average' },
  ],
  recentTransactions: [
    { id: 'TXN001', franchise: 'Spice Route - Connaught Place', amount: 45000, status: 'completed', date: '2026-04-28' },
    { id: 'TXN002', franchise: 'Spice Route - Marine Drive', amount: 32000, status: 'pending', date: '2026-04-28' },
    { id: 'TXN003', franchise: 'Spice Route - Indiranagar', amount: 28000, status: 'completed', date: '2026-04-27' },
    { id: 'TXN004', franchise: 'Spice Route - Bandra', amount: 51000, status: 'completed', date: '2026-04-27' },
    { id: 'TXN005', franchise: 'Spice Route - Jubilee Hills', amount: 38000, status: 'failed', date: '2026-04-26' },
  ],
  topFranchisees: [
    { name: 'Rajesh Kumar', location: 'Delhi NCR', revenue: 45.2, growth: 18, avatar: 'RK' },
    { name: 'Priya Sharma', location: 'Mumbai', revenue: 38.5, growth: 12, avatar: 'PS' },
    { name: 'Amit Patel', location: 'Bangalore', revenue: 32.1, growth: 15, avatar: 'AP' },
    { name: 'Sneha Reddy', location: 'Hyderabad', revenue: 28.8, growth: 22, avatar: 'SR' },
  ],
  alerts: [
    { type: 'warning', message: '3 franchises pending renewal approval' },
    { type: 'info', message: 'New brand partnership inquiry from Pune' },
    { type: 'success', message: 'Monthly target achieved for Delhi region' },
  ],
}

export const franchiseData = [
  { id: 'FR-001', name: 'Spice Route - Connaught Place', owner: 'Rajesh Kumar', location: 'Delhi NCR', revenue: 45.2, growth: 18, status: 'active', since: '2024-01' },
  { id: 'FR-002', name: 'Spice Route - Marine Drive', owner: 'Priya Sharma', location: 'Mumbai', revenue: 38.5, growth: 12, status: 'active', since: '2024-03' },
  { id: 'FR-003', name: 'Spice Route - Indiranagar', owner: 'Amit Patel', location: 'Bangalore', revenue: 32.1, growth: 15, status: 'active', since: '2024-02' },
  { id: 'FR-004', name: 'Spice Route - Jubilee Hills', owner: 'Sneha Reddy', location: 'Hyderabad', revenue: 28.8, growth: 22, status: 'active', since: '2024-04' },
  { id: 'FR-005', name: 'Spice Route - Salt Lake', owner: 'Vikram Singh', location: 'Kolkata', revenue: 24.5, growth: 8, status: 'pending', since: '2025-01' },
  { id: 'FR-006', name: 'Spice Route - T Nagar', owner: 'Karthik R', location: 'Chennai', revenue: 22.1, growth: 5, status: 'active', since: '2024-05' },
]

export const brandsData = [
  { id: 'BR-001', name: 'Spice Route', category: 'Restaurant', franchises: 24, revenue: 8.2, growth: 15, color: '#8B7CF6', status: 'active' },
  { id: 'BR-002', name: 'Cafe Culture', category: 'Cafe', franchises: 12, revenue: 2.4, growth: 22, color: '#10B981', status: 'active' },
  { id: 'BR-003', name: 'Quick Bites', category: 'Fast Food', franchises: 8, revenue: 1.2, growth: 8, color: '#F59E0B', status: 'active' },
  { id: 'BR-004', name: 'Sweet Tooth', category: 'Bakery', franchises: 4, revenue: 0.6, growth: 12, color: '#06B6D4', status: 'pending' },
]

export const locationsData = [
  { id: 'LOC-001', name: 'Delhi NCR', region: 'North', franchises: 12, revenue: 3.2, occupancy: 95, status: 'active' },
  { id: 'LOC-002', name: 'Mumbai', region: 'West', franchises: 8, revenue: 2.8, occupancy: 88, status: 'active' },
  { id: 'LOC-003', name: 'Bangalore', region: 'South', franchises: 6, revenue: 2.1, occupancy: 92, status: 'active' },
  { id: 'LOC-004', name: 'Chennai', region: 'South', franchises: 5, revenue: 1.9, occupancy: 85, status: 'active' },
  { id: 'LOC-005', name: 'Hyderabad', region: 'South', franchises: 4, revenue: 1.4, occupancy: 90, status: 'active' },
  { id: 'LOC-006', name: 'Kolkata', region: 'East', franchises: 3, revenue: 1.1, occupancy: 78, status: 'average' },
  { id: 'LOC-007', name: 'Pune', region: 'West', franchises: 2, revenue: 0.8, occupancy: 82, status: 'active' },
  { id: 'LOC-008', name: 'Ahmedabad', region: 'West', franchises: 2, revenue: 0.6, occupancy: 75, status: 'pending' },
]

export const financeData = {
  stats: [
    { label: 'Total Revenue', value: '12.4Cr', change: '+12.5%', positive: true },
    { label: 'Pending Payments', value: '2.1Cr', change: '-8%', positive: true },
    { label: 'Outstanding', value: '45L', change: '+5%', positive: false },
    { label: 'This Month', value: '1.8Cr', change: '+15%', positive: true },
  ],
  transactions: [
    { id: 'TXN-001', franchise: 'Spice Route - Connaught Place', amount: 45000, type: 'credit', status: 'completed', date: '2026-04-28', mode: 'UPI' },
    { id: 'TXN-002', franchise: 'Spice Route - Marine Drive', amount: 32000, type: 'credit', status: 'pending', date: '2026-04-28', mode: 'Bank Transfer' },
    { id: 'TXN-003', franchise: 'Spice Route - Indiranagar', amount: 28000, type: 'credit', status: 'completed', date: '2026-04-27', mode: 'UPI' },
    { id: 'TXN-004', franchise: 'Spice Route - Bandra', amount: 51000, type: 'credit', status: 'completed', date: '2026-04-27', mode: 'NEFT' },
    { id: 'TXN-005', franchise: 'Spice Route - Jubilee Hills', amount: 38000, type: 'debit', status: 'completed', date: '2026-04-26', mode: 'RTGS' },
    { id: 'TXN-006', franchise: 'Spice Route - Salt Lake', amount: 15000, type: 'credit', status: 'failed', date: '2026-04-26', mode: 'UPI' },
  ],
  invoices: [
    { id: 'INV-2026-001', franchise: 'Spice Route - Connaught Place', amount: 45000, status: 'paid', dueDate: '2026-04-15', paidDate: '2026-04-14' },
    { id: 'INV-2026-002', franchise: 'Spice Route - Marine Drive', amount: 32000, status: 'pending', dueDate: '2026-04-20', paidDate: null },
    { id: 'INV-2026-003', franchise: 'Spice Route - Indiranagar', amount: 28000, status: 'overdue', dueDate: '2026-04-10', paidDate: null },
    { id: 'INV-2026-004', franchise: 'Spice Route - Bandra', amount: 51000, status: 'paid', dueDate: '2026-04-18', paidDate: '2026-04-17' },
  ],
}

export const settingsData = {
  integrations: [
    { name: 'WhatsApp', provider: 'Interakt', status: 'connected' },
    { name: 'Payments', provider: 'Razorpay', status: 'connected' },
    { name: 'E-Invoicing', provider: 'IRP', status: 'connected' },
    { name: 'E-Stamp', provider: 'SignDesk', status: 'pending' },
  ],
}

let leads: Lead[] = [
  {
    id: 'LEAD-001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    source: 'website',
    capturedAt: '2026-04-20T09:30:00.000Z',
    capturedBy: 'Marketing',
    assignedTo: 'Sales Team',
    assignedAt: '2026-04-20T10:00:00.000Z',
    assignedBy: 'System',
    investment: 25,
    location: 'Delhi NCR',
    preferredLocations: ['Delhi NCR', 'Noida'],
    budgetRange: '20L-30L',
    businessExperience: '2 years in restaurant operations',
    timelineToInvest: '3_months',
    isDecisionMaker: true,
    stage: 'pipeline',
    status: 'qualified',
    score: 85,
    owner: 'Sales Team',
    created: '2026-04-20T09:30:00.000Z',
    updated: '2026-04-28T12:00:00.000Z',
    lastActivity: '2026-04-28T12:00:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-001',
  },
  {
    id: 'LEAD-002',
    name: 'Priya Sharma',
    phone: '+91 98765 43211',
    email: 'priya.s@email.com',
    source: 'referral',
    capturedAt: '2026-04-18T11:00:00.000Z',
    capturedBy: 'Partner Referral',
    assignedTo: 'Sales Team',
    assignedAt: '2026-04-18T12:00:00.000Z',
    assignedBy: 'System',
    investment: 30,
    location: 'Mumbai',
    preferredLocations: ['Mumbai'],
    budgetRange: '25L-35L',
    timelineToInvest: '1_month',
    isDecisionMaker: true,
    stage: 'approvals',
    status: 'pending',
    score: 72,
    owner: 'Sales Team',
    created: '2026-04-18T11:00:00.000Z',
    updated: '2026-04-27T16:45:00.000Z',
    lastActivity: '2026-04-27T16:45:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-002',
  },
  {
    id: 'LEAD-003',
    name: 'Amit Patel',
    phone: '+91 98765 43212',
    email: 'amit.patel@email.com',
    source: 'ads',
    capturedAt: '2026-04-25T08:00:00.000Z',
    capturedBy: 'Performance Marketing',
    assignedTo: 'Neha Verma',
    assignedAt: '2026-04-25T08:12:00.000Z',
    assignedBy: 'System',
    investment: 20,
    location: 'Bangalore',
    preferredLocations: ['Indiranagar', 'Whitefield'],
    budgetRange: '18L-24L',
    businessExperience: 'Family-run bakery operations',
    timelineToInvest: '6_months',
    isDecisionMaker: false,
    stage: 'qualification',
    status: 'in_progress',
    score: 58,
    owner: 'Neha Verma',
    created: '2026-04-25T08:00:00.000Z',
    updated: '2026-04-26T15:00:00.000Z',
    lastActivity: '2026-04-26T15:00:00.000Z',
    brandId: 'BR-003',
  },
  {
    id: 'LEAD-004',
    name: 'Sneha Reddy',
    phone: '+91 98765 43213',
    email: 'sneha.reddy@email.com',
    source: 'whatsapp',
    capturedAt: '2026-04-28T10:00:00.000Z',
    capturedBy: 'WhatsApp Bot',
    assignedTo: 'Lead Desk',
    assignedAt: '2026-04-28T10:05:00.000Z',
    assignedBy: 'System',
    investment: 35,
    location: 'Hyderabad',
    state: 'Telangana',
    preferredLocations: ['Jubilee Hills', 'Gachibowli'],
    investmentRange: '30L-40L',
    stage: 'lead_capture',
    status: 'new',
    score: 45,
    owner: 'Lead Desk',
    created: '2026-04-28T10:00:00.000Z',
    updated: '2026-04-28T10:00:00.000Z',
    lastActivity: '2026-04-28T10:00:00.000Z',
    brandId: 'BR-002',
  },
  {
    id: 'LEAD-005',
    name: 'Vikram Singh',
    phone: '+91 98765 43214',
    email: 'vikram.s@email.com',
    source: 'portal',
    capturedAt: '2026-04-10T09:00:00.000Z',
    capturedBy: 'Portal',
    assignedTo: 'Ankit Legal',
    assignedAt: '2026-04-10T09:15:00.000Z',
    assignedBy: 'System',
    investment: 28,
    location: 'Kolkata',
    state: 'West Bengal',
    preferredLocations: ['Salt Lake', 'Park Street'],
    budgetRange: '25L-30L',
    businessExperience: 'Owned two QSR counters',
    timelineToInvest: '1_month',
    isDecisionMaker: true,
    stage: 'agreement',
    status: 'approved',
    score: 92,
    owner: 'Legal',
    created: '2026-04-10T09:00:00.000Z',
    updated: '2026-04-28T09:15:00.000Z',
    lastActivity: '2026-04-28T09:15:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-005',
  },
  {
    id: 'LEAD-006',
    name: 'Nisha Menon',
    phone: '+91 98765 43215',
    email: 'nisha.menon@email.com',
    source: 'google',
    capturedAt: '2026-04-29T07:45:00.000Z',
    capturedBy: 'Google Ads',
    assignedTo: 'Karan Malhotra',
    assignedAt: '2026-04-29T07:58:00.000Z',
    assignedBy: 'System',
    investment: 18,
    location: 'Chennai',
    state: 'Tamil Nadu',
    preferredLocations: ['T Nagar', 'Anna Nagar'],
    investmentRange: '15L-20L',
    stage: 'first_contact',
    status: 'in_progress',
    score: 42,
    owner: 'Karan Malhotra',
    created: '2026-04-29T07:45:00.000Z',
    updated: '2026-04-29T08:20:00.000Z',
    lastActivity: '2026-04-29T08:20:00.000Z',
    brandId: 'BR-004',
  },
  {
    id: 'LEAD-007',
    name: 'Farhan Ali',
    phone: '+91 98765 43216',
    email: 'farhan.ali@email.com',
    source: 'referral',
    capturedAt: '2026-04-05T10:25:00.000Z',
    capturedBy: 'Existing Franchisee',
    assignedTo: 'Operations Team',
    assignedAt: '2026-04-05T10:45:00.000Z',
    assignedBy: 'System',
    investment: 42,
    location: 'Pune',
    state: 'Maharashtra',
    preferredLocations: ['Koregaon Park', 'Kalyani Nagar'],
    budgetRange: '40L-45L',
    businessExperience: 'Cloud kitchen operator',
    timelineToInvest: 'immediate',
    isDecisionMaker: true,
    stage: 'onboarding',
    status: 'active',
    score: 96,
    owner: 'Operations Team',
    created: '2026-04-05T10:25:00.000Z',
    updated: '2026-04-28T18:10:00.000Z',
    lastActivity: '2026-04-28T18:10:00.000Z',
    brandId: 'BR-002',
    opportunityId: 'OPP-007',
  },
  {
    id: 'LEAD-008',
    name: 'Meera Iyer',
    phone: '+91 98765 43217',
    email: 'meera.iyer@email.com',
    source: 'website',
    capturedAt: '2026-03-18T09:40:00.000Z',
    capturedBy: 'Website',
    assignedTo: 'Ops Success',
    assignedAt: '2026-03-18T10:00:00.000Z',
    assignedBy: 'System',
    investment: 52,
    location: 'Ahmedabad',
    state: 'Gujarat',
    preferredLocations: ['Prahlad Nagar', 'Satellite'],
    budgetRange: '50L-55L',
    businessExperience: 'Retail investor and landlord',
    timelineToInvest: 'immediate',
    isDecisionMaker: true,
    stage: 'post_sale',
    status: 'converted',
    score: 98,
    owner: 'Ops Success',
    created: '2026-03-18T09:40:00.000Z',
    updated: '2026-04-26T13:15:00.000Z',
    lastActivity: '2026-04-26T13:15:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-008',
  },
  {
    id: 'LEAD-009',
    name: 'Arjun Batra',
    phone: '+91 98765 43218',
    email: 'arjun.batra@email.com',
    source: 'facebook',
    capturedAt: '2026-04-21T13:15:00.000Z',
    capturedBy: 'Meta Lead Form',
    assignedTo: 'Neha Verma',
    assignedAt: '2026-04-21T13:25:00.000Z',
    assignedBy: 'System',
    investment: 32,
    location: 'Gurgaon',
    state: 'Haryana',
    preferredLocations: ['Golf Course Road', 'Sohna Road'],
    budgetRange: '30L-35L',
    businessExperience: 'Commercial real estate broker',
    timelineToInvest: '2_months',
    isDecisionMaker: true,
    stage: 'pipeline',
    status: 'qualified',
    score: 81,
    owner: 'Neha Verma',
    created: '2026-04-21T13:15:00.000Z',
    updated: '2026-04-29T09:25:00.000Z',
    lastActivity: '2026-04-29T09:25:00.000Z',
    brandId: 'BR-003',
    opportunityId: 'OPP-009',
  },
  {
    id: 'LEAD-010',
    name: 'Isha Kapoor',
    phone: '+91 98765 43219',
    email: 'isha.kapoor@email.com',
    source: 'instagram',
    capturedAt: '2026-04-29T12:10:00.000Z',
    capturedBy: 'Instagram DM',
    assignedTo: 'Lead Desk',
    assignedAt: '2026-04-29T12:16:00.000Z',
    assignedBy: 'System',
    investment: 16,
    location: 'Jaipur',
    state: 'Rajasthan',
    investmentRange: '15L-18L',
    stage: 'lead_capture',
    status: 'new',
    score: 36,
    owner: 'Lead Desk',
    created: '2026-04-29T12:10:00.000Z',
    updated: '2026-04-29T12:10:00.000Z',
    lastActivity: '2026-04-29T12:10:00.000Z',
    brandId: 'BR-004',
  },
  {
    id: 'LEAD-011',
    name: 'Rohan Desai',
    phone: '+91 98765 43220',
    email: 'rohan.desai@email.com',
    source: 'whatsapp',
    capturedAt: '2026-04-28T16:20:00.000Z',
    capturedBy: 'WhatsApp Bot',
    assignedTo: 'Karan Malhotra',
    assignedAt: '2026-04-28T16:30:00.000Z',
    assignedBy: 'System',
    investment: 24,
    location: 'Surat',
    state: 'Gujarat',
    preferredLocations: ['Vesu', 'Adajan'],
    investmentRange: '20L-25L',
    stage: 'first_contact',
    status: 'in_progress',
    score: 49,
    owner: 'Karan Malhotra',
    created: '2026-04-28T16:20:00.000Z',
    updated: '2026-04-29T09:05:00.000Z',
    lastActivity: '2026-04-29T09:05:00.000Z',
    brandId: 'BR-002',
  },
  {
    id: 'LEAD-012',
    name: 'Kavya Nair',
    phone: '+91 98765 43221',
    email: 'kavya.nair@email.com',
    source: 'portal',
    capturedAt: '2026-04-22T11:45:00.000Z',
    capturedBy: 'Franchise Portal',
    assignedTo: 'Neha Verma',
    assignedAt: '2026-04-22T12:00:00.000Z',
    assignedBy: 'System',
    investment: 38,
    location: 'Kochi',
    state: 'Kerala',
    preferredLocations: ['Edappally', 'Kakkanad'],
    budgetRange: '35L-40L',
    businessExperience: 'Cafe manager for 5 years',
    timelineToInvest: '3_months',
    isDecisionMaker: true,
    stage: 'qualification',
    status: 'qualified',
    score: 74,
    owner: 'Neha Verma',
    created: '2026-04-22T11:45:00.000Z',
    updated: '2026-04-28T15:35:00.000Z',
    lastActivity: '2026-04-28T15:35:00.000Z',
    brandId: 'BR-002',
  },
  {
    id: 'LEAD-013',
    name: 'Devika Rao',
    phone: '+91 98765 43222',
    email: 'devika.rao@email.com',
    source: 'ads',
    capturedAt: '2026-04-14T08:55:00.000Z',
    capturedBy: 'Performance Marketing',
    assignedTo: 'Management Desk',
    assignedAt: '2026-04-14T09:20:00.000Z',
    assignedBy: 'System',
    investment: 46,
    location: 'Mysore',
    state: 'Karnataka',
    preferredLocations: ['VV Mohalla', 'Jayalakshmipuram'],
    budgetRange: '45L-50L',
    businessExperience: 'Runs packaged foods distribution',
    timelineToInvest: '1_month',
    isDecisionMaker: true,
    stage: 'approvals',
    status: 'pending',
    score: 88,
    owner: 'Management Desk',
    created: '2026-04-14T08:55:00.000Z',
    updated: '2026-04-29T10:40:00.000Z',
    lastActivity: '2026-04-29T10:40:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-013',
  },
  {
    id: 'LEAD-014',
    name: 'Suresh Nanda',
    phone: '+91 98765 43223',
    email: 'suresh.nanda@email.com',
    source: 'referral',
    capturedAt: '2026-04-06T14:15:00.000Z',
    capturedBy: 'CA Referral',
    assignedTo: 'Ankit Legal',
    assignedAt: '2026-04-06T14:45:00.000Z',
    assignedBy: 'System',
    investment: 60,
    location: 'Bhubaneswar',
    state: 'Odisha',
    preferredLocations: ['Patia', 'Saheed Nagar'],
    budgetRange: '55L-65L',
    businessExperience: 'Hospitality investor',
    timelineToInvest: 'immediate',
    isDecisionMaker: true,
    stage: 'agreement',
    status: 'approved',
    score: 90,
    owner: 'Ankit Legal',
    created: '2026-04-06T14:15:00.000Z',
    updated: '2026-04-29T11:10:00.000Z',
    lastActivity: '2026-04-29T11:10:00.000Z',
    brandId: 'BR-001',
    opportunityId: 'OPP-014',
  },
  {
    id: 'LEAD-015',
    name: 'Ananya Choudhury',
    phone: '+91 98765 43224',
    email: 'ananya.c@email.com',
    source: 'website',
    capturedAt: '2026-03-29T10:10:00.000Z',
    capturedBy: 'Website',
    assignedTo: 'Operations Team',
    assignedAt: '2026-03-29T10:20:00.000Z',
    assignedBy: 'System',
    investment: 34,
    location: 'Guwahati',
    state: 'Assam',
    preferredLocations: ['GS Road', 'Six Mile'],
    budgetRange: '30L-35L',
    businessExperience: 'Boutique owner',
    timelineToInvest: 'immediate',
    isDecisionMaker: true,
    stage: 'onboarding',
    status: 'active',
    score: 94,
    owner: 'Operations Team',
    created: '2026-03-29T10:10:00.000Z',
    updated: '2026-04-29T08:30:00.000Z',
    lastActivity: '2026-04-29T08:30:00.000Z',
    brandId: 'BR-004',
    opportunityId: 'OPP-015',
  },
  {
    id: 'LEAD-016',
    name: 'Harpreet Gill',
    phone: '+91 98765 43225',
    email: 'harpreet.gill@email.com',
    source: 'other',
    capturedAt: '2026-03-12T15:40:00.000Z',
    capturedBy: 'Trade Expo',
    assignedTo: 'Ops Success',
    assignedAt: '2026-03-12T16:00:00.000Z',
    assignedBy: 'System',
    investment: 48,
    location: 'Chandigarh',
    state: 'Punjab',
    preferredLocations: ['Sector 17', 'Mohali'],
    budgetRange: '45L-50L',
    businessExperience: 'Multi-brand distributor',
    timelineToInvest: 'immediate',
    isDecisionMaker: true,
    stage: 'post_sale',
    status: 'converted',
    score: 97,
    owner: 'Ops Success',
    created: '2026-03-12T15:40:00.000Z',
    updated: '2026-04-28T17:45:00.000Z',
    lastActivity: '2026-04-28T17:45:00.000Z',
    brandId: 'BR-003',
    opportunityId: 'OPP-016',
  },
  {
    id: 'LEAD-017',
    name: 'Manish Agarwal',
    phone: '+91 98765 43226',
    email: 'manish.agarwal@email.com',
    source: 'google',
    capturedAt: '2026-04-19T09:05:00.000Z',
    capturedBy: 'Google Ads',
    assignedTo: 'Karan Malhotra',
    assignedAt: '2026-04-19T09:20:00.000Z',
    assignedBy: 'System',
    investment: 14,
    location: 'Lucknow',
    state: 'Uttar Pradesh',
    investmentRange: '12L-15L',
    budgetRange: '12L-15L',
    businessExperience: 'New investor',
    timelineToInvest: '9_months',
    isDecisionMaker: true,
    stage: 'qualification',
    status: 'nurture',
    score: 39,
    owner: 'Karan Malhotra',
    created: '2026-04-19T09:05:00.000Z',
    updated: '2026-04-27T11:20:00.000Z',
    lastActivity: '2026-04-27T11:20:00.000Z',
    brandId: 'BR-004',
  },
  {
    id: 'LEAD-018',
    name: 'Pooja Kulkarni',
    phone: '+91 98765 43227',
    email: 'pooja.kulkarni@email.com',
    source: 'facebook',
    capturedAt: '2026-04-17T18:30:00.000Z',
    capturedBy: 'Meta Lead Form',
    assignedTo: 'Neha Verma',
    assignedAt: '2026-04-17T18:40:00.000Z',
    assignedBy: 'System',
    investment: 10,
    location: 'Nagpur',
    state: 'Maharashtra',
    investmentRange: '8L-10L',
    budgetRange: '8L-10L',
    businessExperience: 'First-time entrepreneur',
    timelineToInvest: '12_months',
    isDecisionMaker: false,
    stage: 'qualification',
    status: 'disqualified',
    score: 22,
    owner: 'Neha Verma',
    created: '2026-04-17T18:30:00.000Z',
    updated: '2026-04-23T16:05:00.000Z',
    lastActivity: '2026-04-23T16:05:00.000Z',
    brandId: 'BR-004',
  },
]

let interactions: Interaction[] = [
  {
    id: 'INT-001',
    leadId: 'LEAD-001',
    salesRep: 'Sales Team',
    timestamp: '2026-04-28T10:30:00.000Z',
    channel: 'call',
    attemptType: 'outbound',
    outcome: 'connected',
    notes: 'Discovery call completed and budget confirmed.',
    duration: 18,
    nextAction: 'schedule_meeting',
    nextActionNotes: 'Schedule site visit next week.',
  },
  {
    id: 'INT-002',
    leadId: 'LEAD-001',
    salesRep: 'Sales Team',
    timestamp: '2026-04-28T14:00:00.000Z',
    channel: 'meeting',
    attemptType: 'outbound',
    outcome: 'connected',
    notes: 'Meeting scheduled for location walkthrough.',
    duration: 30,
  },
  {
    id: 'INT-003',
    leadId: 'LEAD-002',
    salesRep: 'Sales Team',
    timestamp: '2026-04-26T11:30:00.000Z',
    channel: 'email',
    attemptType: 'outbound',
    outcome: 'connected',
    notes: 'Sent approval checklist and projected unit economics.',
  },
  {
    id: 'INT-004',
    leadId: 'LEAD-003',
    salesRep: 'Sales Team',
    timestamp: '2026-04-26T15:00:00.000Z',
    channel: 'call',
    attemptType: 'outbound',
    outcome: 'scheduled_callback',
    notes: 'Requested callback after discussing with family.',
    nextAction: 'call_again',
    scheduledFollowUp: '2026-04-29T11:00',
  } as Interaction & { scheduledFollowUp?: string },
]

let followUpTasks: FollowUpTask[] = [
  {
    id: 'TASK-001',
    leadId: 'LEAD-001',
    title: 'Schedule site visit',
    description: 'Coordinate location walkthrough for shortlisted area.',
    type: 'schedule_meeting',
    scheduledAt: '2026-04-30T12:00:00.000Z',
    status: 'pending',
    priority: 'high',
    owner: 'Sales Team',
    createdBy: 'Sales Team',
    created: '2026-04-28T10:35:00.000Z',
    updated: '2026-04-28T10:35:00.000Z',
    interactionId: 'INT-001',
  },
  {
    id: 'TASK-002',
    leadId: 'LEAD-003',
    title: 'Callback prospect',
    description: 'Reconnect after family discussion.',
    type: 'call_again',
    scheduledAt: '2026-04-29T11:00:00.000Z',
    status: 'pending',
    priority: 'medium',
    owner: 'Sales Team',
    createdBy: 'Sales Team',
    created: '2026-04-26T15:05:00.000Z',
    updated: '2026-04-26T15:05:00.000Z',
    interactionId: 'INT-004',
  },
]

let timeline: TimelineEvent[] = [
  {
    id: 'EVT-001',
    leadId: 'LEAD-001',
    type: 'lead_created',
    timestamp: '2026-04-20T09:30:00.000Z',
    user: 'Marketing',
    description: 'Lead captured from website form.',
  },
  {
    id: 'EVT-002',
    leadId: 'LEAD-001',
    type: 'interaction_logged',
    timestamp: '2026-04-28T10:30:00.000Z',
    user: 'Sales Team',
    description: 'Discovery call completed and budget confirmed.',
    interactionId: 'INT-001',
  },
  {
    id: 'EVT-003',
    leadId: 'LEAD-001',
    type: 'follow_up_created',
    timestamp: '2026-04-28T10:35:00.000Z',
    user: 'Sales Team',
    description: 'Created task to schedule site visit.',
    taskId: 'TASK-001',
  },
  {
    id: 'EVT-004',
    leadId: 'LEAD-002',
    type: 'stage_changed',
    timestamp: '2026-04-27T16:45:00.000Z',
    user: 'Legal',
    description: 'Moved lead into approvals after document review.',
    previousValue: 'pipeline',
    newValue: 'approvals',
  },
  {
    id: 'EVT-005',
    leadId: 'LEAD-003',
    type: 'interaction_logged',
    timestamp: '2026-04-26T15:00:00.000Z',
    user: 'Sales Team',
    description: 'Callback requested by prospect.',
    interactionId: 'INT-004',
  },
]

let metrics: Record<string, LeadMetrics> = {
  'LEAD-001': {
    leadId: 'LEAD-001',
    totalAttempts: 2,
    totalConnects: 2,
    connectRate: 100,
    firstContactAt: '2026-04-28T10:30:00.000Z',
    lastContactAt: '2026-04-28T14:00:00.000Z',
    avgResponseTimeHours: 1,
    channelStats: {
      call: { attempts: 1, connects: 1, rate: 100 },
      whatsapp: { attempts: 0, connects: 0, rate: 0 },
      email: { attempts: 0, connects: 0, rate: 0 },
      sms: { attempts: 0, connects: 0, rate: 0 },
      meeting: { attempts: 1, connects: 1, rate: 100 },
      video_call: { attempts: 0, connects: 0, rate: 0 },
    },
    bestChannel: 'call',
    slaBreached: false,
  },
  'LEAD-002': {
    leadId: 'LEAD-002',
    totalAttempts: 1,
    totalConnects: 1,
    connectRate: 100,
    firstContactAt: '2026-04-26T11:30:00.000Z',
    lastContactAt: '2026-04-26T11:30:00.000Z',
    avgResponseTimeHours: 4,
    channelStats: {
      call: { attempts: 0, connects: 0, rate: 0 },
      whatsapp: { attempts: 0, connects: 0, rate: 0 },
      email: { attempts: 1, connects: 1, rate: 100 },
      sms: { attempts: 0, connects: 0, rate: 0 },
      meeting: { attempts: 0, connects: 0, rate: 0 },
      video_call: { attempts: 0, connects: 0, rate: 0 },
    },
    bestChannel: 'email',
    slaBreached: false,
  },
  'LEAD-003': {
    leadId: 'LEAD-003',
    totalAttempts: 1,
    totalConnects: 0,
    connectRate: 0,
    lastContactAt: '2026-04-26T15:00:00.000Z',
    avgResponseTimeHours: 12,
    channelStats: {
      call: { attempts: 1, connects: 0, rate: 0 },
      whatsapp: { attempts: 0, connects: 0, rate: 0 },
      email: { attempts: 0, connects: 0, rate: 0 },
      sms: { attempts: 0, connects: 0, rate: 0 },
      meeting: { attempts: 0, connects: 0, rate: 0 },
      video_call: { attempts: 0, connects: 0, rate: 0 },
    },
    slaBreached: false,
  },
}

const stageSequence: Lead['stage'][] = [
  'lead_capture',
  'first_contact',
  'qualification',
  'pipeline',
  'approvals',
  'agreement',
  'onboarding',
  'post_sale',
]

const stageActivityTemplates: Record<Lead['stage'], {
  title: string
  notes: string
  taskTitle: string
  taskDescription: string
}> = {
  lead_capture: {
    title: 'Lead captured and duplicate check completed',
    notes: 'Source, campaign, phone, and email reviewed before assigning the lead owner.',
    taskTitle: 'Start first outreach',
    taskDescription: 'Call within SLA and confirm basic franchise interest.',
  },
  first_contact: {
    title: 'First outreach sequence started',
    notes: 'Initial call and WhatsApp touchpoint logged with prospect response status.',
    taskTitle: 'Complete connection attempt',
    taskDescription: 'Confirm budget range and schedule qualification conversation.',
  },
  qualification: {
    title: 'Qualification data reviewed',
    notes: 'Budget, investment timeline, territory preference, and decision-maker status discussed.',
    taskTitle: 'Finish qualification gate',
    taskDescription: 'Validate investment readiness and decide nurture, disqualify, or convert.',
  },
  pipeline: {
    title: 'Franchise opportunity moved through sales pipeline',
    notes: 'NDA, pitch deck, discovery meeting, and territory evaluation are being tracked.',
    taskTitle: 'Collect pipeline artifacts',
    taskDescription: 'Attach signed NDA, meeting notes, and preferred territory proof.',
  },
  approvals: {
    title: 'Application routed for internal approvals',
    notes: 'Legal, finance, operations, and management checkpoints are in progress.',
    taskTitle: 'Close approval decision',
    taskDescription: 'Capture approval, rejection reason, or rework instruction.',
  },
  agreement: {
    title: 'Agreement and payment workflow active',
    notes: 'Agreement drafting, digital signing, invoice generation, and payment verification are tracked.',
    taskTitle: 'Verify agreement payment',
    taskDescription: 'Confirm signed agreement and finance-verified payment before onboarding.',
  },
  onboarding: {
    title: 'Onboarding project launched',
    notes: 'Training, setup checklist, vendor access, ERP access, and go-live readiness are in progress.',
    taskTitle: 'Review go-live readiness',
    taskDescription: 'Confirm training completion, system access, vendor setup, and launch approval.',
  },
  post_sale: {
    title: 'Post-sale account management started',
    notes: 'Royalty tracking, compliance review, support queue, renewal, and expansion cadence are active.',
    taskTitle: 'Schedule performance review',
    taskDescription: 'Review royalty trend, compliance health, support history, and expansion fit.',
  },
}

const addHours = (iso: string, hours: number) =>
  new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString()

function createEmptyChannelStats(): LeadMetrics['channelStats'] {
  return {
    call: { attempts: 0, connects: 0, rate: 0 },
    whatsapp: { attempts: 0, connects: 0, rate: 0 },
    email: { attempts: 0, connects: 0, rate: 0 },
    sms: { attempts: 0, connects: 0, rate: 0 },
    meeting: { attempts: 0, connects: 0, rate: 0 },
    video_call: { attempts: 0, connects: 0, rate: 0 },
  }
}

function ensureComprehensiveMockActivity() {
  let interactionCounter = interactions.length + 1
  let taskCounter = followUpTasks.length + 1
  let eventCounter = timeline.length + 1

  leads.forEach((lead) => {
    const owner = lead.assignedTo || lead.owner
    const stageIndex = stageSequence.indexOf(lead.stage)
    const template = stageActivityTemplates[lead.stage]
    const leadInteractions = interactions.filter((item) => item.leadId === lead.id)
    const leadTimeline = timeline.filter((item) => item.leadId === lead.id)

    if (!leadTimeline.some((event) => event.type === 'lead_created')) {
      timeline.push({
        id: `EVT-${String(eventCounter++).padStart(3, '0')}`,
        leadId: lead.id,
        type: 'lead_created',
        timestamp: lead.created,
        user: lead.capturedBy,
        description: `Lead captured from ${lead.source.replace('_', ' ')} for ${lead.location}.`,
      })
    }

    if (stageIndex > 0 && !leadTimeline.some((event) => event.type === 'stage_changed')) {
      const previousStage = stageSequence[Math.max(stageIndex - 1, 0)]
      timeline.push({
        id: `EVT-${String(eventCounter++).padStart(3, '0')}`,
        leadId: lead.id,
        type: 'stage_changed',
        timestamp: addHours(lead.created, 24 + stageIndex * 10),
        user: owner,
        description: template.title,
        previousValue: previousStage,
        newValue: lead.stage,
      })
    }

    if (leadInteractions.length < 2) {
      const requiredInteractions = Math.max(2 - leadInteractions.length, 0)
      const firstInteractionId = `INT-${String(interactionCounter++).padStart(3, '0')}`
      const firstInteraction: Interaction = {
        id: firstInteractionId,
        leadId: lead.id,
        salesRep: owner,
        timestamp: addHours(lead.created, 4),
        channel: lead.stage === 'post_sale' ? 'meeting' : 'call',
        attemptType: 'outbound',
        outcome: lead.status === 'disqualified' ? 'not_interested' : 'connected',
        notes: template.notes,
        duration: lead.stage === 'lead_capture' ? 7 : 22,
      }

      interactions.push(firstInteraction)
      timeline.push({
        id: `EVT-${String(eventCounter++).padStart(3, '0')}`,
        leadId: lead.id,
        type: 'interaction_logged',
        timestamp: firstInteraction.timestamp,
        user: owner,
        description: firstInteraction.notes,
        interactionId: firstInteraction.id,
      })

      if (requiredInteractions > 1) {
        const secondInteractionId = `INT-${String(interactionCounter++).padStart(3, '0')}`
        const secondInteraction: Interaction = {
          id: secondInteractionId,
          leadId: lead.id,
          salesRep: owner,
          timestamp: lead.lastActivity,
          channel: lead.stage === 'pipeline' || lead.stage === 'approvals' ? 'meeting' : 'whatsapp',
          attemptType: 'outbound',
          outcome: lead.status === 'nurture' ? 'scheduled_callback' : 'connected',
          notes: `${template.title}. Next checkpoint agreed with ${lead.name.split(' ')[0]}.`,
          duration: lead.stage === 'pipeline' || lead.stage === 'approvals' ? 35 : 12,
          nextAction: lead.stage === 'pipeline' ? 'schedule_meeting' : 'follow_up_email',
          nextActionNotes: template.taskDescription,
        }

        interactions.push(secondInteraction)
        timeline.push({
          id: `EVT-${String(eventCounter++).padStart(3, '0')}`,
          leadId: lead.id,
          type: 'interaction_logged',
          timestamp: secondInteraction.timestamp,
          user: owner,
          description: secondInteraction.notes,
          interactionId: secondInteraction.id,
        })
      }
    }

    if (!followUpTasks.some((task) => task.leadId === lead.id) && lead.status !== 'converted') {
      const task: FollowUpTask = {
        id: `TASK-${String(taskCounter++).padStart(3, '0')}`,
        leadId: lead.id,
        title: template.taskTitle,
        description: template.taskDescription,
        type: lead.stage === 'pipeline' || lead.stage === 'first_contact' ? 'schedule_meeting' : 'follow_up_email',
        scheduledAt: addHours(lead.lastActivity, lead.stage === 'lead_capture' ? 1 : 24),
        status: lead.status === 'disqualified' ? 'cancelled' : 'pending',
        priority: lead.score >= 80 ? 'urgent' : lead.score >= 60 ? 'high' : 'medium',
        owner,
        createdBy: owner,
        created: lead.lastActivity,
        updated: lead.lastActivity,
      }

      followUpTasks.push(task)
      timeline.push({
        id: `EVT-${String(eventCounter++).padStart(3, '0')}`,
        leadId: lead.id,
        type: 'follow_up_created',
        timestamp: task.created,
        user: owner,
        description: `Created task: ${task.title}`,
        taskId: task.id,
      })
    }

    const allLeadInteractions = interactions.filter((item) => item.leadId === lead.id)
    const channelStats = createEmptyChannelStats()
    allLeadInteractions.forEach((interaction) => {
      channelStats[interaction.channel].attempts += 1
      if (interaction.outcome === 'connected') {
        channelStats[interaction.channel].connects += 1
      }
    })

    Object.values(channelStats).forEach((stats) => {
      stats.rate = stats.attempts ? Math.round((stats.connects / stats.attempts) * 100) : 0
    })

    const totalAttempts = allLeadInteractions.length
    const totalConnects = allLeadInteractions.filter((interaction) => interaction.outcome === 'connected').length
    const bestChannel = Object.entries(channelStats)
      .filter(([, stats]) => stats.attempts > 0)
      .sort(([, a], [, b]) => b.connects - a.connects || b.rate - a.rate)[0]?.[0] as keyof LeadMetrics['channelStats'] | undefined

    metrics[lead.id] = {
      leadId: lead.id,
      totalAttempts,
      totalConnects,
      connectRate: totalAttempts ? Math.round((totalConnects / totalAttempts) * 100) : 0,
      firstContactAt: allLeadInteractions.sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]?.timestamp,
      lastContactAt: lead.lastActivity,
      avgResponseTimeHours: Math.max(1, Math.round((stageIndex + 1) * 1.5)),
      channelStats,
      bestChannel,
      slaBreached: lead.status === 'nurture' || lead.status === 'disqualified',
    }
  })
}

ensureComprehensiveMockActivity()

const delay = <T,>(value: T, time = 200) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), time))

export async function getMockLeads(params?: {
  stage?: Lead['stage']
  source?: LeadSource
  status?: string
  assignedTo?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<LeadListResponse> {
  let filtered = [...leads]

  if (params?.stage) {
    filtered = filtered.filter((lead) => lead.stage === params.stage)
  }
  if (params?.source) {
    filtered = filtered.filter((lead) => lead.source === params.source)
  }
  if (params?.status) {
    filtered = filtered.filter((lead) => lead.status === params.status)
  }
  if (params?.assignedTo) {
    filtered = filtered.filter((lead) => (lead.assignedTo || lead.owner) === params.assignedTo)
  }
  if (params?.search) {
    const term = params.search.toLowerCase()
    filtered = filtered.filter((lead) =>
      [lead.id, lead.name, lead.email, lead.phone, lead.location, lead.state, lead.source, lead.assignedTo, lead.owner].some((value) =>
        value?.toLowerCase().includes(term)
      )
    )
  }

  return delay({
    data: filtered,
    total: filtered.length,
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? filtered.length,
  })
}

export async function getMockLead(name: string): Promise<LeadDetailResponse> {
  const lead = leads.find((item) => item.id === name)
  if (!lead) {
    throw new Error(`Lead ${name} not found`)
  }

  return delay({
    lead,
    interactions: interactions.filter((item) => item.leadId === name).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    followUpTasks: followUpTasks.filter((item) => item.leadId === name).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    timeline: timeline.filter((item) => item.leadId === name).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    metrics: metrics[name] ?? {
      leadId: name,
      totalAttempts: 0,
      totalConnects: 0,
      connectRate: 0,
      lastContactAt: lead.lastActivity,
      avgResponseTimeHours: 0,
      channelStats: {
        call: { attempts: 0, connects: 0, rate: 0 },
        whatsapp: { attempts: 0, connects: 0, rate: 0 },
        email: { attempts: 0, connects: 0, rate: 0 },
        sms: { attempts: 0, connects: 0, rate: 0 },
        meeting: { attempts: 0, connects: 0, rate: 0 },
        video_call: { attempts: 0, connects: 0, rate: 0 },
      },
      slaBreached: false,
    },
  })
}

export async function updateMockLead(name: string, data: Partial<Lead>): Promise<Lead> {
  const lead = leads.find((item) => item.id === name)
  if (!lead) {
    throw new Error(`Lead ${name} not found`)
  }

  const now = new Date().toISOString()
  const previousStatus = lead.status
  const previousStage = lead.stage

  Object.assign(lead, {
    ...data,
    id: lead.id,
    updated: data.updated || now,
  })

  if (data.status && data.status !== previousStatus) {
    lead.lastActivity = now
    timeline = [
      {
        id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
        leadId: name,
        type: 'status_changed',
        timestamp: now,
        user: lead.assignedTo || lead.owner,
        description: `Lead status changed to ${data.status.replace('_', ' ')}.`,
        previousValue: previousStatus,
        newValue: data.status,
      },
      ...timeline,
    ]
  }

  if (data.stage && data.stage !== previousStage) {
    timeline = [
      {
        id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
        leadId: name,
        type: 'stage_changed',
        timestamp: now,
        user: lead.assignedTo || lead.owner,
        description: `Lead stage moved to ${STAGE_CONFIG[data.stage].name}.`,
        previousValue: STAGE_CONFIG[previousStage].name,
        newValue: STAGE_CONFIG[data.stage].name,
      },
      ...timeline,
    ]
  }

  if (metrics[name]) {
    metrics[name].slaBreached = lead.status === 'nurture' || lead.status === 'disqualified'
    metrics[name].lastContactAt = lead.lastActivity
  }

  return delay(lead)
}

export async function createMockInteraction(data: CreateInteractionRequest): Promise<Interaction> {
  const lead = leads.find((item) => item.id === data.leadId)
  if (!lead) {
    throw new Error('Lead not found')
  }

  const now = new Date().toISOString()
  const interaction: Interaction = {
    id: `INT-${String(interactions.length + 1).padStart(3, '0')}`,
    leadId: data.leadId,
    salesRep: lead.assignedTo || lead.owner,
    timestamp: now,
    channel: data.channel,
    attemptType: data.attemptType,
    outcome: data.outcome,
    notes: data.notes,
    duration: data.duration,
    nextAction: data.nextAction,
    nextActionNotes: data.nextActionNotes,
  }
  interactions = [interaction, ...interactions]

  lead.lastActivity = now
  lead.updated = now
  lead.score = Math.min(100, lead.score + (data.outcome === 'connected' ? 5 : 2))

  timeline = [
    {
      id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
      leadId: data.leadId,
      type: 'interaction_logged',
      timestamp: now,
      user: interaction.salesRep,
      description: data.notes,
      interactionId: interaction.id,
    },
    ...timeline,
  ]

  const currentMetrics = metrics[data.leadId] ?? {
    leadId: data.leadId,
    totalAttempts: 0,
    totalConnects: 0,
    connectRate: 0,
    lastContactAt: now,
    avgResponseTimeHours: 0,
    channelStats: {
      call: { attempts: 0, connects: 0, rate: 0 },
      whatsapp: { attempts: 0, connects: 0, rate: 0 },
      email: { attempts: 0, connects: 0, rate: 0 },
      sms: { attempts: 0, connects: 0, rate: 0 },
      meeting: { attempts: 0, connects: 0, rate: 0 },
      video_call: { attempts: 0, connects: 0, rate: 0 },
    },
    slaBreached: false,
  }

  currentMetrics.totalAttempts += 1
  if (data.outcome === 'connected') {
    currentMetrics.totalConnects += 1
  }
  currentMetrics.connectRate = Math.round((currentMetrics.totalConnects / currentMetrics.totalAttempts) * 100)
  currentMetrics.lastContactAt = now
  currentMetrics.channelStats[data.channel].attempts += 1
  if (data.outcome === 'connected') {
    currentMetrics.channelStats[data.channel].connects += 1
  }
  currentMetrics.channelStats[data.channel].rate = currentMetrics.channelStats[data.channel].attempts
    ? Math.round((currentMetrics.channelStats[data.channel].connects / currentMetrics.channelStats[data.channel].attempts) * 100)
    : 0
  metrics[data.leadId] = currentMetrics

  if (data.nextAction && data.scheduledFollowUp) {
    const task: FollowUpTask = {
      id: `TASK-${String(followUpTasks.length + 1).padStart(3, '0')}`,
      leadId: data.leadId,
      interactionId: interaction.id,
      title: data.nextAction.replace('_', ' '),
      description: data.nextActionNotes || data.notes,
      type: data.nextAction,
      scheduledAt: new Date(data.scheduledFollowUp).toISOString(),
      status: 'pending',
      priority: data.outcome === 'connected' ? 'medium' : 'high',
      owner: lead.assignedTo || lead.owner,
      createdBy: interaction.salesRep,
      created: now,
      updated: now,
    }
    followUpTasks = [...followUpTasks, task]
    timeline = [
      {
        id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
        leadId: data.leadId,
        type: 'follow_up_created',
        timestamp: now,
        user: interaction.salesRep,
        description: `Created follow-up task: ${task.title}`,
        taskId: task.id,
      },
      ...timeline,
    ]
  }

  return delay(interaction)
}

export async function completeMockTask(name: string): Promise<FollowUpTask> {
  const task = followUpTasks.find((item) => item.id === name)
  if (!task) {
    throw new Error('Task not found')
  }
  task.status = 'completed'
  task.completedAt = new Date().toISOString()
  task.updated = task.completedAt
  timeline = [
    {
      id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
      leadId: task.leadId,
      type: 'follow_up_completed',
      timestamp: task.completedAt,
      user: task.owner,
      description: `Completed task: ${task.title}`,
      taskId: task.id,
    },
    ...timeline,
  ]
  return delay(task)
}

export async function createMockLead(data: CreateLeadRequest): Promise<Lead> {
  const now = data.capturedAt ? new Date(data.capturedAt).toISOString() : new Date().toISOString()
  const leadNumber = leads.length + 1
  const leadId = `LEAD-${String(leadNumber).padStart(3, '0')}`
  const owner = 'Lead Desk'

  const lead: Lead = {
    id: leadId,
    name: data.name,
    phone: data.phone,
    email: data.email || '',
    state: data.state,
    source: data.source || 'other',
    campaignId: data.campaignId,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    capturedAt: now,
    capturedBy: owner,
    investment: data.investment,
    investmentRange: data.investmentRange,
    location: data.location,
    initialNotes: data.initialNotes,
    expectedClosureDate: data.expectedClosureDate,
    nextConnectMode: data.nextConnectMode,
    nextConnectAt: data.nextConnectAt,
    referenceSource: data.referenceSource,
    stage: 'lead_capture',
    status: 'new',
    score: 20,
    owner,
    created: now,
    updated: now,
    lastActivity: now,
  }

  leads = [lead, ...leads]
  timeline = [
    {
      id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
      leadId: leadId,
      type: 'lead_created',
      timestamp: now,
      user: owner,
      description: `Lead captured for ${data.name}.`,
    },
    ...timeline,
  ]

  if (data.nextConnectAt) {
    const task: FollowUpTask = {
      id: `TASK-${String(followUpTasks.length + 1).padStart(3, '0')}`,
      leadId,
      title: data.nextConnectMode ? `Next connect: ${data.nextConnectMode}` : 'Next connect',
      description: data.initialNotes || 'Initial follow-up scheduled from lead capture form.',
      type: 'other',
      scheduledAt: new Date(data.nextConnectAt).toISOString(),
      status: 'pending',
      priority: 'medium',
      owner,
      createdBy: owner,
      created: now,
      updated: now,
    }
    followUpTasks = [...followUpTasks, task]
    timeline = [
      {
        id: `EVT-${String(timeline.length + 1).padStart(3, '0')}`,
        leadId,
        type: 'follow_up_created',
        timestamp: now,
        user: owner,
        description: `Scheduled next connect for ${new Date(task.scheduledAt).toLocaleString('en-IN')}.`,
        taskId: task.id,
      },
      ...timeline,
    ]
  }

  metrics[leadId] = {
    leadId,
    totalAttempts: 0,
    totalConnects: 0,
    connectRate: 0,
    lastContactAt: now,
    avgResponseTimeHours: 0,
    channelStats: {
      call: { attempts: 0, connects: 0, rate: 0 },
      whatsapp: { attempts: 0, connects: 0, rate: 0 },
      email: { attempts: 0, connects: 0, rate: 0 },
      sms: { attempts: 0, connects: 0, rate: 0 },
      meeting: { attempts: 0, connects: 0, rate: 0 },
      video_call: { attempts: 0, connects: 0, rate: 0 },
    },
    slaBreached: false,
  }

  return delay(lead)
}
