import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  CalendarClock, 
  History, 
  Trash2, 
  Square, 
  CheckSquare, 
  Flame, 
  User, 
  Calendar,
  AlertTriangle,
  Clock,
  MapPin,
  Check,
  Edit2
} from 'lucide-react';
import { Lead, LeadStatus, LeadPriority, TenantUser } from '../types';

interface Props {
  leads: Lead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdateDetail: (id: string, field: keyof Lead, value: any) => void;
  onOpenFollowUp: (lead: Lead) => void;
  onOpenHistory: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onQuickWhatsApp: (lead: Lead) => void;
  teamMembers: TenantUser[];
  onBulkUpdateStatus?: (status: LeadStatus) => void;
  onBulkDelete?: () => void;
}

export const SaaSTableView: React.FC<Props> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onUpdateStatus,
  onUpdateDetail,
  onOpenFollowUp,
  onOpenHistory,
  onDeleteLead,
  onQuickWhatsApp,
  teamMembers,
  onBulkUpdateStatus,
  onBulkDelete,
}) => {
  const [editingDetail, setEditingDetail] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="bg-white rounded-3xl border border-luxury-dark/10 shadow-sm overflow-hidden">
      
      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-luxury-dark text-white px-6 py-3 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="bg-white/20 px-2.5 py-1 rounded-lg">
              {selectedIds.length} leads selected
            </span>
            <button 
              onClick={onClearSelection}
              className="text-white/70 hover:text-white underline text-[11px]"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onBulkUpdateStatus && (
              <>
                <button
                  onClick={() => onBulkUpdateStatus('converted')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Mark Won / Converted
                </button>
                <button
                  onClick={() => onBulkUpdateStatus('lost')}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Mark Lost
                </button>
              </>
            )}

            {onBulkDelete && (
              <button
                onClick={onBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[10px] font-black uppercase tracking-wider text-gray-400">
              <th className="py-3 px-4 w-10">
                <button 
                  onClick={onSelectAll}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="py-3 px-4 min-w-[280px]">Customer & Inquiry Info</th>
              <th className="py-3 px-4 min-w-[130px]">Status</th>
              <th className="py-3 px-4 min-w-[100px]">Priority / Score</th>
              <th className="py-3 px-4 min-w-[110px]">Source</th>
              <th className="py-3 px-4 min-w-[160px]">Next Follow-Up</th>
              <th className="py-3 px-4 min-w-[140px]">Assigned Agent</th>
              <th className="py-3 px-4 text-right min-w-[150px]">Quick Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-xs">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400 text-xs">
                  No matching leads found. Adjust your filters or click &quot;Capture New Lead&quot;.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                const overdue = isOverdue(lead.followUpDate) && lead.status !== 'converted' && lead.status !== 'lost';

                return (
                  <tr 
                    key={lead.id}
                    className={`hover:bg-gray-50/80 transition-colors group ${
                      isSelected ? 'bg-amber-50/30' : lead.status === 'new' ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => onToggleSelect(lead.id)}
                        className={`transition-colors ${isSelected ? 'text-luxury-dark' : 'text-gray-300 group-hover:text-gray-500'}`}
                      >
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* Customer 3-Row Block */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        
                        {/* Row 1: Name, Overdue Pulse, Occasion */}
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                            lead.status === 'converted' 
                              ? 'bg-emerald-600' 
                              : lead.status === 'hot' 
                              ? 'bg-orange-600' 
                              : 'bg-luxury-dark'
                          }`}>
                            {lead.name.charAt(0) || '?'}
                          </div>
                          
                          <span 
                            onClick={() => onOpenHistory(lead)}
                            className="font-serif font-black text-xs text-luxury-dark hover:underline cursor-pointer"
                          >
                            {lead.name}
                          </span>

                          {overdue && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" title="Follow-up overdue!" />
                          )}

                          {lead.occasion && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {lead.occasion}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Target Booking Date & Guests & Budget */}
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          {editingDetail?.id === lead.id && editingDetail?.field === 'bookingDate' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="date"
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => {
                                  onUpdateDetail(lead.id, 'bookingDate', editValue);
                                  setEditingDetail(null);
                                }}
                                className="text-[10px] border border-gray-300 rounded px-1 py-0.5"
                              />
                            </div>
                          ) : (
                            <span 
                              onClick={() => {
                                setEditingDetail({ id: lead.id, field: 'bookingDate' });
                                setEditValue(lead.bookingDate || '');
                              }}
                              title="Click to change booking date"
                              className="hover:text-luxury-dark cursor-pointer flex items-center gap-1"
                            >
                              <Calendar size={11} className="text-gray-400" />
                              <span>{lead.bookingDate || 'Set target date'}</span>
                            </span>
                          )}

                          {lead.guests && (
                            <span>• {lead.guests}</span>
                          )}

                          {lead.budget && (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                              {lead.budget}
                            </span>
                          )}
                        </div>

                        {/* Row 3: Phone & Email & City */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                          <a href={`tel:${lead.phone}`} className="hover:text-indigo-600 transition-colors">
                            {lead.phone}
                          </a>
                          {lead.email && (
                            <>
                              <span>•</span>
                              <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition-colors truncate max-w-[140px]">
                                {lead.email}
                              </a>
                            </>
                          )}
                          {lead.city && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500 font-sans">{lead.city}</span>
                            </>
                          )}
                        </div>

                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer border ${
                          lead.status === 'new'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lead.status === 'contacted'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : lead.status === 'quotation_sent'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : lead.status === 'hot'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : lead.status === 'converted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        <option value="new">🆕 New</option>
                        <option value="contacted">📞 Contacted</option>
                        <option value="quotation_sent">📑 Quotation</option>
                        <option value="hot">🔥 Hot</option>
                        <option value="converted">🏆 Won</option>
                        <option value="lost">❌ Lost</option>
                      </select>
                    </td>

                    {/* Priority & Score */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block w-fit ${
                          lead.priority === 'high'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : lead.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          {lead.priority || 'medium'}
                        </span>

                        {lead.score === 'HOT' && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600">
                            <Flame size={10} /> HOT LEAD
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {lead.source}
                      </span>
                    </td>

                    {/* Next Follow-Up */}
                    <td className="py-4 px-4">
                      <div 
                        onClick={() => onOpenFollowUp(lead)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          overdue
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : lead.followUpDate
                            ? 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            : 'border-dashed border-gray-200 text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {lead.followUpDate ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="flex items-center gap-1">
                                {overdue ? <AlertTriangle size={12} className="text-red-500" /> : <CalendarClock size={12} />}
                                {lead.followUpDate}
                              </span>
                              {lead.followUpTime && (
                                <span className="text-[10px] font-normal">{lead.followUpTime}</span>
                              )}
                            </div>
                            {lead.followUpRemarks && (
                              <p className="text-[10px] text-gray-500 truncate mt-0.5">{lead.followUpRemarks}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] flex items-center gap-1">
                            <Clock size={11} /> + Schedule
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-4 px-4">
                      <select
                        value={lead.assignedAgentName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = teamMembers.find(m => m.name === val);
                          onUpdateDetail(lead.id, 'assignedAgentName', val);
                          if (found) onUpdateDetail(lead.id, 'assignedAgent', found.id);
                        }}
                        className="text-[11px] bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer text-gray-700 w-full"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Button */}
                        <button
                          onClick={() => onQuickWhatsApp(lead)}
                          title="Open WhatsApp Chat"
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                        >
                          <MessageSquare size={14} />
                        </button>

                        {/* Call Button */}
                        <a
                          href={`tel:${lead.phone}`}
                          title="Call on Phone"
                          className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs"
                        >
                          <Phone size={14} />
                        </a>

                        {/* History / Audit Log */}
                        <button
                          onClick={() => onOpenHistory(lead)}
                          title="View Timeline History & Add Note"
                          className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-luxury-dark hover:text-white transition-all shadow-2xs"
                        >
                          <History size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          title="Delete Lead"
                          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
