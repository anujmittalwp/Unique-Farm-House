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
      <div className="min-h-screen bg-[#0d0c0a] text-white flex items-center justify-center p-4 sm:p-6 md:p-8 select-none relative overflow-hidden">
        {/* Ambient decorative lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#181714] border border-luxury-gold/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative z-10 space-y-6">
          {/* Header / Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold shadow-inner">
              <Lock size={32} />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
              {siteSettings?.siteName || "Unique Farmhouse"}
            </h1>
            <p className="text-xs uppercase tracking-widest text-luxury-gold font-bold">
              Caretaker Farm Portal
            </p>
            <p className="text-xs text-white/50 pt-1">
              Kripya apna 4-digit PIN enter karein
            </p>
          </div>

          {/* PIN Indicators */}
          <div className="py-2 flex flex-col items-center gap-3">
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
          <div className="grid grid-cols-3 gap-3.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-luxury-gold active:text-luxury-dark text-2xl font-serif font-bold text-white transition-all flex items-center justify-center border border-white/5 shadow-sm active:scale-95"
              >
                {digit}
              </button>
            ))}
            <div className="flex items-center justify-center text-xs text-white/30 font-mono">
              PIN: {activePin === '1234' ? '1234' : '••••'}
            </div>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-luxury-gold active:text-luxury-dark text-2xl font-serif font-bold text-white transition-all flex items-center justify-center border border-white/5 shadow-sm active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 sm:h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 active:text-white transition-all flex items-center justify-center border border-white/5 active:scale-95"
              title="Delete"
            >
              <Minus size={22} />
            </button>
          </div>

          {/* Bottom Options */}
          <div className="text-center pt-2">
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
      </div>
    );
  }

  // ================= RENDER: UNLOCKED CARETAKER PORTAL =================
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-luxury-dark pb-20 relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-luxury-dark text-white shadow-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold font-serif font-bold text-lg">
              {(siteSettings?.siteName || "U").charAt(0)}
            </div>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-luxury-gold tracking-wide">
                {siteSettings?.siteName || "Unique Farmhouse"}
              </h1>
              <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Caretaker Farm Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsChangePinModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Change PIN"
            >
              <Key size={15} />
              <span className="hidden sm:inline">Change PIN</span>
            </button>
            <button
              onClick={() => {
                if (onExit) onExit();
                else window.location.href = '/';
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-colors"
              title="Go to Main Website"
            >
              <ExternalLink size={15} />
              <span className="hidden sm:inline">Main Website</span>
            </button>
            <button
              onClick={handleLock}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors"
              title="Lock Portal"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* HERO CARD: Caretaker Cash In Hand */}
        <div className="bg-gradient-to-br from-[#1a1916] via-[#141311] to-[#0d0c0a] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-luxury-gold/25">
          <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-luxury-gold flex items-center gap-1.5">
                  <Wallet size={15} /> Aapke Paas Physical Cash (Cash In Hand)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
                ₹{caretakerStats.cashInHand.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-white/60">
                Farm par abhi physical cash balance (Live Real-time)
              </p>
            </div>

            {/* Quick Metrics Bar (Responsive 3-column pill / card) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm md:min-w-[380px]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Liya (In)</p>
                <p className="text-sm sm:text-base font-bold text-emerald-400">
                  +₹{caretakerStats.cashCollected.toLocaleString()}
                </p>
                <p className="text-[9px] text-white/40">Guest Cash</p>
              </div>
              <div className="border-x border-white/10 px-2 sm:px-3">
                <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Kharcha (Out)</p>
                <p className="text-sm sm:text-base font-bold text-amber-400">
                  -₹{caretakerStats.cashSpent.toLocaleString()}
                </p>
                <p className="text-[9px] text-white/40">Farm Expenses</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Owner ko Diya</p>
                <p className="text-sm sm:text-base font-bold text-white/80">
                  ₹{caretakerStats.totalHandedOver.toLocaleString()}
                </p>
                <p className="text-[9px] text-white/40">Settlement</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 BIG ACTION BUTTONS (Single column on mobile, 2 columns on Tablet & Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.99] text-white p-6 sm:p-7 rounded-3xl shadow-lg shadow-emerald-900/15 flex items-center justify-between transition-all group border border-emerald-400/30 text-left"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <ArrowDownLeft size={32} />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-emerald-200">
                  Guest Se Cash Liya
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  + Collect Cash
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                  Booking ya guest ka cash receipt darj karein
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-200 group-hover:bg-white group-hover:text-emerald-700 transition-all">
              <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
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
            className="w-full bg-gradient-to-r from-[#181715] to-[#24221e] hover:from-[#201f1b] hover:to-[#2c2924] active:scale-[0.99] text-white p-6 sm:p-7 rounded-3xl shadow-lg flex items-center justify-between transition-all group border border-white/15 text-left"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <ArrowUpRight size={32} />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-amber-400">
                  Farm Kharcha Kiya
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
                  - Add Expense
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                  Diesel, Ration, Repair, Staff aadi ka kharcha
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:bg-amber-400 group-hover:text-luxury-dark transition-all">
              <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* TODAY / RECENT ENTRIES LIST */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-black/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/5">
            <div>
              <h3 className="font-serif text-lg font-bold text-luxury-dark">
                Aapka Recent Hisab (Live Transactions)
              </h3>
              <p className="text-xs text-luxury-dark/50">
                Caretaker cash collections aur farm expenses ki suchi
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync with Admin
            </span>
          </div>

          <div className="space-y-3">
            {caretakerStats.combinedHistory.length === 0 ? (
              <div className="text-center py-12 text-black/40 space-y-2">
                <Wallet size={36} className="mx-auto text-black/20" />
                <p className="text-sm font-medium">Abhi koi entry nahi hai.</p>
                <p className="text-xs text-black/30">Upar diye gaye "+ Collect Cash" ya "- Add Expense" buttons se nayi entry karein.</p>
              </div>
            ) : (
              caretakerStats.combinedHistory.slice(0, 15).map((item, idx) => {
                const isIncome = item.type === 'collection';
                return (
                  <div 
                    key={item.id || idx}
                    className="p-4 bg-luxury-cream/40 hover:bg-luxury-cream/80 transition-colors rounded-2xl border border-black/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-luxury-dark truncate">
                            {isIncome ? (item.guestName || 'Cash Collection') : (item.title || item.category)}
                          </p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isIncome ? 'Cash In' : (item.category || 'Expense')}
                          </span>
                        </div>
                        <p className="text-xs text-luxury-dark/50 truncate">
                          {item.date} {item.note ? `• ${item.note}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-base sm:text-lg font-serif ${isIncome ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {isIncome ? '+' : '-'}₹{Number(item.amount || 0).toLocaleString()}
                      </p>
                      <span className="text-[10px] uppercase font-bold text-luxury-dark/40">
                        {isIncome ? 'Guest Received' : 'Cash Spent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Caretaker Helper Footer Note */}
        <div className="text-center pt-2 pb-6">
          <p className="text-xs text-luxury-dark/40">
            🔒 Caretaker Portal • Aapki ki gayi har entry Admin Dashboard par real-time sync hoti hai.
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
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
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
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
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
