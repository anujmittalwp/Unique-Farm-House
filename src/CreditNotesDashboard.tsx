import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Plus, X, Search, FileText } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, getFirestore, doc, setDoc, getDoc, arrayUnion, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const CreditNotesDashboard = ({ creditNotes, showToast }: { creditNotes: any[], showToast: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemCN, setRedeemCN] = useState<any>(null);
  const [bookingId, setBookingId] = useState('');
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBookingSuggestions, setShowBookingSuggestions] = useState(false);
  const [localBookings, setLocalBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocalBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };
    fetchBookings();
  }, []);

  const filteredNotes = creditNotes.filter(cn => {
    const codeMatch = cn.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = cn.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mobileStr = cn.customerMobile != null ? String(cn.customerMobile) : '';
    const mobileMatch = mobileStr.includes(searchTerm);
    return codeMatch || nameMatch || mobileMatch;
  });

  const suggestedBookings = localBookings.filter(b => {
    if (!bookingId || bookingId.length < 2) return false;
    if (['cancelled', 'abandoned'].includes(b.status)) return false; 
    const search = bookingId.toLowerCase();
    return (
      (b.id && b.id.toLowerCase().includes(search)) ||
      (b.name && b.name.toLowerCase().includes(search)) ||
      (b.phone && String(b.phone).includes(search))
    );
  }).slice(0, 5);

  const handleRedeem = async () => {
    if (!bookingId || redeemAmount <= 0 || !redeemCN) {
       showToast('Please provide valid booking ID and amount', 'error');
       return;
    }
    if (redeemAmount > redeemCN.balance) {
       showToast('Redeem amount cannot exceed available balance', 'error');
       return;
    }
    setIsProcessing(true);
    try {
      let targetBookingRef;
      let targetBookingSnap;
      
      const cleanBookingId = bookingId.trim();
      if (cleanBookingId.length < 15) {
         const bookingsSnap = await getDocs(collection(db, 'bookings'));
         const foundDoc = bookingsSnap.docs.find(d => d.id.startsWith(cleanBookingId));
         if (foundDoc) {
             targetBookingRef = doc(db, 'bookings', foundDoc.id);
             targetBookingSnap = foundDoc;
         } else {
             showToast('Booking ID not found', 'error');
             setIsProcessing(false);
             return;
         }
      } else {
         targetBookingRef = doc(db, 'bookings', cleanBookingId);
         targetBookingSnap = await getDoc(targetBookingRef);
         if (!targetBookingSnap.exists()) {
             showToast('Booking ID not found', 'error');
             setIsProcessing(false);
             return;
         }
      }
      
      const cnRef = doc(db, 'credit_notes', redeemCN.id);
      const newBalance = redeemCN.balance - redeemAmount;
      const historyEntry = {
        amount: redeemAmount,
        bookingId: targetBookingRef.id,
        date: new Date().toISOString()
      };
      
      const paymentEntry = {
        amount: redeemAmount,
        note: `Redeemed Credit Note: ${redeemCN.code}`,
        date: new Date().toISOString().split('T')[0]
      };
      
      const currentPayments = targetBookingSnap.data().payments || [];
      const currentPaid = targetBookingSnap.data().amountPaid || 0;
      
      // Update Booking
      await setDoc(targetBookingRef, {
        payments: [...currentPayments, paymentEntry],
        amountPaid: currentPaid + redeemAmount
      }, { merge: true });
      
      // Update Credit Note
      await setDoc(cnRef, {
        balance: newBalance,
        status: newBalance <= 0 ? 'exhausted' : 'active',
        history: arrayUnion(historyEntry)
      }, { merge: true });
      
      showToast('Credit Note successfully redeemed and applied to booking', 'success');
      setRedeemModalOpen(false);
      setBookingId('');
      setRedeemAmount(0);
      setRedeemCN(null);
    } catch (e) {
      showToast('Error redeeming credit note', 'error');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-luxury-dark/5 shadow-sm">
        <div>
          <h3 className="text-2xl font-serif font-bold text-luxury-dark">Credit Notes</h3>
          <p className="text-sm text-luxury-dark/60 mt-1">Manage issued credit notes and view their usage history.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/40" />
            <input 
              type="text" 
              placeholder="Search code or client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-1 focus:ring-luxury-gold w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-luxury-dark/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-luxury-dark/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Code</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Client Info</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Original Booking</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Balance</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 border-l border-luxury-dark/5 text-right flex-shrink-0">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              {filteredNotes.length > 0 ? (
                filteredNotes.map(cn => (
                  <tr key={cn.id} className="hover:bg-luxury-dark/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-luxury-dark text-sm">{cn.code}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-luxury-dark">{cn.customerName || 'N/A'}</p>
                      <p className="text-xs text-luxury-dark/60">{cn.customerMobile || cn.customerEmail || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-luxury-dark/60 font-mono text-xs cursor-pointer hover:text-luxury-gold" onClick={() => { navigator.clipboard.writeText(cn.originalBookingId||''); showToast('Copied original ID', 'info'); }}>{cn.originalBookingId ? cn.originalBookingId.slice(0, 8) : 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-luxury-dark text-sm">₹{(cn.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600 text-sm">₹{(cn.balance || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${cn.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {cn.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-l border-luxury-dark/5 text-right w-[160px] min-w-[160px]">
                      {cn.balance > 0 && cn.status === 'active' && (
                        <button
                          onClick={() => {
                            setRedeemCN(cn);
                            setRedeemAmount(cn.balance);
                            setBookingId('');
                            setRedeemModalOpen(true);
                          }}
                          className="px-4 py-2 bg-luxury-dark text-white text-[10px] font-bold rounded-xl hover:bg-luxury-gold hover:text-luxury-dark transition-all uppercase tracking-widest shadow-md flex-shrink-0"
                        >
                          Redeem
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-luxury-dark/40 text-sm">No credit notes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {redeemModalOpen && redeemCN && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => { setRedeemModalOpen(false); setRedeemCN(null); }}
                className="absolute right-6 top-6 text-luxury-dark/40 hover:text-luxury-dark transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4 mb-6 text-emerald-600">
                <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center rounded-2xl">
                  <Gift size={24} />
                </div>
                <h3 className="text-xl font-serif font-bold text-luxury-dark">Redeem Credit Note</h3>
              </div>
              <p className="text-sm text-luxury-dark/60 mb-6 leading-relaxed">
                Applying Credit Note <strong>{redeemCN.code}</strong>. Client <strong>{redeemCN.customerName}</strong> has <strong>₹{redeemCN.balance.toLocaleString()}</strong> available.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-luxury-dark/60 uppercase tracking-widest mb-2">Target Booking</label>
                  <input 
                    type="text"
                    value={bookingId}
                    onChange={(e) => {
                       setBookingId(e.target.value);
                       setShowBookingSuggestions(true);
                    }}
                    onFocus={() => setShowBookingSuggestions(true)}
                    placeholder="Search by ID, Name or Phone..."
                    className="w-full bg-luxury-dark/5 border-none rounded-xl px-4 py-3 text-luxury-dark font-bold focus:ring-1 focus:ring-luxury-gold"
                  />
                  
                  {showBookingSuggestions && suggestedBookings.length > 0 && (
                     <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-luxury-dark/10 overflow-hidden max-h-48 overflow-y-auto">
                        {suggestedBookings.map((b) => (
                           <div 
                             key={b.id} 
                             className="px-4 py-3 hover:bg-luxury-cream cursor-pointer border-b border-luxury-dark/5 last:border-0"
                             onClick={() => {
                               setBookingId(b.id);
                               setShowBookingSuggestions(false);
                             }}
                           >
                             <div className="font-bold text-sm text-luxury-dark">{b.name} <span className="font-normal text-xs text-luxury-dark/60">({b.phone})</span></div>
                             <div className="text-[10px] text-luxury-dark/60 font-mono mt-0.5">ID: {b.id} • {b.checkIn} - {b.checkOut} • {b.status?.toUpperCase()}</div>
                           </div>
                        ))}
                     </div>
                  )}
                  <p className="text-[10px] text-luxury-dark/40 mt-1 italic">Tip: Search and select a booking from the list.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-luxury-dark/60 uppercase tracking-widest mb-2">Amount to Apply (₹)</label>
                  <input 
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(Number(e.target.value))}
                    max={redeemCN.balance}
                    className="w-full bg-luxury-dark/5 border-none rounded-xl px-4 py-3 text-luxury-dark font-bold focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => { setRedeemModalOpen(false); setRedeemCN(null); }}
                    className="flex-1 py-3 text-luxury-dark font-bold hover:bg-black/5 rounded-xl transition-colors uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRedeem}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 whitespace-nowrap disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Apply to Booking'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
