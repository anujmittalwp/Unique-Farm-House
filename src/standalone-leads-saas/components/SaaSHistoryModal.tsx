import React, { useState } from 'react';
import { 
  X, 
  History, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  FileText, 
  Bot, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Lead, ActivityLog } from '../types';

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (
    leadId: string,
    type: ActivityLog['type'],
    content: string,
    outcome: ActivityLog['outcome']
  ) => Promise<void>;
  currentUserName: string;
}

export const SaaSHistoryModal: React.FC<Props> = ({
  lead,
  isOpen,
  onClose,
  onAddActivity,
  currentUserName,
}) => {
  const [newType, setNewType] = useState<ActivityLog['type']>('call');
  const [newContent, setNewContent] = useState('');
  const [newOutcome, setNewOutcome] = useState<ActivityLog['outcome']>('positive');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddActivity(lead.id, newType, newContent.trim(), newOutcome);
      setNewContent('');
    } catch (err) {
      console.error(err);
      alert('Failed to add activity log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-indigo-600" />;
      case 'whatsapp': return <MessageSquare size={14} className="text-emerald-600" />;
      case 'email': return <Mail size={14} className="text-blue-600" />;
      case 'visit': return <MapPin size={14} className="text-purple-600" />;
      case 'automated': return <Bot size={14} className="text-gray-500" />;
      default: return <FileText size={14} className="text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-luxury-dark/10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-luxury-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <History size={18} className="text-luxury-gold" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base">Interaction History & Audit Log</h3>
              <p className="text-xs text-white/70">{lead.name} • {lead.phone}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Timeline of Events ({lead.history?.length || 0})
          </div>

          {(!lead.history || lead.history.length === 0) ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No previous activities recorded yet. Log the first one below!
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-100">
              {lead.history.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3 pl-1">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0 z-10 shadow-xs">
                    {getIcon(act.type)}
                  </div>
                  <div className="flex-1 bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-luxury-dark">{act.user}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-gray-200/70 text-gray-600">
                          {act.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(act.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{act.content}</p>

                    {act.outcome && act.outcome !== 'none' && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          act.outcome === 'positive' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : act.outcome === 'negative' 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {act.outcome === 'positive' && <CheckCircle size={10} />}
                          {act.outcome === 'negative' && <AlertCircle size={10} />}
                          Outcome: {act.outcome.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Log Form */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                Log New Interaction
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Logging as: <strong className="text-luxury-dark">{currentUserName}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none"
              >
                <option value="call">📞 Phone Call</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="email">✉️ Email</option>
                <option value="visit">🏡 Property Tour</option>
                <option value="remark">📝 Note / Remark</option>
              </select>

              <select
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value as any)}
                className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 outline-none"
              >
                <option value="positive">🟢 Positive Interest</option>
                <option value="neutral">🟡 Neutral / Thinking</option>
                <option value="negative">🔴 Negative / Objections</option>
                <option value="none">⚪ Neutral Log</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Log notes about this interaction..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="px-4 py-2.5 bg-luxury-dark hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Send size={12} />
                <span>Log</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
