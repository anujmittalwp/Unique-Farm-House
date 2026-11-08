import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { Lead, LeadPriority, LeadStatus, TenantUser } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  teamMembers: TenantUser[];
  companyId: string;
}

export const SaaSAddLeadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  teamMembers,
  companyId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('Direct Website');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [priority, setPriority] = useState<LeadPriority>('medium');
  const [budget, setBudget] = useState('');
  const [guests, setGuests] = useState('');
  const [city, setCity] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('12:00 PM');
  const [occasion, setOccasion] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide at least Name and Phone number.');
      return;
    }

    const assigned = teamMembers.find(m => m.id === assignedAgent);

    setIsSubmitting(true);
    try {
      await onSubmit({
        companyId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        source,
        status,
        priority,
        score: priority === 'high' ? 'HOT' : 'WARM',
        budget: budget.trim(),
        guests: guests.trim(),
        city: city.trim(),
        bookingDate,
        bookingTime,
        occasion: occasion.trim(),
        assignedAgent: assigned?.id,
        assignedAgentName: assigned?.name,
        remarks: remarks.trim(),
        tags: occasion ? [occasion] : [],
      });
      // reset
      setName('');
      setPhone('');
      setEmail('');
      setBudget('');
      setGuests('');
      setCity('');
      setRemarks('');
      setOccasion('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-luxury-dark/10">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-white flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-luxury-dark">Capture New Lead</h3>
              <p className="text-xs text-gray-500">Record customer inquiry & assign to sales team</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Row 1: Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Rathore"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-luxury-dark rounded-xl px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-luxury-dark rounded-xl px-3 py-2.5 outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 2: Email & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-luxury-dark rounded-xl px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-luxury-dark rounded-xl px-3 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Row 3: Source & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Lead Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="Direct Website">Direct Website</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Instagram">Meta Instagram</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="OTA">OTA / Channel</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer font-medium"
              >
                <option value="new">🆕 New</option>
                <option value="contacted">📞 Contacted</option>
                <option value="quotation_sent">📑 Quotation Sent</option>
                <option value="hot">🔥 Hot / Negotiation</option>
                <option value="converted">🏆 Converted / Won</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer font-medium"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Row 4: Budget & Guests & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Budget (INR)
              </label>
              <input
                type="text"
                placeholder="₹ 75,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Guest Count
              </label>
              <input
                type="text"
                placeholder="10-15 Guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Occasion / Purpose
              </label>
              <input
                type="text"
                placeholder="Birthday, Wedding, Offsite"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Row 5: Booking Date & Assigned Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Target Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
                Assign Sales Executive
              </label>
              <select
                value={assignedAgent}
                onChange={(e) => setAssignedAgent(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Remarks / Client Notes */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1">
              Customer Requirements & Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Wants poolside barbecue, early check-in, 3 bedrooms with mountain view..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 focus:border-luxury-dark rounded-xl p-3 outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold bg-luxury-dark hover:bg-black text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles size={14} className="text-luxury-gold" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Capture Lead'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
