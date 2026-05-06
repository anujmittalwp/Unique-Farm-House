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
  Facebook
} from 'lucide-react';
import { 
  db 
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
  getDocFromServer
} from 'firebase/firestore';
import { format, differenceInHours } from 'date-fns';
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
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'contacted' | 'converted' | 'lost'>('new');
  const [editingRemarks, setEditingRemarks] = useState<string | null>(null);
  const [remarksValue, setRemarksValue] = useState('');
  const [editingDetail, setEditingDetail] = useState<{id: string, field: string} | null>(null);
  const [editDetailValue, setEditDetailValue] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length,
    hot: leads.filter(l => l.score === 'HOT' || l.status === 'hot').length
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || lead.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = async (leadId: string, status: string) => {
    setIsUpdating(leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), { 
        status,
        statusUpdatedAt: serverTimestamp()
      });
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
    try {
      await updateDoc(doc(db, 'leads', leadId), { [field]: value });
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
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          {[
            { label: 'Total Enquiries', value: stats.total, icon: Users, color: 'text-luxury-dark' },
            { label: 'Fresh Leads', value: stats.new, icon: Zap, color: 'text-blue-600' },
            { label: 'Successful', value: stats.converted, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'High Priority', value: stats.hot, icon: TrendingUp, color: 'text-red-500' }
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
            <div className="flex bg-white p-1 rounded-2xl border border-luxury-dark/5 shadow-sm overflow-x-auto w-full max-w-fit">
              {[
                { id: 'all', label: 'All' },
                { id: 'new', label: 'New' },
                { id: 'contacted', label: 'Contacted' },
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
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-luxury-dark/5">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30">Lead Profile & Event Details</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30">Remarks</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30">Live Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              <AnimatePresence mode="popLayout">
                {filteredLeads.map((lead) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={lead.id} 
                    className={`group hover:bg-luxury-dark/5 transition-colors ${lead.status === 'new' ? 'bg-blue-50/30' : ''}`}
                  >
                    {/* Unified Lead Info (3 Rows) */}
                    <td className="px-6 py-6 min-w-[500px]">
                      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                        {/* Row 1 */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-black shrink-0 ${lead.status === 'new' ? 'bg-blue-600 text-white' : 'bg-luxury-dark/5 text-luxury-dark/20'}`}>
                            {lead.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-serif font-black text-luxury-dark truncate max-w-[120px]">{lead.name}</h4>
                            {differenceInHours(new Date(), lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)) < 24 && lead.status === 'new' && (
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
                              className="text-[10px] bg-gray-50 border border-luxury-gold/30 rounded px-1.5 py-0.5 outline-none w-full"
                            />
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingDetail({ id: lead.id, field: 'bookingDate' });
                                setEditDetailValue(lead.bookingDate || '');
                              }}
                              className="flex items-center gap-2 text-xs font-bold text-luxury-dark/70 hover:text-luxury-gold cursor-pointer transition-colors"
                            >
                              <Calendar size={14} className="text-luxury-gold shrink-0" />
                              {lead.bookingDate ? format(new Date(lead.bookingDate), 'MMM dd, yyyy') : <span className="text-luxury-gold/40 italic">Set Date</span>}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                            lead.source === 'meta' ? 'bg-blue-50 text-blue-600' :
                            lead.source === 'google_sheets' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-luxury-dark/5 text-luxury-dark/40'
                          }`}>
                            {lead.source === 'meta' && <Facebook size={10} />}
                            {lead.source === 'google_sheets' && <FileSpreadsheet size={10} />}
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

                        <div className="flex items-center gap-2 text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">
                          <Calendar size={12} className="shrink-0 text-luxury-dark/20" />
                          {lead.createdAt ? format(lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt), 'MMM dd, yyyy') : 'N/A'}
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
                          {lead.createdAt ? format(lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt), 'MMM dd, yyyy hh:mm a') : 'N/A'}
                        </div>
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="px-6 py-6 max-w-xs">
                      {editingRemarks === lead.id ? (
                        <div className="flex flex-col gap-2 animate-in slide-in-from-top-1">
                          <textarea
                            autoFocus
                            value={remarksValue}
                            onChange={(e) => setRemarksValue(e.target.value)}
                            onBlur={() => handleSaveRemarks(lead.id)}
                            placeholder="Type remarks..."
                            className="w-full p-3 bg-gray-50 border border-luxury-gold/30 rounded-xl text-[13px] outline-none h-24 shadow-inner resize-none focus:ring-1 focus:ring-luxury-gold transition-all"
                          />
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-luxury-gold/40 uppercase tracking-widest">
                              {isUpdating === lead.id ? 'Saving...' : 'Auto-saves on click away'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingRemarks(lead.id);
                            setRemarksValue(lead.remarks || '');
                          }}
                          className="group/row flex flex-col gap-1 cursor-pointer"
                        >
                          <p className="text-[13px] text-luxury-dark/60 leading-relaxed line-clamp-2">
                            {lead.remarks || <span className="text-luxury-dark/20 italic">Add remarks...</span>}
                          </p>
                          <span className="text-[9px] font-bold text-luxury-gold opacity-0 group-hover/row:opacity-100 transition-opacity uppercase tracking-widest">Click to Edit</span>
                        </div>
                      )}
                    </td>

                    {/* Status Switcher */}
                    <td className="px-6 py-6 min-w-[180px]">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold text-luxury-dark/30 uppercase tracking-widest ml-1">Update Status</label>
                        <div className="relative">
                          <select 
                            value={lead.status || 'new'} 
                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                            disabled={isUpdating === lead.id}
                            className={`w-full text-[10px] font-black uppercase tracking-[0.2em] border-none rounded-2xl px-5 py-3.5 appearance-none outline-none transition-all shadow-lg cursor-pointer ${
                              lead.status === 'converted' ? 'bg-[#10B981] text-white shadow-emerald-500/20' :
                              lead.status === 'contacted' ? 'bg-[#3B82F6] text-white shadow-blue-500/20' :
                              lead.status === 'lost' ? 'bg-red-500 text-white shadow-red-500/20' :
                               'bg-[#F59E0B] text-white shadow-amber-500/20'
                            }`}
                          >
                            <option value="new" className="bg-white text-luxury-dark">New</option>
                            <option value="contacted" className="bg-white text-luxury-dark">Contacted</option>
                            <option value="converted" className="bg-white text-luxury-dark">Converted</option>
                            <option value="lost" className="bg-white text-luxury-dark">Lost</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                            <ChevronRight size={14} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Quick Actions */}
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <a 
                          href="#" 
                          className="p-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            const cleanPhone = lead.phone.replace(/\D/g, '');
                            const msg = encodeURIComponent(`Hi ${lead.name}, this is Unique Farm House Noida. We received your enquiry! How can I help you?`);
                            window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
                          }}
                        >
                          <MessageCircle size={18} />
                        </a>
                        <button 
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-2.5 bg-luxury-dark/5 text-luxury-dark/30 hover:text-red-500 hover:bg-red-50 border border-luxury-dark/5 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
    </div>
  );
};
