import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { parse } from 'date-fns';
import { Phone, ChevronRight } from 'lucide-react';

export const UpcomingSummaryPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'uniquefarms123' || password === 'Uniquefarms123') { // Simple default password mechanism
      setIsAuthenticated(true);
      fetchBookings();
    } else {
      setError('Incorrect password');
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookings'),
        where('status', 'in', ['confirmed', 'blocked'])
      );
      const snapshot = await getDocs(q);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((b: any) => {
        if (b.status === 'cancelled' || b.status === 'abandoned' || b.status === 'pending') return false;
        try {
          // If no checkout somehow, skip
          if (!b.checkOut) return false;
          const checkOutDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
          return checkOutDate >= today;
        } catch {
          return true; // if date unparsable, still try to show it so we don't lose data
        }
      });

      // Fetch pending bookings too because some might have paid some amount but not confirmed yet
      const qPending = query(
        collection(db, 'bookings'),
        where('status', '==', 'pending')
      );
      const snapPending = await getDocs(qPending);
      snapPending.docs.forEach(doc => {
        const b = { id: doc.id, ...doc.data() } as any;
        if (b.amountPaid > 0) {
          try {
            if (b.checkOut) {
              const outDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
              if (outDate >= today) {
                fetched.push(b);
              }
            }
          } catch {
             fetched.push(b);
          }
        }
      });

      // Sort by checkIn date ascending
      fetched.sort((a, b) => {
        try {
          const dA = parse(a.checkIn, 'dd/MM/yyyy', new Date());
          const dB = parse(b.checkIn, 'dd/MM/yyyy', new Date());
          return dA.getTime() - dB.getTime();
        } catch {
          return 0;
        }
      });

      setBookings(fetched);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-[32px] shadow-xl max-w-sm w-full border border-luxury-dark/5">
          <h2 className="text-2xl font-serif text-luxury-dark mb-6 text-center">Summary Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-luxury-dark/40 tracking-widest mb-2">Access Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-luxury-cream/30 border border-luxury-dark/10 rounded-2xl px-4 py-3 placeholder-luxury-dark/20 text-luxury-dark focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
            <button
              type="submit"
              className="w-full bg-luxury-dark text-white rounded-2xl py-4 font-bold uppercase tracking-widest text-[10px] hover:bg-[#C5A059] transition-colors mt-2"
            >
              Access Bookings
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8 cursor-default">
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Upcoming Bookings (Payments)</h1>
          <button 
             onClick={fetchBookings} 
             disabled={loading}
             className="px-6 py-2 bg-white rounded-full border border-luxury-dark/10 text-xs font-bold uppercase tracking-widest text-luxury-dark hover:bg-luxury-cream transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {loading && bookings.length === 0 ? (
          <p className="text-center font-bold text-[#1A1A1A]/60 animate-pulse text-sm uppercase tracking-widest">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center font-bold text-[#1A1A1A]/60 p-12 bg-white rounded-3xl border border-luxury-dark/5">No upcoming bookings found.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, idx) => {
              const dayGuests = (booking.dayGuestAdults || 0) + (booking.dayGuestChildren?.length || 0);
              const nightGuests = (booking.nightGuestAdults || 0) + (booking.nightGuestChildren?.length || 0);
              const totalAmt = booking.totalAmount || 0;
              const paidAmt = booking.amountPaid || 0;
              const advancePartner = booking.bookingSource === 'partner' ? (booking.advanceByPartner || 0) : 0;
              const balanceAmt = totalAmt - paidAmt - advancePartner;
              
              const nameInitial = booking.name ? booking.name.charAt(0).toUpperCase() : 'G';

              return (
                <div key={booking.id || idx} className="bg-white rounded-[24px] p-6 border border-[#1A1A1A]/5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                  
                  {/* Left Section: Avatar and Info */}
                  <div className="flex items-start md:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] border border-[#C5A059]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C5A059] font-serif text-xl font-bold">{nameInitial}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A1A] text-lg">{booking.name || 'Guest'}</p>
                      <div className="flex items-center gap-3 text-xs text-[#1A1A1A]/40 font-mono mt-1">
                        <span>ID: {booking.id?.slice(0, 8)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 font-sans">
                          <Phone size={12} />
                          <span>{booking.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Columns */}
                  <div className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-12 flex-1 md:justify-end">
                    
                    <div className="text-left md:text-center min-w-[120px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Stay Dates</p>
                      <p className="text-sm font-bold text-[#1A1A1A] whitespace-nowrap">{booking.checkIn} - {booking.checkOut}</p>
                    </div>

                    <div className="text-left md:text-center min-w-[40px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Day</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">{dayGuests}</p>
                    </div>

                    <div className="text-left md:text-center min-w-[40px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Night</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">{nightGuests}</p>
                    </div>

                    <div className="text-left md:text-center min-w-[80px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Occasion</p>
                      <p className="text-sm font-bold text-[#1A1A1A] truncate max-w-[100px]">{booking.occasion || 'General'}</p>
                    </div>

                    <div className="text-left md:text-center min-w-[80px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Amount</p>
                      <p className="text-sm font-bold text-[#1A1A1A]">₹{totalAmt.toLocaleString()}</p>
                    </div>

                    {/* Show Amount Received Instead of Payment Status Badge */}
                    <div className="text-left md:text-center min-w-[80px]">
                      <p className="text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1 font-black">Payment</p>
                      <p className="text-sm font-bold text-green-600">₹{paidAmt.toLocaleString()}</p>
                    </div>

                  </div>

                  {/* Right Section: Balance (where confirmation badge was) */}
                  <div className="flex items-center gap-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-[#1A1A1A]/5">
                     <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-center w-full md:w-auto">
                        Bal: ₹{balanceAmt.toLocaleString()}
                     </div>
                     <ChevronRight size={16} className="text-[#1A1A1A]/20 hidden md:block" />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
