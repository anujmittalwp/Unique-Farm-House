import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  CalendarClock, 
  AlertTriangle, 
  ChevronRight,
  User,
  History,
  MoreVertical
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';

interface Props {
  leads: Lead[];
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onOpenFollowUp: (lead: Lead) => void;
  onOpenHistory: (lead: Lead) => void;
  onQuickWhatsApp: (lead: Lead) => void;
}

const STAGES: { id: LeadStatus; label: string; color: string; border: string; bg: string }[] = [
  { id: 'new', label: 'New Inquiries', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50/50' },
  { id: 'contacted', label: 'Contacted', color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50/50' },
  { id: 'quotation_sent', label: 'Quotation Sent', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50/50' },
  { id: 'hot', label: 'Hot / In Negotiation', color: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50/50' },
  { id: 'converted', label: 'Won / Confirmed', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
  { id: 'lost', label: 'Lost', color: 'text-gray-500', border: 'border-gray-200', bg: 'bg-gray-50/50' },
];

export const SaaSPipelineView: React.FC<Props> = ({
  leads,
  onUpdateStatus,
  onOpenFollowUp,
  onOpenHistory,
  onQuickWhatsApp,
}) => {
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'new': return 'contacted';
      case 'contacted': return 'quotation_sent';
      case 'quotation_sent': return 'hot';
      case 'hot': return 'converted';
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter(l => l.status === stage.id);
        const stageTotalBudget = stageLeads.reduce((acc, l) => {
          const num = parseInt((l.budget || '').replace(/[^0-9]/g, ''), 10);
          return isNaN(num) ? acc : acc + num;
        }, 0);

        return (
          <div 
            key={stage.id} 
            className={`rounded-2xl border ${stage.border} ${stage.bg} p-3.5 flex flex-col min-w-[260px]`}
          >
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-black uppercase tracking-wider ${stage.color}`}>
                {stage.label}
              </span>
              <span className="text-xs font-black bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                {stageLeads.length}
              </span>
            </div>

            {stageTotalBudget > 0 && (
              <div className="text-[10px] font-bold text-gray-400 mb-3">
                Value: ₹{stageTotalBudget.toLocaleString('en-IN')}
              </div>
            )}

            {/* Cards container */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
              {stageLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs italic">
                  No leads in stage
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const overdue = isOverdue(lead.followUpDate) && lead.status !== 'converted' && lead.status !== 'lost';
                  const nextStage = getNextStage(lead.status);

                  return (
                    <div 
                      key={lead.id}
                      className="bg-white rounded-xl p-3 border border-gray-200 shadow-xs hover:shadow-md transition-all group relative"
                    >
                      {/* Priority strip */}
                      {lead.priority === 'high' && (
                        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-xl">
                          <div className="bg-red-500 text-white text-[8px] font-black uppercase py-0.5 text-center transform rotate-45 translate-x-2 -translate-y-0.5 w-12 shadow-2xs">
                            HOT
                          </div>
                        </div>
                      )}

                      {/* Header: Name & Phone */}
                      <div className="flex items-start justify-between mb-1.5 pr-4">
                        <div>
                          <h4 
                            onClick={() => onOpenHistory(lead)}
                            className="font-serif font-black text-xs text-luxury-dark hover:underline cursor-pointer"
                          >
                            {lead.name}
                          </h4>
                          <span className="text-[11px] font-mono text-gray-500">{lead.phone}</span>
                        </div>
                      </div>

                      {/* Occasion / City & Budget */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-gray-600 mb-2">
                        {lead.city && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-md font-medium">{lead.city}</span>
                        )}
                        {lead.budget && (
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                            {lead.budget}
                          </span>
                        )}
                        {lead.guests && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">{lead.guests}</span>
                        )}
                      </div>

                      {/* Follow-up reminder if any */}
                      {lead.followUpDate && (
                        <div 
                          onClick={() => onOpenFollowUp(lead)}
                          className={`text-[10px] p-1.5 rounded-lg mb-2 flex items-center justify-between cursor-pointer transition-colors ${
                            overdue 
                              ? 'bg-red-50 text-red-700 font-bold' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {overdue ? <AlertTriangle size={12} className="text-red-600" /> : <CalendarClock size={12} />}
                            <span>Follow: {lead.followUpDate}</span>
                          </div>
                          {lead.followUpTime && <span>{lead.followUpTime}</span>}
                        </div>
                      )}

                      {/* Footer: Agent & Quick Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 truncate max-w-[90px]">
                          <User size={10} />
                          <span className="truncate">{lead.assignedAgentName || 'Unassigned'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onQuickWhatsApp(lead)}
                            title="Chat on WhatsApp"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <MessageSquare size={13} />
                          </button>

                          <a
                            href={`tel:${lead.phone}`}
                            title="Call Customer"
                            className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Phone size={13} />
                          </a>

                          <button
                            onClick={() => onOpenHistory(lead)}
                            title="View History Timeline"
                            className="p-1 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <History size={13} />
                          </button>

                          {nextStage && (
                            <button
                              onClick={() => onUpdateStatus(lead.id, nextStage)}
                              title={`Advance to ${nextStage}`}
                              className="p-1 rounded-md bg-luxury-dark/5 hover:bg-luxury-dark hover:text-white text-luxury-dark transition-all"
                            >
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
