import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { Lead, ActivityLog, TenantCompany, TenantUser } from './types';
import { INITIAL_COMPANIES, INITIAL_USERS, INITIAL_LEADS } from './mockData';

const STORAGE_PREFIX = 'standalone_saas_leads_';

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage for', key, e);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving localStorage for', key, e);
  }
}

// -------------------------------------------------------------
// COMPANIES SERVICE
// -------------------------------------------------------------
export async function fetchCompanies(): Promise<TenantCompany[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('saas_companies').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          email: c.email,
          phone: c.phone,
          plan: c.plan || 'starter',
          logoUrl: c.logo_url,
          createdAt: c.created_at,
          settings: c.settings || {},
        }));
      }
    } catch (err) {
      console.warn('[dataService] Supabase companies fetch error, falling back:', err);
    }
  }

  // Local storage fallback
  let companies = getLocalItem<TenantCompany[]>('companies', []);
  if (!companies || companies.length === 0) {
    companies = INITIAL_COMPANIES;
    setLocalItem('companies', companies);
  }
  return companies;
}

export async function createCompany(company: Omit<TenantCompany, 'id' | 'createdAt'>): Promise<TenantCompany> {
  const newCompany: TenantCompany = {
    ...company,
    id: 'comp_' + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('saas_companies').insert({
        name: newCompany.name,
        slug: newCompany.slug,
        email: newCompany.email,
        phone: newCompany.phone,
        plan: newCompany.plan,
        settings: newCompany.settings,
      }).select().single();

      if (!error && data) {
        newCompany.id = data.id;
      }
    } catch (err) {
      console.warn('[dataService] Supabase createCompany failed, saved locally:', err);
    }
  }

  const companies = await fetchCompanies();
  setLocalItem('companies', [newCompany, ...companies]);
  return newCompany;
}

// -------------------------------------------------------------
// USERS / TEAM SERVICE
// -------------------------------------------------------------
export async function fetchUsers(companyId: string): Promise<TenantUser[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('saas_users')
        .select('*')
        .eq('company_id', companyId);

      if (!error && data && data.length > 0) {
        return data.map((u: any) => ({
          id: u.id,
          companyId: u.company_id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          avatar: u.avatar,
          createdAt: u.created_at,
        }));
      }
    } catch (err) {
      console.warn('[dataService] Supabase users fetch error:', err);
    }
  }

  let users = getLocalItem<TenantUser[]>('users', []);
  if (!users || users.length === 0) {
    users = INITIAL_USERS;
    setLocalItem('users', users);
  }
  return users.filter(u => u.companyId === companyId);
}

export async function createMember(user: Omit<TenantUser, 'id' | 'createdAt'>): Promise<TenantUser> {
  const newUser: TenantUser = {
    ...user,
    id: 'user_' + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('saas_users').insert({
        company_id: newUser.companyId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      }).select().single();

      if (!error && data) {
        newUser.id = data.id;
      }
    } catch (err) {
      console.warn('[dataService] Supabase createMember error:', err);
    }
  }

  const allUsers = getLocalItem<TenantUser[]>('users', INITIAL_USERS);
  setLocalItem('users', [newUser, ...allUsers]);
  return newUser;
}

// -------------------------------------------------------------
// LEADS SERVICE
// -------------------------------------------------------------
export async function fetchLeads(companyId: string): Promise<Lead[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('saas_leads')
        .select('*, saas_lead_activities(*)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((l: any) => ({
          id: l.id,
          companyId: l.company_id,
          name: l.name,
          email: l.email || '',
          phone: l.phone || '',
          source: l.source || 'Direct',
          status: l.status || 'new',
          priority: l.priority || 'medium',
          score: l.score || 'WARM',
          remarks: l.remarks || '',
          budget: l.budget || '',
          guests: l.guests || '',
          city: l.city || '',
          bookingDate: l.booking_date || '',
          bookingTime: l.booking_time || '',
          occasion: l.occasion || '',
          createdAt: l.created_at,
          updatedAt: l.updated_at,
          tags: l.tags || [],
          emailSent: l.email_sent || false,
          whatsappSent: l.whatsapp_sent || false,
          followUpDate: l.follow_up_date || '',
          followUpTime: l.follow_up_time || '',
          followUpRemarks: l.follow_up_remarks || '',
          followUpType: l.follow_up_type || 'call',
          assignedAgent: l.assigned_agent_id || '',
          assignedAgentName: l.assigned_agent_name || '',
          history: (l.saas_lead_activities || []).map((a: any) => ({
            id: a.id,
            leadId: a.lead_id,
            companyId: a.company_id,
            type: a.type,
            content: a.content,
            user: a.user_name,
            outcome: a.outcome,
            reminderDate: a.reminder_date,
            reminderTime: a.reminder_time,
            timestamp: a.timestamp,
          })),
        }));
      }
    } catch (err) {
      console.warn('[dataService] Supabase fetchLeads failed, falling back:', err);
    }
  }

  // Local storage fallback per company
  let stored = getLocalItem<Lead[]>(`leads_${companyId}`, []);
  if (!stored || stored.length === 0) {
    // Check if initial leads match this company
    const initForCompany = INITIAL_LEADS.filter(l => l.companyId === companyId);
    if (initForCompany.length > 0) {
      stored = initForCompany;
      setLocalItem(`leads_${companyId}`, stored);
    } else {
      stored = [];
    }
  }
  return stored;
}

export async function saveLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: 'lead_' + Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    history: [
      {
        id: 'act_' + Math.random().toString(36).substring(2, 9),
        leadId: '',
        companyId: leadData.companyId,
        type: 'automated',
        content: `Lead created from source: ${leadData.source || 'Direct'}`,
        user: 'System Bot',
        timestamp: new Date().toISOString(),
      },
    ],
  };
  newLead.history![0].leadId = newLead.id;

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('saas_leads').insert({
        company_id: newLead.companyId,
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        source: newLead.source,
        status: newLead.status,
        priority: newLead.priority,
        score: newLead.score,
        remarks: newLead.remarks,
        budget: newLead.budget,
        guests: newLead.guests,
        city: newLead.city,
        booking_date: newLead.bookingDate || null,
        booking_time: newLead.bookingTime || null,
        occasion: newLead.occasion || null,
        tags: newLead.tags || [],
        follow_up_date: newLead.followUpDate || null,
        follow_up_time: newLead.followUpTime || null,
        follow_up_remarks: newLead.followUpRemarks || null,
        follow_up_type: newLead.followUpType || 'call',
        assigned_agent_name: newLead.assignedAgentName || null,
      }).select().single();

      if (!error && data) {
        newLead.id = data.id;
        // insert initial activity
        await client.from('saas_lead_activities').insert({
          lead_id: data.id,
          company_id: newLead.companyId,
          type: 'automated',
          content: `Lead created from source: ${leadData.source || 'Direct'}`,
          user_name: 'System Bot',
        });
      }
    } catch (err) {
      console.warn('[dataService] Supabase saveLead error, using local:', err);
    }
  }

  const leads = await fetchLeads(leadData.companyId);
  const updated = [newLead, ...leads];
  setLocalItem(`leads_${leadData.companyId}`, updated);
  return newLead;
}

export async function updateLead(companyId: string, leadId: string, updates: Partial<Lead>): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.source !== undefined) payload.source = updates.source;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.score !== undefined) payload.score = updates.score;
      if (updates.remarks !== undefined) payload.remarks = updates.remarks;
      if (updates.budget !== undefined) payload.budget = updates.budget;
      if (updates.guests !== undefined) payload.guests = updates.guests;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.bookingDate !== undefined) payload.booking_date = updates.bookingDate || null;
      if (updates.bookingTime !== undefined) payload.booking_time = updates.bookingTime || null;
      if (updates.occasion !== undefined) payload.occasion = updates.occasion || null;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.followUpDate !== undefined) payload.follow_up_date = updates.followUpDate || null;
      if (updates.followUpTime !== undefined) payload.follow_up_time = updates.followUpTime || null;
      if (updates.followUpRemarks !== undefined) payload.follow_up_remarks = updates.followUpRemarks || null;
      if (updates.followUpType !== undefined) payload.follow_up_type = updates.followUpType || null;
      if (updates.assignedAgent !== undefined) payload.assigned_agent_id = updates.assignedAgent || null;
      if (updates.assignedAgentName !== undefined) payload.assigned_agent_name = updates.assignedAgentName || null;

      await client.from('saas_leads').update(payload).eq('id', leadId).eq('company_id', companyId);
    } catch (err) {
      console.warn('[dataService] Supabase updateLead error:', err);
    }
  }

  // Update local
  const current = getLocalItem<Lead[]>(`leads_${companyId}`, []);
  const updated = current.map(l => (l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  setLocalItem(`leads_${companyId}`, updated);
}

export async function deleteLead(companyId: string, leadId: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('saas_leads').delete().eq('id', leadId).eq('company_id', companyId);
    } catch (err) {
      console.warn('[dataService] Supabase deleteLead error:', err);
    }
  }

  const current = getLocalItem<Lead[]>(`leads_${companyId}`, []);
  const updated = current.filter(l => l.id !== leadId);
  setLocalItem(`leads_${companyId}`, updated);
}

// -------------------------------------------------------------
// ACTIVITY LOG SERVICE
// -------------------------------------------------------------
export async function addLeadActivity(
  companyId: string,
  leadId: string,
  activity: Omit<ActivityLog, 'id' | 'leadId' | 'companyId' | 'timestamp'>
): Promise<ActivityLog> {
  const newActivity: ActivityLog = {
    ...activity,
    id: 'act_' + Math.random().toString(36).substring(2, 10),
    leadId,
    companyId,
    timestamp: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('saas_lead_activities').insert({
        lead_id: leadId,
        company_id: companyId,
        type: newActivity.type,
        content: newActivity.content,
        user_name: newActivity.user,
        outcome: newActivity.outcome || 'none',
        reminder_date: newActivity.reminderDate || null,
        reminder_time: newActivity.reminderTime || null,
      }).select().single();

      if (!error && data) {
        newActivity.id = data.id;
      }
    } catch (err) {
      console.warn('[dataService] Supabase addActivity error:', err);
    }
  }

  // Add to local lead history
  const current = getLocalItem<Lead[]>(`leads_${companyId}`, []);
  const updated = current.map(l => {
    if (l.id === leadId) {
      const history = [newActivity, ...(l.history || [])];
      return { ...l, history };
    }
    return l;
  });
  setLocalItem(`leads_${companyId}`, updated);

  return newActivity;
}
