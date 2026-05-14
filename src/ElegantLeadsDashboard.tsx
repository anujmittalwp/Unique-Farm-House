import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  MessageCircle, 
  Download, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List as ListIcon,
  Phone,
  Calendar,
  Tag,
  IndianRupee,
  MapPin,
  ClipboardList,
  Save,
  Loader2,
  FileSpreadsheet,
  Facebook,
  UserPlus,
  CheckSquare,
  Square,
  History,
  ArrowDownRight,
  MessageSquare,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { 
  db,
  auth
} from './firebase';
import { 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  getDoc, 
  setDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
  query,
  where,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { format, differenceInHours, addDays, isPast, isToday } from 'date-fns';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'lost' | 'hot';
  remarks?: string;
  budget?: string;
  guests?: string;
  city?: string;
  bookingDate?: string;
  bookingTime?: string;
  createdAt: any;
  tags?: string[];
  emailSent?: boolean;
  whatsappSent?: boolean;
  score?: 'HOT' | 'WARM' | 'COLD';
  metaLeadId?: string;
  occasion?: string;
  followUpDate?: string;
  followUpTime?: string;
  followUpRemarks?: string;
  assignedAgent?: string;
  assignedAgentName?: string;
  history?: ActivityLog[];
}

interface ActivityLog {
  id: string;
  type: 'status' | 'remark' | 'assignment' | 'followup' | 'automated' | 'call' | 'whatsapp' | 'email' | 'visit';
  content: string;
  user: string;
  outcome?: 'positive' | 'neutral' | 'negative' | 'none';
  reminderDate?: string;
  reminderTime?: string;
  timestamp: any;
}

interface Agent {
  uid: string;
  displayName: string;
  role: string;
}

interface ElegantLeadsDashboardProps {
  leads: Lead[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  userRole: string | null;
  userPermissions: any;
  onAddLead: () => void;
  onExport: () => void;
  onOpenSync: () => void;
  onOpenMetaSync: () => void;
  onOpenGmailSettings: () => void;
  onDeleteLead: (id: string) => void;
  onReply: (type: 'email' | 'whatsapp', contact: string, name: string, leadId?: string) => void;
}

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const ElegantLeadsDashboard: React.FC<ElegantLeadsDashboardProps> = ({ 
  leads, 
  showToast, 
  userRole, 
  userPermissions,
  onAddLead,
  onExport,
  onOpenSync,
  onOpenMetaSync,
  onOpenGmailSettings,
  onDeleteLead,
  onReply
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'followup' | 'converted' | 'lost'>('new');
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [editingRemarks, setEditingRemarks] = useState<string | null>(null);
  const [remarksValue, setRemarksValue] = useState('');
  const [editingDetail, setEditingDetail] = useState<{id: string, field: string} | null>(null);
  const [editDetailValue, setEditDetailValue] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [selectedLeadForLog, setSelectedLeadForLog] = useState<Lead | null>(null);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<Lead | null>(null);
  const [followUpActivityType, setFollowUpActivityType] = useState<ActivityLog['type']>('remark');
  const [followUpOutcome, setFollowUpOutcome] = useState<ActivityLog['outcome']>('none');
  const [isFollowUpDrawerOpen, setIsFollowUpDrawerOpen] = useState(false);
  const [notifiedLeads, setNotifiedLeads] = useState<Set<string>>(new Set());

  // Notification System: Check for follow-up reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');

      leads.forEach(lead => {
        if (
          lead.followUpDate === today && 
          lead.followUpTime === currentTime && 
          !notifiedLeads.has(`${lead.id}-${today}-${currentTime}`) &&
          lead.status !== 'converted' && 
          lead.status !== 'lost'
        ) {
          showToast(`Follow-up Reminder: ${lead.name} (${lead.phone}) is scheduled for now!`, 'info');
          setNotifiedLeads(prev => new Set(prev).add(`${lead.id}-${today}-${currentTime}`));
          
          // Play notification sound if possible
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
          } catch (e) {}
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [leads, notifiedLeads, showToast]);

  const addHistoryEntry = async (leadId: string, type: ActivityLog['type'], content: string, outcome: ActivityLog['outcome'] = 'none') => {
    const lead = leads.find(l => l.id === leadId);
    const entry: ActivityLog = {
      id: Math.random().toString(36).slice(2, 9),
      type,
      content,
      user: auth.currentUser?.displayName || auth.currentUser?.email || 'System',
      outcome,
      reminderDate: lead?.followUpDate,
      reminderTime: lead?.followUpTime,
      timestamp: new Date().toISOString()
    };
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        history: arrayUnion(entry)
      });
    } catch (err) {
      console.warn('Failed to log history:', err);
    }
  };

  const createBookingFromLead = async (lead: Lead) => {
    try {
      const checkInDate = lead.bookingDate ? new Date(lead.bookingDate) : new Date();
      const checkOutDate = addDays(checkInDate, 1);

      const bookingData = {
        name: lead.name || '',
        mobile: lead.phone || '',
        email: (lead.email || '').toLowerCase(),
        checkIn: Timestamp.fromDate(checkInDate),
        checkOut: Timestamp.fromDate(checkOutDate),
        guests: Number(lead.guests) || 0,
        dayGuestAdults: Number(lead.guests) || 0,
        dayGuestChildren: [],
        nightGuestAdults: 0,
        nightGuestChildren: [],
        occasion: lead.occasion || lead.remarks || 'Waitlisted Booking',
        status: 'pending',
        bookingAmount: 0,
        totalAmount: 0,
        amountPaid: 0,
        securityDeposit: 0,
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
        bookedBy: 'agent_for_client',
        paymentMethod: 'upi',
        source: 'lead_conversion',
        leadId: lead.id
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Also create availability record
      await setDoc(doc(db, 'availability', docRef.id), {
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        status: bookingData.status
      });

      await addHistoryEntry(lead.id, 'automated', `Booking created automatically (ID: ${docRef.id.slice(0, 8)})`);
      showToast('Booking created successfully!', 'success');
      return docRef.id;
    } catch (err) {
      console.error('Error creating booking:', err);
      showToast('Failed to create booking automation', 'error');
      throw err;
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['agent', 'admin']));
        const querySnapshot = await getDocs(q);
        const agentList: Agent[] = [];
        querySnapshot.forEach((doc) => {
          agentList.push({ uid: doc.id, ...doc.data() } as Agent);
        });
        setAgents(agentList);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, []);

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedLeadIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const batch = writeBatch(db);
      selectedLeadIds.forEach(id => {
        const ref = doc(db, 'leads', id);
        batch.update(ref, { 
          status,
          statusUpdatedAt: serverTimestamp(),
          updatedBy: userRole 
        });
      });
      await batch.commit();
      showToast(`Updated ${selectedLeadIds.length} leads to ${status}`, 'success');
      setSelectedLeadIds([]);
    } catch (err) {
      showToast('Bulk update failed', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkAssign = async (agentId: string, agentName: string) => {
    if (selectedLeadIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const batch = writeBatch(db);
      selectedLeadIds.forEach(id => {
        const ref = doc(db, 'leads', id);
        batch.update(ref, { 
          assignedAgent: agentId,
          assignedAgentName: agentName,
          assignedAt: serverTimestamp()
        });
      });
      await batch.commit();
      showToast(`Assigned ${selectedLeadIds.length} leads to ${agentName}`, 'success');
      setSelectedLeadIds([]);
    } catch (err) {
      showToast('Bulk assignment failed', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return;
    
    setIsBulkProcessing(true);
    try {
      const batch = writeBatch(db);
      selectedLeadIds.forEach(id => {
        batch.delete(doc(db, 'leads', id));
      });
      await batch.commit();
      showToast(`Deleted ${selectedLeadIds.length} leads`, 'success');
      setSelectedLeadIds([]);
    } catch (err) {
      showToast('Bulk delete failed', 'error');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    hot: leads.filter(l => l.score === 'HOT' || l.status === 'hot').length,
    followUpsToday: leads.filter(l => l.followUpDate === format(new Date(), 'yyyy-MM-dd')).length,
    followup: leads.filter(l => l.followUpDate && l.status !== 'converted' && l.status !== 'lost').length
  };

  // Robust date helper for Firestore Timestamps or String dates
  const getSafeDate = (d: any) => {
    if (!d) return new Date();
    if (d.toDate) return d.toDate();
    if (d.seconds) return new Date(d.seconds * 1000);
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = activeTab === 'all' || lead.status === activeTab;
    if (activeTab === 'followup') {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');
      const isLeadActive = lead.status !== 'converted' && lead.status !== 'lost';
      const hasDate = !!lead.followUpDate;
      
      if (!hasDate || !isLeadActive) return false;

      const leadDateTime = `${lead.followUpDate} ${lead.followUpTime || '10:00'}`;
      const currentDateTime = `${today} ${currentTime}`;

      if (followUpFilter === 'overdue') {
        matchesTab = leadDateTime < currentDateTime;
      } else if (followUpFilter === 'today') {
        matchesTab = lead.followUpDate === today;
      } else if (followUpFilter === 'upcoming') {
        matchesTab = leadDateTime > currentDateTime;
      } else {
        matchesTab = true;
      }
    }
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    if (activeTab === 'followup') {
      // Sort by follow-up date and time (closest/overdue first)
      const dateTimeA = `${a.followUpDate || '9999-99-99'} ${a.followUpTime || '23:59'}`;
      const dateTimeB = `${b.followUpDate || '9999-99-99'} ${b.followUpTime || '23:59'}`;
      return dateTimeA.localeCompare(dateTimeB);
    }
    // Default sort by created at
    const timeA = getSafeDate(a.createdAt).getTime();
    const timeB = getSafeDate(b.createdAt).getTime();
    return timeB - timeA;
  });

  const handleUpdateStatus = async (leadId: string, status: string) => {
    setIsUpdating(leadId);
    const oldLead = leads.find(l => l.id === leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), { 
        status,
        statusUpdatedAt: serverTimestamp()
      });
      
      await addHistoryEntry(leadId, 'status', `Status changed from ${oldLead?.status || 'unknown'} to ${status}`);

      if (status === 'converted' && oldLead) {
        const confirm = window.confirm('Convert to Booking? This will automatically create a booking entry.');
        if (confirm) {
          await createBookingFromLead(oldLead);
        }
      }

      showToast(`Lead marked as ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSaveRemarks = async (leadId: string) => {
    setIsUpdating(leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), { remarks: remarksValue });
      await addHistoryEntry(leadId, 'remark', remarksValue);
      showToast('Remarks updated', 'success');
      setEditingRemarks(null);
    } catch (err) {
      showToast('Failed to update remarks', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateDetail = async (leadId: string, field: string, value: string) => {
    setIsUpdating(leadId);
    const oldLead = leads.find(l => l.id === leadId);
    const oldValue = oldLead ? (oldLead as any)[field] : 'none';
    try {
      await updateDoc(doc(db, 'leads', leadId), { [field]: value });
      await addHistoryEntry(leadId, field === 'followUpDate' ? 'followup' : 'automated', `Updated ${field}: ${oldValue} → ${value}`);
      showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`, 'success');
      setEditingDetail(null);
    } catch (err) {
      showToast(`Failed to update ${field}`, 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'converted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-serif font-black text-luxury-dark tracking-tight">Leads Intelligence</h2>
          <p className="text-luxury-dark/55 font-medium">Manage your high-value enquiries with precision.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
          {[
            { label: 'Total Enquiries', value: stats.total, icon: Users, color: 'text-luxury-dark' },
            { label: 'New Leads', value: stats.new, icon: Zap, color: 'text-blue-600' },
            { label: 'Contacted Leads', value: stats.contacted, icon: Phone, color: 'text-amber-500' },
            { label: 'Follow-ups Today', value: stats.followUpsToday, icon: Clock, color: 'text-indigo-600' },
            { label: 'Converted', value: stats.converted, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Lost', value: stats.lost, icon: XCircle, color: 'text-red-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-luxury-dark/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-xl bg-luxury-dark/5 ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">{stat.label}</span>
              </div>
              <p className="text-2xl font-serif font-black text-luxury-dark">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-luxury-dark/5 shadow-xl shadow-luxury-dark/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-luxury-dark/5 bg-gray-50/30">
          <div className="flex flex-col gap-6">
          {/* Row 1: Tabs */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex bg-white p-1 rounded-2xl border border-luxury-dark/5 shadow-sm overflow-x-auto w-full max-w-fit">
              {[
                { id: 'all', label: 'All' },
                { id: 'new', label: 'New Leads' },
                { id: 'contacted', label: 'Contacted' },
                { id: 'followup', label: 'Follow-ups' },
                { id: 'converted', label: 'Converted' },
                { id: 'lost', label: 'Lost' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                    ? 'bg-luxury-dark text-white shadow-lg shadow-luxury-dark/20' 
                    : 'text-luxury-dark/40 hover:text-luxury-dark hover:bg-luxury-dark/5'
                  }`}
                >
                  {tab.label}
                  {stats[tab.id as keyof typeof stats] !== undefined && (
                    <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-luxury-dark/5 text-luxury-dark/30'}`}>
                      {stats[tab.id as keyof typeof stats]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Overdue Alert Badge */}
            {leads.some(l => l.followUpDate && l.followUpDate < format(new Date(), 'yyyy-MM-dd') && l.status !== 'converted' && l.status !== 'lost') && (
              <div 
                onClick={() => {
                  setActiveTab('followup');
                  setFollowUpFilter('overdue');
                }}
                className="flex items-center gap-3 px-6 py-3 bg-red-50 border border-red-100 rounded-2xl animate-pulse cursor-pointer hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="text-red-500" size={18} />
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Action Required: Overdue Follow-ups Detected</span>
              </div>
            )}
          </div>

          {activeTab === 'followup' && (
            <div className="flex gap-2 items-center bg-white/50 p-1 rounded-xl self-start">
              {[
                { id: 'all', label: 'All Follow-ups' },
                { id: 'overdue', label: 'Overdue' },
                { id: 'today', label: 'Today' },
                { id: 'upcoming', label: 'Upcoming' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFollowUpFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    followUpFilter === f.id 
                    ? 'bg-luxury-dark text-white shadow-md' 
                    : 'text-luxury-dark/40 hover:text-luxury-dark hover:bg-white'
                  }`}
                >
                  {f.label}
                  {f.id !== 'all' && (
                    <span className="ml-1.5 opacity-50">
                      ({
                        leads.filter(l => {
                          const now = new Date();
                          const today = format(now, 'yyyy-MM-dd');
                          const currentTime = format(now, 'HH:mm');
                          const active = l.status !== 'converted' && l.status !== 'lost';
                          if (!l.followUpDate || !active) return false;
                          
                          const leadDT = `${l.followUpDate} ${l.followUpTime || '10:00'}`;
                          const currentDT = `${today} ${currentTime}`;
                          
                          if (f.id === 'overdue') return leadDT < currentDT;
                          if (f.id === 'today') return l.followUpDate === today;
                          if (f.id === 'upcoming') return leadDT > currentDT;
                          return false;
                        }).length
                      })
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

            {/* Row 2: Search & Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-auto md:flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={18} />
                <input 
                  type="text"
                  placeholder="Search name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-white border border-luxury-dark/10 rounded-2xl text-sm w-full focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none transition-all shadow-sm"
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onOpenSync}
                    className="p-3 bg-white border border-emerald-100 rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm" 
                    title="Google Sheets Sync"
                  >
                    <FileSpreadsheet size={20} />
                  </button>
                  <button 
                    onClick={onOpenMetaSync}
                    className="p-3 bg-white border border-blue-100 rounded-2xl text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                    title="Meta Leads Sync"
                  >
                    <Facebook size={20} />
                  </button>
                  <button 
                    onClick={onOpenGmailSettings}
                    className="p-3 bg-white border border-red-100 rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    title="Gmail/SMTP Settings"
                  >
                    <Mail size={20} />
                  </button>
                  <button 
                    onClick={onExport}
                    className="p-3 bg-white border border-indigo-100 rounded-2xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                    title="Export Leads CSV"
                  >
                    <Download size={20} />
                  </button>
                </div>
                
                <div className="h-8 w-px bg-luxury-dark/5 hidden sm:block mx-1" />

                <button 
                  onClick={onAddLead}
                  className="flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>        {/* Table View */}
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-luxury-dark/5">
                <th className="px-4 py-5 w-10">
                  <button 
                    onClick={toggleSelectAll}
                    className={`p-1.5 rounded-lg transition-colors ${selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? 'bg-luxury-dark text-white' : 'bg-gray-100 text-gray-400 hover:text-luxury-dark'}`}
                  >
                    {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30 whitespace-nowrap">Lead & Events</th>
                <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30 whitespace-nowrap">Follow-up</th>
                <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30 whitespace-nowrap">Status & Owner</th>
                <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              <AnimatePresence mode="popLayout">
                {filteredLeads.flatMap((lead) => {
                  const lastTwoInteractions = (lead.history || [])
                    .filter(h => ['call', 'whatsapp', 'email', 'visit', 'remark', 'followup'].includes(h.type))
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 2);
                  const items = [
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={`lead-${lead.id}`} 
                      className={`group hover:bg-luxury-dark/5 transition-colors ${selectedLeadIds.includes(lead.id) ? 'bg-luxury-gold/5' : lead.status === 'new' ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-4 py-6 transition-all">
                        <button 
                          onClick={() => toggleLeadSelection(lead.id)}
                          className={`p-1.5 rounded-lg transition-all ${selectedLeadIds.includes(lead.id) ? 'bg-luxury-dark text-white scale-110' : 'bg-gray-50 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-luxury-dark'}`}
                        >
                          {selectedLeadIds.includes(lead.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
                    {/* Unified Lead Info (3 Rows) */}
                    <td className="px-4 py-6 min-w-[320px] lg:min-w-[400px]">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 lg:gap-x-6 gap-y-3">
                        {/* Row 1 */}
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-serif text-[10px] font-black shrink-0 ${lead.status === 'new' ? 'bg-blue-600 text-white' : 'bg-luxury-dark/5 text-luxury-dark/20'}`}>
                            {lead.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-serif font-black text-luxury-dark truncate max-w-[80px] lg:max-w-[100px]">{lead.name}</h4>
                            {isPast(new Date(lead.followUpDate || '')) && !isToday(new Date(lead.followUpDate || '')) && lead.status !== 'converted' && lead.status !== 'lost' && (
                              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" title="Follow-up Overdue!"></span>
                            )}
                            {differenceInHours(new Date(), getSafeDate(lead.createdAt)) < 24 && lead.status === 'new' && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {editingDetail?.id === lead.id && editingDetail?.field === 'bookingDate' ? (
                            <input 
                              type="date"
                              autoFocus
                              value={editDetailValue}
                              onChange={(e) => setEditDetailValue(e.target.value)}
                              onBlur={() => handleUpdateDetail(lead.id, 'bookingDate', editDetailValue)}
                              className="text-[9px] bg-gray-50 border border-luxury-gold/30 rounded px-1.5 py-0.5 outline-none w-full"
                            />
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingDetail({ id: lead.id, field: 'bookingDate' });
                                setEditDetailValue(lead.bookingDate || '');
                              }}
                              className="flex flex-col gap-0 group/dbdate"
                            >
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-luxury-dark/70 group-hover/dbdate:text-luxury-gold cursor-pointer transition-colors leading-none">
                                <Calendar size={12} className="text-luxury-gold shrink-0" />
                                {lead.bookingDate ? format(new Date(lead.bookingDate), 'MMM dd') : <span className="text-luxury-gold/40 italic">Date</span>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            lead.source === 'meta' ? 'bg-blue-50 text-blue-600' :
                            lead.source === 'google_sheets' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-luxury-dark/5 text-luxury-dark/40'
                          }`}>
                            {lead.source === 'meta' && <Facebook size={9} />}
                            {lead.source === 'google_sheets' && <FileSpreadsheet size={9} />}
                            {lead.source || 'Direct'}
                          </span>
                        </div>


                        {/* Row 2 */}
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              const cleanPhone = lead.phone.replace(/\D/g, '');
                              window.open(`https://wa.me/${cleanPhone}`, '_blank');
                            }}
                            className="flex items-center gap-2 text-[11px] text-luxury-dark/40 hover:text-green-600 transition-colors font-bold pl-1"
                          >
                            <Phone size={12} className="shrink-0" /> {lead.phone}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingDetail?.id === lead.id && editingDetail?.field === 'guests' ? (
                            <input 
                              type="text"
                              autoFocus
                              placeholder="Num..."
                              value={editDetailValue}
                              onChange={(e) => setEditDetailValue(e.target.value)}
                              onBlur={() => handleUpdateDetail(lead.id, 'guests', editDetailValue)}
                              className="text-[10px] bg-gray-50 border border-luxury-gold/30 rounded px-1.5 py-0.5 outline-none w-full"
                            />
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingDetail({ id: lead.id, field: 'guests' });
                                setEditDetailValue(lead.guests || '');
                              }}
                              className="flex items-center gap-2 text-[11px] font-medium text-luxury-dark/50 hover:text-luxury-gold cursor-pointer transition-colors"
                            >
                              <Users size={14} className="shrink-0 text-luxury-gold" /> 
                              {lead.guests || <span className="text-luxury-gold/30 italic">Add Guests</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest leading-none">
                            <Calendar size={12} className="shrink-0 text-luxury-dark/20" />
                            {lead.createdAt ? format(getSafeDate(lead.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                          {lead.createdAt && (
                            <span className={`text-[9px] font-black ml-5 uppercase tracking-[0.05em] leading-none ${
                              ['Friday', 'Saturday'].includes(format(getSafeDate(lead.createdAt), 'EEEE'))
                              ? 'text-red-500/60'
                              : 'text-luxury-dark/20'
                            }`}>
                              {format(getSafeDate(lead.createdAt), 'EEEE')}
                            </span>
                          )}
                        </div>

                        {/* Row 3 */}
                        <div className="flex items-center gap-3 max-w-[150px] overflow-hidden">
                          {lead.email ? (
                            <button 
                              onClick={() => {
                                onReply('email', lead.email, lead.name, lead.id);
                              }}
                              className="flex items-center gap-2 text-[11px] text-blue-600 hover:text-blue-700 transition-colors font-bold pl-1 truncate"
                            >
                              <Mail size={12} className="shrink-0 text-red-500" /> {lead.email}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-[11px] text-luxury-dark/20 font-bold pl-1 italic">
                              <Mail size={12} className="shrink-0 text-red-500/30" /> No email
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {editingDetail?.id === lead.id && editingDetail?.field === 'budget' ? (
                            <input 
                              type="text"
                              autoFocus
                              placeholder="Amt..."
                              value={editDetailValue}
                              onChange={(e) => setEditDetailValue(e.target.value)}
                              onBlur={() => handleUpdateDetail(lead.id, 'budget', editDetailValue)}
                              className="text-[10px] bg-gray-50 border border-luxury-gold/30 rounded px-1.5 py-0.5 outline-none w-full"
                            />
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingDetail({ id: lead.id, field: 'budget' });
                                setEditDetailValue(lead.budget || '');
                              }}
                              className="flex items-center gap-2 text-[11px] font-medium text-luxury-dark/50 hover:text-luxury-gold cursor-pointer transition-colors"
                            >
                              <IndianRupee size={14} className="shrink-0 text-luxury-gold" /> 
                              {lead.budget || <span className="text-luxury-gold/30 italic">Add Budget</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-luxury-dark/50 uppercase tracking-widest whitespace-nowrap">
                          <Clock size={12} className="shrink-0 text-blue-500" />
                          {lead.createdAt ? format(getSafeDate(lead.createdAt), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                        </div>
                      </div>
                    </td>

                    {/* Interaction Summary (Latest Follow-up only) */}
                    <td className="px-4 py-6 min-w-[280px]">
                      <div className="flex flex-col gap-3">
                        <div className="space-y-2">
                          {lastTwoInteractions.slice(0, 1).map((log) => (
                            <div key={log.id} className="flex flex-col gap-1 border-l-2 border-luxury-gold pl-3 py-1 bg-luxury-dark/5 rounded-r-xl">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-luxury-dark/40">
                                  {log.type === 'followup' ? <Clock size={9} className="text-indigo-500" /> : <MessageSquare size={9} className="text-amber-500" />}
                                  <span>{format(new Date(log.timestamp), 'dd MMM, HH:mm')}</span>
                                </div>
                                <span className="text-[8px] font-black text-luxury-gold uppercase tracking-tighter">Latest Remark</span>
                              </div>
                              <p className="text-[10px] font-medium leading-relaxed text-luxury-dark line-clamp-2 italic">
                                {log.content.replace(/^Updated remarks:\s*/i, '')}
                              </p>
                            </div>
                          ))}
                          {lastTwoInteractions.length === 0 && (
                            <div className="flex flex-col gap-0.5 border-l-2 border-luxury-dark/5 pl-3 py-2 bg-gray-50 rounded-r-xl">
                              <p className="text-[10px] text-luxury-dark/30 italic font-medium">
                                {lead.remarks || 'No interaction history yet...'}
                              </p>
                            </div>
                          )}

                          {/* Next Follow-up Reminder */}
                          {lead.followUpDate && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100/50">
                              <Calendar size={10} className="text-orange-500" />
                              <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Next: {format(new Date(lead.followUpDate), 'dd MMM')} at {lead.followUpTime || '10:00'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Switcher */}
                    <td className="px-4 py-6 min-w-[150px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="relative">
                          <select 
                            value={lead.status || 'new'} 
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            disabled={isUpdating === lead.id}
                            className={`w-full text-[9px] font-black uppercase tracking-[0.15em] border-none rounded-xl px-3 py-2 appearance-none outline-none transition-all shadow-md cursor-pointer ${
                              lead.status === 'converted' ? 'bg-[#10B981] text-white' :
                              lead.status === 'contacted' ? 'bg-[#3B82F6] text-white' :
                              lead.status === 'lost' ? 'bg-red-500 text-white' :
                               'bg-[#F59E0B] text-white'
                            }`}
                          >
                            <option value="new" className="bg-white text-luxury-dark">New</option>
                            <option value="contacted" className="bg-white text-luxury-dark">Contacted</option>
                            <option value="converted" className="bg-white text-luxury-dark">Converted</option>
                            <option value="lost" className="bg-white text-luxury-dark">Lost</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
                          <UserPlus size={9} className="text-indigo-600 shrink-0" />
                          <span className="text-[8px] font-bold text-luxury-dark/40 uppercase tracking-widest truncate">
                            {lead.assignedAgentName || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-6 text-right min-w-[200px]">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadForFollowUp(lead);
                            setIsFollowUpDrawerOpen(true);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-luxury-dark text-white rounded-xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-md"
                        >
                          <Zap size={11} className="fill-current" />
                          <span>Add Follow-up</span>
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeadForLog(lead);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white text-luxury-dark/60 border border-luxury-dark/10 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-luxury-dark hover:text-white transition-all shadow-sm"
                        >
                          <History size={11} />
                          <span>View Log</span>
                        </button>

                        <button 
                          onClick={() => onDeleteLead(lead.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={11} />
                          <span>Delete Lead</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ];

                return items;
              })}
            </AnimatePresence>
            </tbody>
          </table>
          
          {filteredLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-luxury-dark/20">
              <ClipboardList size={64} className="mb-4 opacity-50" />
              <p className="text-xl font-serif">No leads found in this category.</p>
              <p className="text-sm font-medium mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4"
          >
            <div className="bg-luxury-dark text-white p-4 rounded-[2rem] shadow-2xl shadow-luxury-dark/40 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-4 px-4 border-r border-white/10 pr-6">
                <div className="w-10 h-10 bg-luxury-gold text-luxury-dark rounded-full flex items-center justify-center font-black">
                  {selectedLeadIds.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-white/90">Leads Selected</span>
                  <button 
                    onClick={() => setSelectedLeadIds([])}
                    className="text-[10px] text-luxury-gold hover:underline font-bold text-left"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Status Bulk Update */}
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl">
                  {['contacted', 'converted', 'lost'].map((s) => (
                    <button
                      key={s}
                      disabled={isBulkProcessing}
                      onClick={() => handleBulkStatusUpdate(s)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        s === 'converted' ? 'hover:bg-emerald-500 hover:text-white' :
                        s === 'contacted' ? 'hover:bg-blue-500 hover:text-white' :
                        'hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      Set {s}
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Agent Assignment */}
                <div className="relative group">
                  <button 
                    disabled={isBulkProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <UserPlus size={14} className="text-luxury-gold" />
                    <span>Assign Agent</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white text-luxury-dark rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 border border-luxury-dark/5 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30">Select Agent</span>
                    </div>
                    {agents.map((agent) => (
                      <button
                        key={agent.uid}
                        onClick={() => handleBulkAssign(agent.uid, agent.displayName)}
                        className="w-full text-left px-4 py-2 text-[11px] font-bold hover:bg-luxury-gold/10 hover:text-luxury-gold transition-colors flex items-center justify-between"
                      >
                        {agent.displayName}
                        <ChevronRight size={12} />
                      </button>
                    ))}
                    {agents.length === 0 && <p className="px-4 py-2 text-[10px] text-gray-400 italic">No agents found</p>}
                  </div>
                </div>

                <button 
                  onClick={handleBulkDelete}
                  disabled={isBulkProcessing}
                  className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all ml-2"
                  title="Bulk Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="px-4">
                {isBulkProcessing ? (
                  <Loader2 size={20} className="text-luxury-gold animate-spin" />
                ) : (
                  <div className="w-10" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Tech Follow-up Modal (Popup) */}
      <AnimatePresence>
        {isFollowUpDrawerOpen && selectedLeadForFollowUp && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFollowUpDrawerOpen(false)}
              className="absolute inset-0 bg-luxury-dark/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-luxury-dark/5"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-luxury-dark/5 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Clock size={18} />
                  </div>
                  <h5 className="text-[13px] font-black uppercase tracking-[0.2em] text-luxury-dark">Add New Follow-up</h5>
                </div>
                <button 
                  onClick={() => setIsFollowUpDrawerOpen(false)}
                  className="p-2 hover:bg-red-50 text-luxury-dark/20 hover:text-red-500 rounded-xl transition-all"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-luxury-dark/5 rounded-2xl">
                  <div className="w-12 h-12 bg-luxury-dark text-white rounded-xl flex items-center justify-center font-serif text-xl font-black">
                    {selectedLeadForFollowUp.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-luxury-dark">{selectedLeadForFollowUp.name}</h4>
                    <p className="text-[10px] text-luxury-dark/40 font-bold uppercase tracking-widest leading-none mt-1">{selectedLeadForFollowUp.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30 ml-2">Reminder Date</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" />
                        <input 
                          type="date"
                          value={editDetailValue || format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                          onChange={(e) => setEditDetailValue(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-luxury-dark/10 rounded-2xl text-xs font-bold shadow-sm outline-none focus:border-luxury-gold transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30 ml-2">Reminder Time</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" />
                        <input 
                          type="time"
                          value={selectedLeadForFollowUp.followUpTime || '10:00'}
                          onChange={(e) => {
                            const time = e.target.value;
                            setSelectedLeadForFollowUp(prev => prev ? {...prev, followUpTime: time} : null);
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-luxury-dark/10 rounded-2xl text-xs font-bold shadow-sm outline-none focus:border-luxury-gold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30 ml-2">Interaction Remark</label>
                    <textarea 
                      placeholder="Enter follow-up remarks..."
                      className="w-full p-5 bg-gray-50 border border-luxury-dark/5 rounded-3xl text-sm outline-none h-32 focus:ring-1 focus:ring-luxury-gold transition-all shadow-inner resize-none"
                      value={remarksValue}
                      onChange={(e) => setRemarksValue(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-luxury-dark/5 flex gap-4">
                <button 
                  onClick={() => setIsFollowUpDrawerOpen(false)}
                  className="flex-1 py-3.5 bg-white border border-luxury-dark/10 text-luxury-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!remarksValue) {
                      showToast('Please add some remarks', 'error');
                      return;
                    }
                    setIsUpdating(selectedLeadForFollowUp.id);
                    try {
                      // Log history with type
                      await addHistoryEntry(
                        selectedLeadForFollowUp.id, 
                        'followup', 
                        remarksValue, 
                        'none'
                      );

                      // Update follow-up date/time and remarks in main lead object
                      const updates: any = {
                        followUpRemarks: remarksValue,
                        followUpDate: editDetailValue,
                        followUpTime: selectedLeadForFollowUp.followUpTime || '10:00',
                        status: 'contacted'
                      };

                      await updateDoc(doc(db, 'leads', selectedLeadForFollowUp.id), updates);

                      // Create automated notification record for the assigned user
                      try {
                        await addDoc(collection(db, 'notifications'), {
                          type: 'followup_scheduled',
                          title: 'Follow-up Scheduled',
                          message: `New follow-up for ${selectedLeadForFollowUp.name} on ${editDetailValue} at ${updates.followUpTime}`,
                          leadId: selectedLeadForFollowUp.id,
                          assignedAgent: selectedLeadForFollowUp.assignedAgent || null,
                          createdAt: serverTimestamp()
                        });
                      } catch (notifErr) {
                        console.warn('Silent failure logging notification:', notifErr);
                      }
                      
                      showToast('Follow-up Scheduled Successfully', 'success');
                      setRemarksValue('');
                      setIsFollowUpDrawerOpen(false);
                    } catch (err) {
                      showToast('Failed to log follow-up', 'error');
                    } finally {
                      setIsUpdating(null);
                    }
                  }}
                  disabled={!!isUpdating}
                  className="flex-[2] py-3.5 bg-luxury-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-luxury-dark/20 hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Schedule Follow-up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Follow-up History Modal */}
      <AnimatePresence>
        {selectedLeadForLog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadForLog(null)}
              className="absolute inset-0 bg-luxury-dark/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-luxury-dark/5"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-luxury-dark/5 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <MessageSquare size={18} />
                  </div>
                  <h5 className="text-[13px] font-black uppercase tracking-[0.2em] text-luxury-dark">FOLLOW-UP HISTORY</h5>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedLeadForLog.history?.length || 0} ENTRIES
                  </span>
                  <button 
                    onClick={() => setSelectedLeadForLog(null)}
                    className="p-2.5 hover:bg-red-50 text-luxury-dark/20 hover:text-red-500 rounded-xl transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Lead Info Summary */}
              <div className="px-8 py-4 bg-white border-b border-luxury-dark/5 flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-luxury-dark text-white rounded-xl flex items-center justify-center text-lg font-black font-serif">
                    {selectedLeadForLog.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-luxury-dark">{selectedLeadForLog.name}</h4>
                    <p className="text-[10px] text-luxury-dark/40 font-bold uppercase tracking-widest">{selectedLeadForLog.phone}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-luxury-dark/5" />
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-luxury-dark/30 uppercase tracking-widest">Current Status</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      selectedLeadForLog.status === 'converted' ? 'text-emerald-500' :
                      selectedLeadForLog.status === 'contacted' ? 'text-blue-500' :
                      'text-orange-500'
                    }`}>{selectedLeadForLog.status}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-luxury-dark/30 uppercase tracking-widest">Assigned To</span>
                    <span className="text-[10px] font-black text-luxury-dark uppercase tracking-widest">{selectedLeadForLog.assignedAgentName || 'Unassigned'}</span>
                  </div>
                  {selectedLeadForLog.followUpDate && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl">
                      <div className="p-1.5 bg-orange-500 text-white rounded-lg">
                        <Calendar size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Next Follow-up</span>
                        <span className="text-[10px] font-black text-luxury-dark whitespace-nowrap">
                          {format(new Date(selectedLeadForLog.followUpDate), 'dd MMM, yyyy')} at {selectedLeadForLog.followUpTime || '10:00'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Body: History Table */}
              <div className="flex-grow overflow-y-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 border-b border-luxury-dark/5">DATE & TIME</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 border-b border-luxury-dark/5">STAGE</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 border-b border-luxury-dark/5">REMINDER</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 border-b border-luxury-dark/5">USER</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 border-b border-luxury-dark/5">REMARK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-dark/5">
                    {selectedLeadForLog.history ? (
                      selectedLeadForLog.history.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-luxury-dark group-hover:text-luxury-gold transition-colors">{format(new Date(log.timestamp), 'dd/MM/yyyy')}</span>
                              <span className="text-[10px] font-bold text-luxury-dark/40">{format(new Date(log.timestamp), 'HH:mm')}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${
                              log.type === 'status' ? 'bg-blue-50 text-blue-600' :
                              log.type === 'remark' ? 'bg-amber-50 text-amber-600' :
                              log.type === 'followup' ? 'bg-indigo-50 text-indigo-600' :
                              log.type === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' :
                              log.type === 'call' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-400'
                            }`}>
                              {log.type === 'status' ? 'MODIFICATION' : 
                               log.type === 'remark' ? 'FRESH' : 
                               log.type === 'followup' ? 'FOLLOWUP' : log.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            {log.reminderDate ? (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                  <Calendar size={14} className="text-orange-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-orange-600">{format(new Date(log.reminderDate), 'dd MMM')}</span>
                                  <span className="text-[10px] font-bold text-orange-400">{log.reminderTime || '10:00'}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-luxury-dark/20 font-serif italic">-</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black border border-orange-100 shadow-sm">
                                {log.user.charAt(0)}
                              </div>
                              <span className="text-xs font-black text-luxury-dark uppercase tracking-widest">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 max-w-md">
                            <p className="text-[11px] text-luxury-dark/60 font-medium italic border-l-2 border-luxury-dark/5 pl-4 py-1">
                              {log.content.replace(/^Updated remarks:\s*/i, '')}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <History size={48} className="mx-auto mb-4 text-luxury-dark/10" />
                          <p className="text-sm font-serif italic text-luxury-dark/30">No history entries found for this lead.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50/50 border-t border-luxury-dark/5 flex justify-end">
                <button 
                  onClick={() => setSelectedLeadForLog(null)}
                  className="px-8 py-2.5 bg-luxury-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-luxury-dark/20 hover:bg-luxury-gold hover:text-luxury-dark transition-all"
                >
                  Close History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
