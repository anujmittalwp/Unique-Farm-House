import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  Building2, 
  Database, 
  Users, 
  Download, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { SaaSAuthProvider, useSaaSAuth } from './AuthContext';
import { isSupabaseConfigured } from './supabaseClient';
import { 
  fetchLeads, 
  saveLead, 
  updateLead, 
  deleteLead, 
  addLeadActivity 
} from './dataService';
import { 
  Lead, 
  LeadStatus, 
  DashboardMetrics, 
  DashboardFilters, 
  ActivityLog, 
  UserRole 
} from './types';
import { SaaSMetricsHeader } from './components/SaaSMetricsHeader';
import { SaaSFilterBar } from './components/SaaSFilterBar';
import { SaaSTableView } from './components/SaaSTableView';
import { SaaSPipelineView } from './components/SaaSPipelineView';
import { SaaSAddLeadModal } from './components/SaaSAddLeadModal';
import { SaaSFollowUpModal } from './components/SaaSFollowUpModal';
import { SaaSHistoryModal } from './components/SaaSHistoryModal';
import { SaaSTeamModal } from './components/SaaSTeamModal';
import { SaaSSupabaseSettingsModal } from './components/SaaSSupabaseSettingsModal';

function StandaloneSaaSLeadsDashboard() {
  const { 
    currentCompany, 
    currentUser, 
    teamMembers, 
    companies, 
    switchCompany, 
    switchUserRole 
  } = useSaaSAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<Lead | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLeadForHistory, setSelectedLeadForHistory] = useState<Lead | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    source: 'all',
    agent: 'all',
    dateRange: 'all',
  });

  // Toast notification state
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Load leads whenever current company changes
  const loadLeads = useCallback(async () => {
    if (!currentCompany) return;
    setIsLoading(true);
    try {
      const data = await fetchLeads(currentCompany.id);
      setLeads(data);
    } catch (e) {
      console.error(e);
      showToast('Failed to load leads for company', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany, showToast]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Handle lead actions
  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    try {
      const created = await saveLead(leadData);
      setLeads(prev => [created, ...prev]);
      showToast(`Lead "${created.name}" captured successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save lead', 'error');
      throw err;
    }
  };

  const handleUpdateStatus = async (leadId: string, status: LeadStatus) => {
    if (!currentCompany) return;
    try {
      await updateLead(currentCompany.id, leadId, { status });
      await addLeadActivity(currentCompany.id, leadId, {
        type: 'status',
        content: `Status changed to ${status.toUpperCase()}`,
        user: currentUser?.name || 'Agent',
        outcome: status === 'converted' ? 'positive' : status === 'lost' ? 'negative' : 'neutral',
      });
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status } : l)));
      showToast(`Lead status updated to ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleUpdateDetail = async (leadId: string, field: keyof Lead, value: any) => {
    if (!currentCompany) return;
    try {
      await updateLead(currentCompany.id, leadId, { [field]: value });
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, [field]: value } : l)));
      showToast(`Updated ${String(field)}`, 'success');
    } catch (err) {
      showToast('Failed to update field', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!currentCompany) return;
    try {
      await deleteLead(currentCompany.id, leadId);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      setSelectedIds(prev => prev.filter(id => id !== leadId));
      showToast('Lead deleted successfully', 'info');
    } catch (err) {
      showToast('Failed to delete lead', 'error');
    }
  };

  const handleScheduleFollowUp = async (
    leadId: string,
    followUpDate: string,
    followUpTime: string,
    followUpType: 'call' | 'whatsapp' | 'email' | 'visit',
    followUpRemarks: string
  ) => {
    if (!currentCompany) return;
    try {
      await updateLead(currentCompany.id, leadId, {
        followUpDate,
        followUpTime,
        followUpType,
        followUpRemarks,
      });

      const act = await addLeadActivity(currentCompany.id, leadId, {
        type: 'followup',
        content: `Follow-up scheduled for ${followUpDate} at ${followUpTime} via ${followUpType}. Notes: ${followUpRemarks || 'None'}`,
        user: currentUser?.name || 'Agent',
        reminderDate: followUpDate,
        reminderTime: followUpTime,
      });

      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          const history = [act, ...(l.history || [])];
          return {
            ...l,
            followUpDate,
            followUpTime,
            followUpType,
            followUpRemarks,
            history,
          };
        }
        return l;
      }));

      showToast('Follow-up scheduled successfully!', 'success');
    } catch (err) {
      showToast('Failed to schedule follow-up', 'error');
    }
  };

  const handleAddActivity = async (
    leadId: string,
    type: ActivityLog['type'],
    content: string,
    outcome: ActivityLog['outcome']
  ) => {
    if (!currentCompany) return;
    try {
      const act = await addLeadActivity(currentCompany.id, leadId, {
        type,
        content,
        user: currentUser?.name || 'Agent',
        outcome,
      });

      setLeads(prev => prev.map(l => {
        if (l.id === leadId) {
          const history = [act, ...(l.history || [])];
          return { ...l, history };
        }
        return l;
      }));

      showToast('Activity logged successfully', 'success');
    } catch (err) {
      showToast('Failed to log activity', 'error');
    }
  };

  // WhatsApp helper
  const handleQuickWhatsApp = (lead: Lead) => {
    const rawPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
    const defaultTemplate = currentCompany?.settings?.whatsappTemplate || 'Hello {name}! Thank you for inquiring with us. How can we assist you with your booking?';
    const message = defaultTemplate.replace('{name}', lead.name);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = (lead.name || '').toLowerCase().includes(query);
        const matchesPhone = (lead.phone || '').includes(query);
        const matchesEmail = (lead.email || '').toLowerCase().includes(query);
        const matchesCity = (lead.city || '').toLowerCase().includes(query);
        const matchesOccasion = (lead.occasion || '').toLowerCase().includes(query);
        const matchesRemarks = (lead.remarks || '').toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesCity && !matchesOccasion && !matchesRemarks) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Priority
      if (filters.priority !== 'all' && lead.priority !== filters.priority) {
        return false;
      }

      // Source
      if (filters.source !== 'all' && lead.source !== filters.source) {
        return false;
      }

      // Agent
      if (filters.agent !== 'all' && lead.assignedAgentName !== filters.agent) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Calculate Metrics
  const metrics = useMemo<DashboardMetrics>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newCount = 0;
    let hotCount = 0;
    let todayFollowUpCount = 0;
    let overdueCount = 0;
    let wonCount = 0;
    let revenue = 0;

    leads.forEach(l => {
      if (l.status === 'new') newCount++;
      if (l.priority === 'high' || l.score === 'HOT' || l.status === 'hot') hotCount++;
      if (l.status === 'converted') {
        wonCount++;
        const val = parseInt((l.budget || '').replace(/[^0-9]/g, ''), 10);
        if (!isNaN(val)) revenue += val;
      }

      if (l.followUpDate && l.status !== 'converted' && l.status !== 'lost') {
        const d = new Date(l.followUpDate);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) {
          todayFollowUpCount++;
        } else if (d < today) {
          overdueCount++;
        }
      }
    });

    const conversionRate = leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0;

    return {
      totalLeads: leads.length,
      newLeads: newCount,
      hotLeads: hotCount,
      todayFollowUps: todayFollowUpCount,
      overdueFollowUps: overdueCount,
      convertedLeads: wonCount,
      conversionRate,
      estimatedRevenue: revenue,
    };
  }, [leads]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }

    const exportRows = filteredLeads.map(l => ({
      'Lead ID': l.id,
      'Name': l.name,
      'Phone': l.phone,
      'Email': l.email,
      'Source': l.source,
      'Status': l.status.toUpperCase(),
      'Priority': (l.priority || 'medium').toUpperCase(),
      'Budget': l.budget || '',
      'Guests': l.guests || '',
      'City': l.city || '',
      'Booking Date': l.bookingDate || '',
      'Occasion': l.occasion || '',
      'Follow-Up Date': l.followUpDate || '',
      'Follow-Up Time': l.followUpTime || '',
      'Follow-Up Remarks': l.followUpRemarks || '',
      'Assigned Agent': l.assignedAgentName || 'Unassigned',
      'Created At': new Date(l.createdAt).toLocaleDateString(),
    }));

    const csv = Papa.unparse(exportRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentCompany?.slug || 'saas'}_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported to CSV successfully', 'success');
  };

  // Bulk Actions
  const handleBulkUpdateStatus = async (status: LeadStatus) => {
    if (!currentCompany || selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => updateLead(currentCompany.id, id, { status })));
      setLeads(prev => prev.map(l => (selectedIds.includes(l.id) ? { ...l, status } : l)));
      setSelectedIds([]);
      showToast(`Updated ${selectedIds.length} leads to ${status}`, 'success');
    } catch (err) {
      showToast('Failed to bulk update status', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!currentCompany || selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) return;
    try {
      await Promise.all(selectedIds.map(id => deleteLead(currentCompany.id, id)));
      setLeads(prev => prev.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
      showToast('Selected leads deleted', 'info');
    } catch (err) {
      showToast('Failed to delete leads', 'error');
    }
  };

  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E1E1E] font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white ${
            toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-luxury-dark'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-luxury-dark/10 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: Brand & Tenant Switcher */}
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Return to Main Farm Resort Website"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Main Website</span>
            </a>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-luxury-dark text-white flex items-center justify-center font-serif font-black shadow-xs">
                <Sparkles size={16} className="text-luxury-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-black text-sm text-luxury-dark tracking-tight">
                    {currentCompany?.name || 'SaaS Leads'}
                  </h1>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {currentCompany?.plan || 'pro'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Multi-Tenant CRM Engine</p>
              </div>
            </div>
          </div>

          {/* Right: Actions, DB status, User Role & Add Lead */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            
            {/* Supabase Status Pill */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                supabaseActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to configure Supabase Cloud Database"
            >
              <Database size={13} className={supabaseActive ? 'text-emerald-600' : 'text-amber-600'} />
              <span>{supabaseActive ? 'Supabase Live' : 'Sandbox Storage'}</span>
            </button>

            {/* Team / Tenant Management */}
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Users size={13} />
              <span>Team & Tenant</span>
            </button>

            {/* Current User Pill & Role Switcher */}
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-xl text-[11px] font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-luxury-dark truncate max-w-[100px]">{currentUser.name}</span>
                <select
                  value={currentUser.role}
                  onChange={(e) => switchUserRole(e.target.value as UserRole)}
                  className="bg-transparent font-bold text-indigo-700 outline-none cursor-pointer text-[10px] uppercase"
                  title="Switch Role to preview permissions"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
            )}

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Export Filtered Leads to CSV"
            >
              <Download size={14} />
            </button>

            {/* Refresh Leads */}
            <button
              onClick={loadLeads}
              disabled={isLoading}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Reload Leads"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Primary: Capture New Lead */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-luxury-dark hover:bg-black text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus size={14} className="text-luxury-gold" />
              <span>Capture Lead</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        
        {/* KPI Metrics Header */}
        <SaaSMetricsHeader 
          metrics={metrics} 
          onFilterClick={(key) => {
            if (key === 'all') setFilters(prev => ({ ...prev, status: 'all', priority: 'all' }));
            if (key === 'hot') setFilters(prev => ({ ...prev, priority: 'high' }));
            if (key === 'won') setFilters(prev => ({ ...prev, status: 'converted' }));
          }} 
        />

        {/* Filter & Search Bar */}
        <SaaSFilterBar
          filters={filters}
          onFilterChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
          onResetFilters={() => setFilters({ search: '', status: 'all', priority: 'all', source: 'all', agent: 'all', dateRange: 'all' })}
          teamMembers={teamMembers}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredLeads.length}
        />

        {/* Views: Table or Pipeline */}
        <div className="flex-1">
          {viewMode === 'table' ? (
            <SaaSTableView
              leads={filteredLeads}
              selectedIds={selectedIds}
              onToggleSelect={(id) => {
                setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
              }}
              onSelectAll={() => {
                if (selectedIds.length === filteredLeads.length) setSelectedIds([]);
                else setSelectedIds(filteredLeads.map(l => l.id));
              }}
              onClearSelection={() => setSelectedIds([])}
              onUpdateStatus={handleUpdateStatus}
              onUpdateDetail={handleUpdateDetail}
              onOpenFollowUp={(lead) => {
                setSelectedLeadForFollowUp(lead);
                setIsFollowUpModalOpen(true);
              }}
              onOpenHistory={(lead) => {
                setSelectedLeadForHistory(lead);
                setIsHistoryModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onQuickWhatsApp={handleQuickWhatsApp}
              teamMembers={teamMembers}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onBulkDelete={handleBulkDelete}
            />
          ) : (
            <SaaSPipelineView
              leads={filteredLeads}
              onUpdateStatus={handleUpdateStatus}
              onOpenFollowUp={(lead) => {
                setSelectedLeadForFollowUp(lead);
                setIsFollowUpModalOpen(true);
              }}
              onOpenHistory={(lead) => {
                setSelectedLeadForHistory(lead);
                setIsHistoryModalOpen(true);
              }}
              onQuickWhatsApp={handleQuickWhatsApp}
            />
          )}
        </div>

      </main>

      {/* Modals */}
      <SaaSAddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLead}
        teamMembers={teamMembers}
        companyId={currentCompany?.id || ''}
      />

      <SaaSFollowUpModal
        isOpen={isFollowUpModalOpen}
        lead={selectedLeadForFollowUp}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedLeadForFollowUp(null);
        }}
        onSchedule={handleScheduleFollowUp}
      />

      <SaaSHistoryModal
        isOpen={isHistoryModalOpen}
        lead={selectedLeadForHistory}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedLeadForHistory(null);
        }}
        onAddActivity={handleAddActivity}
        currentUserName={currentUser?.name || 'Agent'}
      />

      <SaaSTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        showToast={showToast}
      />

      <SaaSSupabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        showToast={showToast}
        onConfigUpdated={loadLeads}
      />

    </div>
  );
}

export default function StandaloneSaaSLeadsApp() {
  return (
    <SaaSAuthProvider>
      <StandaloneSaaSLeadsDashboard />
    </SaaSAuthProvider>
  );
}
