import React, { useState } from 'react';
import { X, CalendarClock, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';
import { Lead } from '../types';

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (
    leadId: string,
    followUpDate: string,
    followUpTime: string,
    followUpType: 'call' | 'whatsapp' | 'email' | 'visit',
    followUpRemarks: string
  ) => Promise<void>;
}

export const SaaSFollowUpModal: React.FC<Props> = ({
  lead,
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:00 AM');
  const [type, setType] = useState<'call' | 'whatsapp' | 'email' | 'visit'>('call');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a follow-up date');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSchedule(lead.id, date, time, type, remarks);
      setRemarks('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule follow up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-luxury-dark/10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-luxury-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <CalendarClock size={20} className="text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base">Schedule Next Follow-Up</h3>
              <p className="text-xs text-white/70">Lead: {lead.name} ({lead.phone})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Channel selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-2">
              Follow-Up Channel
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('call')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'call'
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Phone size={16} />
                <span className="text-[10px]">Call</span>
              </button>

              <button
                type="button"
                onClick={() => setType('whatsapp')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <MessageSquare size={16} />
                <span className="text-[10px]">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setType('email')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'email'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Mail size={16} />
                <span className="text-[10px]">Email</span>
              </button>

              <button
                type="button"
                onClick={() => setType('visit')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  type === 'visit'
                    ? 'border-purple-600 bg-purple-50/80 text-purple-700 font-bold shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <MapPin size={16} />
                <span className="text-[10px]">Site Visit</span>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Follow-Up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Target Time
              </label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
              Reminder Purpose & Talking Points
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Discuss food catering preferences, clarify payment structure, confirm guest list count..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-indigo-600 rounded-xl p-3 outline-none resize-none"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-gray-400 font-bold">Quick:</span>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setDate(today);
                setTime('05:00 PM');
              }}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
            >
              Today Evening
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                setDate(tomorrow);
                setTime('11:00 AM');
              }}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
            >
              Tomorrow Morning
            </button>
            <button
              type="button"
              onClick={() => {
                const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
                setDate(in3Days);
              }}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors"
            >
              In 3 Days
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CalendarClock size={14} />
              <span>{isSubmitting ? 'Scheduling...' : 'Set Follow-Up Reminder'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
