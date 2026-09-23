import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { 
  collection, doc, onSnapshot, getDoc, setDoc, addDoc, updateDoc, 
  query, orderBy, limit 
} from 'firebase/firestore';
import { 
  Plus, Minus, ArrowDownLeft, ArrowUpRight, Wallet, ShieldCheck, 
  Lock, Unlock, Key, Check, X, AlertCircle, Calendar, RefreshCw, 
  ChevronRight, ExternalLink, LogOut, Sparkles, Building2, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface CaretakerPortalProps {
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  siteSettings?: any;
  onExit?: () => void;
}

export const CaretakerPortal: React.FC<CaretakerPortalProps> = ({ 
  showToast = (msg) => alert(msg), 
  siteSettings,
  onExit
}) => {
  // PIN and Auth state
  const [activePin, setActivePin] = useState<string>('1234');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('caretaker_unlocked') === 'true';
  });
  const [pinError, setPinError] = useState<string | null>(null);

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

  // Change PIN form
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);

  // Data states
  const [bookings, setBookings] = useState<any[]>([]);
  const [globalExpenses, setGlobalExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Collect Cash Form
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [collectAmount, setCollectAmount] = useState<string>('');
  const [collectDate, setCollectDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [collectNote, setCollectNote] = useState<string>('');
  const [customGuestName, setCustomGuestName] = useState<string>('');

  // Add Expense Form
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('Diesel / Fuel');
  const [expenseDate, setExpenseDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [expenseNote, setExpenseNote] = useState<string>('');

  // 1. Listen for Caretaker PIN from Firestore
  useEffect(() => {
    const pinDocRef = doc(db, 'settings', 'caretaker_pin');
    const unsubPin = onSnapshot(pinDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.pin) {
          setActivePin(String(data.pin));
        }
      } else {
        // Default PIN: 1234
        setActivePin('1234');
      }
    }, (err) => {
      console.warn("Could not load caretaker PIN, defaulting to 1234:", err);
      setActivePin('1234');
    });

    return () => unsubPin();
  }, []);

  // 2. Real-time Listeners for Data
  useEffect(() => {
    // Bookings listener
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(data);
    }, (err) => console.error("Bookings listener error:", err));

    // Global Expenses listener
    const unsubExp = onSnapshot(collection(db, 'global_expenses'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGlobalExpenses(data);
    }, (err) => console.error("Expenses listener error:", err));

    // Settlements listener
    const unsubSet = onSnapshot(collection(db, 'caretaker_settlements'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSettlements(data);
      setLoading(false);
    }, (err) => {
      console.error("Settlements listener error:", err);
      setLoading(false);
    });

    return () => {
      unsubBookings();
      unsubExp();
      unsubSet();
    };
  }, []);

  // PIN Keypad Handlers
  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(null);

      if (nextPin.length === 4) {
        if (nextPin === activePin) {
          setIsUnlocked(true);
          sessionStorage.setItem('caretaker_unlocked', 'true');
          setEnteredPin('');
          showToast("Welcome to Caretaker Portal", "success");
        } else {
          setPinError("Galat PIN! Default PIN 1234 hai ya Admin se puchiye.");
          setTimeout(() => {
            setEnteredPin('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError(null);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('caretaker_unlocked');
    setEnteredPin('');
  };

  // Live Cash In Hand Calculation
  const caretakerStats = useMemo(() => {
    let cashCollected = 0;
    const cashPaymentsList: any[] = [];
    
    bookings.forEach(b => {
      if (b.status === 'cancelled') return;
      (b.payments || []).forEach((p: any) => {
        if (p.method === 'cash_caretaker') {
          const amt = Number(p.amount) || 0;
          cashCollected += amt;
          cashPaymentsList.push({
            id: `${b.id}-${p.date || Math.random()}`,
            bookingId: b.id,
            guestName: b.name || 'Guest',
            amount: amt,
            date: p.date,
            note: p.note,
            type: 'collection'
          });
        }
      });
    });

    let cashSpent = 0;
    const cashExpensesList: any[] = [];

    bookings.forEach(b => {
      if (b.status === 'cancelled') return;
      (b.expenses || []).forEach((e: any, idx: number) => {
        if (e.paidBy === 'caretaker') {
          const amt = Number(e.amount) || 0;
          cashSpent += amt;
          cashExpensesList.push({
            id: `b-${b.id}-${idx}`,
            title: `Booking: ${b.name || 'Guest'}`,
            category: e.category || 'General',
            amount: amt,
            date: e.date,
            note: e.note,
            type: 'expense'
          });
        }
      });
    });

    globalExpenses.forEach((e: any) => {
      if (e.paidBy === 'caretaker') {
        const amt = Number(e.amount) || 0;
        cashSpent += amt;
        cashExpensesList.push({
          id: `g-${e.id}`,
          title: e.category || 'Farm Expense',
          category: e.category || 'General',
          amount: amt,
          date: e.date,
          note: e.note,
          type: 'expense'
        });
      }
    });

    const totalHandedOver = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const cashInHand = cashCollected - cashSpent - totalHandedOver;

    // Combined recent activity (sorted descending)
    const combinedHistory = [...cashPaymentsList, ...cashExpensesList].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );

    return {
      cashCollected,
      cashSpent,
      totalHandedOver,
      cashInHand,
      combinedHistory
    };
  }, [bookings, globalExpenses, settlements]);

  // Active / Upcoming bookings for quick selection
  const relevantBookings = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'cancelled')
      .map(b => {
        const total = Number(b.totalAmount) || 0;
        const paid = Number(b.amountPaid) || 0;
        const balance = Math.max(0, total - paid);
        return {
          ...b,
          calculatedBalance: balance
        };
      })
      .sort((a, b) => new Date(b.checkIn || 0).getTime() - new Date(a.checkIn || 0).getTime());
  }, [bookings]);

  // Selected Booking Balance Info
  const selectedBookingInfo = useMemo(() => {
    if (!selectedBookingId || selectedBookingId === 'custom') return null;
    return relevantBookings.find(b => b.id === selectedBookingId) || null;
  }, [selectedBookingId, relevantBookings]);

  // Auto-fill amount when a booking is chosen
  useEffect(() => {
    if (selectedBookingInfo && selectedBookingInfo.calculatedBalance > 0 && !collectAmount) {
      setCollectAmount(String(selectedBookingInfo.calculatedBalance));
    }
  }, [selectedBookingInfo]);

  // Handlers
  const handleSaveCashReceived = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(collectAmount);
    if (isNaN(amt) || amt <= 0) {
      return showToast("Kripya sahi amount (₹) bharein", "error");
    }

    setSubmitting(true);
    try {
      if (selectedBookingId && selectedBookingId !== 'custom') {
        // 1. Linked to Existing Booking
        const targetBooking = bookings.find(b => b.id === selectedBookingId);
        if (!targetBooking) throw new Error("Booking nahi mili!");

        const existingPayments = targetBooking.payments || [];
        const newPaymentEntry = {
          id: `pay-${Date.now()}`,
          amount: amt,
          date: collectDate,
          method: 'cash_caretaker',
          note: collectNote || 'Cash collected at farm by Caretaker',
          recordedBy: 'caretaker',
          createdAt: new Date().toISOString()
        };

        const updatedPayments = [...existingPayments, newPaymentEntry];
        const newAmountPaid = (Number(targetBooking.amountPaid) || 0) + amt;
        const totalAmt = Number(targetBooking.totalAmount) || 0;
        const newPaymentStatus = newAmountPaid >= totalAmt ? 'paid' : (newAmountPaid > 0 ? 'part-paid' : 'unpaid');

        await updateDoc(doc(db, 'bookings', selectedBookingId), {
          payments: updatedPayments,
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus
        });

        showToast(`₹${amt.toLocaleString()} Cash Collection saved for ${targetBooking.name || 'Guest'}!`, "success");
      } else {
        // 2. Custom / Walk-in Cash Entry (Save as global expense/credit or miscellaneous booking)
        const guestTitle = customGuestName.trim() || 'Walk-in / Direct Guest';
        await addDoc(collection(db, 'global_expenses'), {
          amount: -amt, // Negative expense = income in caretaker cash
          category: 'Caretaker Cash Collection',
          date: collectDate,
          note: `[Cash Received: ${guestTitle}] ${collectNote || ''}`.trim(),
          paidBy: 'caretaker',
          type: 'cash_received',
          createdAt: new Date().toISOString()
        });

        showToast(`₹${amt.toLocaleString()} Cash Collection saved!`, "success");
      }

      setIsCollectModalOpen(false);
      setCollectAmount('');
      setCollectNote('');
      setSelectedBookingId('');
      setCustomGuestName('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Entry save karne me samasya aayi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      return showToast("Kripya sahi amount (₹) bharein", "error");
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'global_expenses'), {
        amount: amt,
        category: expenseCategory,
        date: expenseDate,
        note: expenseNote.trim() || `${expenseCategory} kharcha`,
        paidBy: 'caretaker',
        recordedBy: 'caretaker',
        createdAt: new Date().toISOString()
      });

      showToast(`₹${amt.toLocaleString()} Farm Expense recorded!`, "success");
      setIsExpenseModalOpen(false);
      setExpenseAmount('');
      setExpenseNote('');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Kharcha save karne me samasya aayi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);

    if (oldPinInput !== activePin) {
      setPinChangeError("Purana PIN galat hai!");
      return;
    }

    if (!/^\d{4}$/.test(newPinInput)) {
      setPinChangeError("Naya PIN 4 anko (digits) ka hona chahiye!");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinChangeError("Naya PIN aur Confirm PIN match nahi ho rahe!");
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'caretaker_pin'), {
        pin: newPinInput,
        updatedAt: new Date().toISOString(),
        updatedBy: 'caretaker_portal'
      }, { merge: true });

      setActivePin(newPinInput);
      showToast("Caretaker PIN badal diya gaya hai!", "success");
      setIsChangePinModalOpen(false);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } catch (err: any) {
      console.error(err);
      setPinChangeError(err.message || "PIN badalne me samasya aayi");
    }
  };

  // ================= RENDER: LOCKED / PIN PAD SCREEN =================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-luxury-dark text-white flex flex-col justify-between p-6 select-none max-w-md mx-auto shadow-2xl">
        {/* Header / Logo */}
        <div className="pt-6 text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
            <Lock size={32} />
          </div>
          <h1 className="text-xl font-serif text-white tracking-wide">
            {siteSettings?.siteName || "Unique Farmhouse"}
          </h1>
          <p className="text-xs uppercase tracking-widest text-luxury-gold font-bold">
            Caretaker Mobile Portal
          </p>
          <p className="text-xs text-white/50 pt-1">
            Kripya apna 4-digit PIN enter karein
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="py-6 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled 
                      ? 'bg-luxury-gold scale-125 shadow-lg shadow-luxury-gold/50' 
                      : 'border-2 border-white/20 bg-white/5'
                  }`}
                />
              );
            })}
          </div>
          {pinError && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs text-red-400 font-medium text-center px-4"
            >
              {pinError}
            </motion.p>
          )}
        </div>

        {/* 1-9 & 0 Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 pb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-luxury-gold active:text-luxury-dark text-2xl font-serif font-bold text-white transition-all flex items-center justify-center border border-white/5 shadow-sm active:scale-95"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center text-xs text-white/30">
            PIN: {activePin === '1234' ? '1234' : '••••'}
          </div>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-luxury-gold active:text-luxury-dark text-2xl font-serif font-bold text-white transition-all flex items-center justify-center border border-white/5 shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 active:text-white transition-all flex items-center justify-center border border-white/5 active:scale-95"
            title="Delete"
          >
            <Minus size={22} />
          </button>
        </div>

        {/* Bottom Options */}
        <div className="pb-4 text-center">
          <button
            onClick={() => {
              if (onExit) onExit();
              else window.location.href = '/';
            }}
            className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-wider"
          >
            ← Exit to Main Website
          </button>
        </div>
      </div>
    );
  }

  // ================= RENDER: UNLOCKED CARETAKER PORTAL =================
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-luxury-dark pb-16 max-w-md mx-auto shadow-2xl relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-luxury-dark text-white px-5 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="font-serif text-base font-bold text-luxury-gold tracking-wide">
            {siteSettings?.siteName || "Unique Farmhouse"}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">
            Caretaker Farm Portal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangePinModalOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            title="Change PIN"
          >
            <Key size={16} />
          </button>
          <button
            onClick={handleLock}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            title="Lock Portal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* HERO CARD: Caretaker Cash In Hand */}
        <div className="bg-luxury-dark text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-luxury-gold/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold flex items-center gap-1.5">
                <Wallet size={13} /> Aapke Paas Physical Cash (Cash in Hand)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="text-3xl font-serif font-bold text-white tracking-tight pt-1">
              ₹{caretakerStats.cashInHand.toLocaleString()}
            </div>
            <p className="text-[11px] text-white/50">
              Farm par physical cash balance
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-5 border-t border-white/10 mt-4">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Liya (In)</p>
              <p className="text-xs font-bold text-emerald-400">
                +₹{caretakerStats.cashCollected.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Kharcha (Out)</p>
              <p className="text-xs font-bold text-amber-400">
                -₹{caretakerStats.cashSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Owner ko Diya</p>
              <p className="text-xs font-bold text-white/70">
                ₹{caretakerStats.totalHandedOver.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 2 BIG ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-3.5 pt-1">
          {/* BUTTON 1: COLLECT CASH */}
          <button
            type="button"
            onClick={() => {
              setCollectAmount('');
              setSelectedBookingId('');
              setCustomGuestName('');
              setCollectNote('');
              setCollectDate(format(new Date(), 'yyyy-MM-dd'));
              setIsCollectModalOpen(true);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white p-5 rounded-2xl shadow-lg shadow-emerald-900/10 flex items-center justify-between transition-all group border border-emerald-500/30 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                <ArrowDownLeft size={28} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                  Guest Se Cash Liya
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">
                  + Collect Cash
                </h3>
                <p className="text-xs text-emerald-100/70">
                  Booking ya guest ka cash receipt darj karein
                </p>
              </div>
            </div>
            <ChevronRight size={22} className="text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* BUTTON 2: ADD EXPENSE */}
          <button
            type="button"
            onClick={() => {
              setExpenseAmount('');
              setExpenseCategory('Diesel / Fuel');
              setExpenseNote('');
              setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
              setIsExpenseModalOpen(true);
            }}
            className="w-full bg-[#141414] hover:bg-black active:scale-[0.98] text-white p-5 rounded-2xl shadow-lg flex items-center justify-between transition-all group border border-white/10 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                <ArrowUpRight size={28} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Farm Kharcha Kiya
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">
                  - Add Expense
                </h3>
                <p className="text-xs text-white/60">
                  Diesel, Ration, Repair aadi ka kharcha
                </p>
              </div>
            </div>
            <ChevronRight size={22} className="text-white/40 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* TODAY / RECENT ENTRIES LIST */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-luxury-dark">
              Aapka Recent Hisab (History)
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-dark/40 bg-luxury-dark/5 px-2.5 py-1 rounded-full">
              Live Sync
            </span>
          </div>

          <div className="space-y-2.5">
            {caretakerStats.combinedHistory.length === 0 ? (
              <p className="text-xs text-center py-6 text-black/40 italic">
                Abhi koi entry nahi hai. Upar diye buttons se nayi entry karein.
              </p>
            ) : (
              caretakerStats.combinedHistory.slice(0, 10).map((item, idx) => {
                const isIncome = item.type === 'collection';
                return (
                  <div 
                    key={item.id || idx}
                    className="p-3 bg-luxury-cream/50 rounded-2xl border border-black/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-luxury-dark truncate">
                          {isIncome ? (item.guestName || 'Cash Collection') : (item.title || item.category)}
                        </p>
                        <p className="text-[10px] text-luxury-dark/50 truncate">
                          {item.date} {item.note ? `• ${item.note}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-xs ${isIncome ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {isIncome ? '+' : '-'}₹{Number(item.amount || 0).toLocaleString()}
                      </p>
                      <span className="text-[9px] uppercase font-bold text-luxury-dark/40">
                        {isIncome ? 'Cash In' : 'Spent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Caretaker Note */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] text-luxury-dark/40">
            Aapki ki gayi har entry Admin Dashboard par real-time dikhayi de rahi hai.
          </p>
        </div>
      </main>

      {/* ================= MODAL 1: COLLECT CASH ================= */}
      <AnimatePresence>
        {isCollectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-emerald-800 flex items-center gap-2">
                    <ArrowDownLeft size={20} /> Guest Se Cash Liya
                  </h3>
                  <p className="text-xs text-luxury-dark/50">Cash collection ki entry darj karein</p>
                </div>
                <button 
                  onClick={() => setIsCollectModalOpen(false)} 
                  className="p-2 hover:bg-black/5 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCashReceived} className="space-y-4">
                {/* Booking Selection */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Guest / Booking Select Karein
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Booking Chunein --</option>
                    {relevantBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name || 'Guest'} ({b.checkIn} se {b.checkOut}) {b.calculatedBalance > 0 ? `[Pending: ₹${b.calculatedBalance}]` : '[Full Paid]'}
                      </option>
                    ))}
                    <option value="custom">+ General / Walk-in Cash (Alag Entry)</option>
                  </select>
                </div>

                {selectedBookingId === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                      Guest Ka Naam
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar (Walk-in)"
                      value={customGuestName}
                      onChange={(e) => setCustomGuestName(e.target.value)}
                      className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Amount (₹ Kitna Cash Liya) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="w-full p-3.5 bg-luxury-cream border border-black/10 rounded-xl text-xl font-bold font-serif outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    min="1"
                  />
                  {selectedBookingInfo && selectedBookingInfo.calculatedBalance > 0 && (
                    <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                      Is booking ka baki balance: ₹{selectedBookingInfo.calculatedBalance.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Tarikh (Date)
                  </label>
                  <input
                    type="date"
                    value={collectDate}
                    onChange={(e) => setCollectDate(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Note / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Final balance received on check-in"
                    value={collectNote}
                    onChange={(e) => setCollectNote(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {submitting ? 'Save Ho Raha Hai...' : 'Save Cash Received'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: ADD EXPENSE ================= */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-900 flex items-center gap-2">
                    <ArrowUpRight size={20} /> Farm Kharcha Darj Karein
                  </h3>
                  <p className="text-xs text-luxury-dark/50">Caretaker cash se kiya gaya kharcha</p>
                </div>
                <button 
                  onClick={() => setIsExpenseModalOpen(false)} 
                  className="p-2 hover:bg-black/5 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Amount (₹ Kharcha) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full p-3.5 bg-luxury-cream border border-black/10 rounded-xl text-xl font-bold font-serif outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                    min="1"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Category (Kharcha Kis Cheez Ka Hai)
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-luxury-gold"
                  >
                    <option value="Diesel / Fuel">Diesel / Generator / Tractor</option>
                    <option value="Grocery / Food">Grocery / Sabzi / Ration</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Cleaning">Cleaning & Housekeeping</option>
                    <option value="Staff Advance">Staff Advance / Wages</option>
                    <option value="Electricity / Water">Electricity / Water Utility</option>
                    <option value="Other Farm Expense">Other Miscellaneous</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Tarikh (Date)
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-2">
                    Kharcha Ki Detail / Note *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20L Tractor Diesel, Sabzi mandi se"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  Yeh amount aapke <strong>Cash in Hand</strong> me se automatically kam ho jayegi.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-luxury-dark hover:bg-black active:scale-95 text-white font-bold rounded-2xl uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {submitting ? 'Save Ho Raha Hai...' : 'Save Farm Expense'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: CHANGE PIN ================= */}
      <AnimatePresence>
        {isChangePinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-serif font-bold text-luxury-dark flex items-center gap-2">
                    <Key size={18} /> Change Caretaker PIN
                  </h3>
                  <p className="text-xs text-luxury-dark/50">Naya 4-digit PIN set karein</p>
                </div>
                <button 
                  onClick={() => setIsChangePinModalOpen(false)} 
                  className="p-2 hover:bg-black/5 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleChangePin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-1.5">
                    Purana PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Purana 4-digit PIN"
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-center text-lg font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-1.5">
                    Naya PIN (4 Digits)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Naya 4-digit PIN"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-center text-lg font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-dark/70 uppercase tracking-wider mb-1.5">
                    Naya PIN Confirm Karein
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="Confirm Naya PIN"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    className="w-full p-3 bg-luxury-cream border border-black/10 rounded-xl text-center text-lg font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-luxury-gold"
                    required
                  />
                </div>

                {pinChangeError && (
                  <p className="text-xs text-red-500 font-medium text-center">
                    {pinChangeError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-luxury-dark text-white font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-black transition-colors"
                >
                  Update PIN
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
