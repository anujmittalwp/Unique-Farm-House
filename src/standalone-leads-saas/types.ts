export type LeadStatus = 'new' | 'contacted' | 'quotation_sent' | 'hot' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';
export type LeadScore = 'HOT' | 'WARM' | 'COLD';
export type UserRole = 'owner' | 'admin' | 'manager' | 'agent';

export interface ActivityLog {
  id: string;
  leadId: string;
  companyId: string;
  type: 'status' | 'remark' | 'assignment' | 'followup' | 'automated' | 'call' | 'whatsapp' | 'email' | 'visit';
  content: string;
  user: string;
  userId?: string;
  outcome?: 'positive' | 'neutral' | 'negative' | 'none';
  reminderDate?: string;
  reminderTime?: string;
  timestamp: string | any;
}

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  priority?: LeadPriority;
  score?: LeadScore;
  remarks?: string;
  budget?: string;
  guests?: string;
  city?: string;
  bookingDate?: string;
  bookingTime?: string;
  occasion?: string;
  createdAt: string | any;
  updatedAt?: string | any;
  tags?: string[];
  emailSent?: boolean;
  whatsappSent?: boolean;
  metaLeadId?: string;
  followUpDate?: string;
  followUpTime?: string;
  followUpRemarks?: string;
  followUpType?: 'call' | 'whatsapp' | 'email' | 'visit';
  assignedAgent?: string;
  assignedAgentName?: string;
  history?: ActivityLog[];
  isDuplicate?: boolean;
}

export interface TenantCompany {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  logoUrl?: string;
  createdAt: string;
  settings?: {
    currency?: string;
    dateFormat?: string;
    whatsappTemplate?: string;
    emailSignature?: string;
  };
}

export interface TenantUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  todayFollowUps: number;
  overdueFollowUps: number;
  convertedLeads: number;
  conversionRate: number;
  estimatedRevenue: number;
}

export interface DashboardFilters {
  search: string;
  status: string;
  priority: string;
  source: string;
  agent: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
}
