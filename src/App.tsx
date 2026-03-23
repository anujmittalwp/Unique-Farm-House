import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Wifi, 
  Waves, 
  Shield, 
  Heart, 
  Maximize, 
  Coffee,
  Utensils,
  Gamepad2,
  User,
  Mail,
  PartyPopper,
  Bed,
  Sofa,
  Sparkles,
  Sun,
  Lock,
  EyeOff,
  ShieldCheck,
  Smile,
  ChefHat,
  Dices,
  Trophy,
  Signal,
  Zap,
  Map,
  Crown,
  Target,
  Menu,
  X,
  Info,
  ArrowRight,
  MessageCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Images,
  CreditCard,
  LogOut,
  History,
  LayoutDashboard,
  Eye,
  Moon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  IndianRupee,
  Copy,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { format, addDays, parse, isValid } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function logAdminAction(action: string, targetId: string, details?: string) {
  if (!auth.currentUser) return;
  try {
    const logData = {
      adminId: auth.currentUser.uid,
      adminEmail: auth.currentUser.email || '',
      action,
      targetId,
      details: details || '',
      createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
    };
    console.log('Logging admin action:', logData, 'emailVerified:', auth.currentUser.emailVerified);
    await addDoc(collection(db, 'logs'), logData);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('Password reset email sent! Please check your inbox.');
        // Don't close modal yet, let them see the success message
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          role: 'client'
        });
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Check if user document exists, if not create it
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.email === 'anujkumarmittal@gmail.com' ? 'admin' : 'client'
      }, { merge: true });
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-dark/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-luxury-dark/20 hover:text-luxury-dark transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-luxury-dark mb-2">
                  {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-luxury-dark/60 text-sm">
                  {isForgotPassword 
                    ? 'Enter your email to receive a reset link' 
                    : isLogin 
                      ? 'Enter your details to manage your bookings' 
                      : 'Join us for a luxury farmhouse experience'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isForgotPassword && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-2 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={18} />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-luxury-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-luxury-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40">Password</label>
                      {isLogin && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setError('');
                            setSuccessMessage('');
                          }}
                          className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold hover:text-luxury-dark transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-luxury-dark/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-dark text-white py-4 rounded-2xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {!isForgotPassword && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-luxury-dark/10"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="px-4 bg-white text-luxury-dark/40">Or continue with</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-luxury-dark/10 text-luxury-dark py-4 rounded-2xl font-bold hover:bg-luxury-dark/5 transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </button>
                  </>
                )}
              </form>

              <div className="mt-8 text-center">
                {isForgotPassword ? (
                  <button 
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-sm text-luxury-dark/60 hover:text-luxury-dark transition-colors"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-sm text-luxury-dark/60 hover:text-luxury-dark transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MyBookings = ({ user, userRole, onClose, onLogin, allBookings, showToast }: { user: FirebaseUser; userRole: string | null; onClose: () => void; onLogin: () => void; allBookings: any[]; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending' | 'cancelled' | 'reviews' | 'logs'>('all');
  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  useEffect(() => {
    if (userRole === 'admin' && activeFilter === 'reviews') {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'reviews'));
      return () => unsubscribe();
    }
    if (userRole === 'admin' && activeFilter === 'logs') {
      const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAdminLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'logs'));
      return () => unsubscribe();
    }
  }, [userRole, activeFilter]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter(r => r.status === reviewFilter);
  }, [reviews, reviewFilter]);

  const handleReviewStatus = async (reviewId: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      await setDoc(doc(db, 'reviews', reviewId), { status }, { merge: true });
      await logAdminAction('review_status_update', reviewId, `Set review status to ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      await logAdminAction('delete_review', reviewId, 'Deleted guest review');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  useEffect(() => {
    let q;
    if (userRole === 'admin') {
      q = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'bookings'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, userRole]);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'pending') return booking.status === 'pending';
      if (activeFilter === 'cancelled') return booking.status === 'cancelled';
      
      if (!booking.checkIn || !booking.checkOut) return false;
      
      const checkInDate = parse(booking.checkIn, 'dd/MM/yyyy', new Date());
      const checkOutDate = parse(booking.checkOut, 'dd/MM/yyyy', new Date());
      
      if (!isValid(checkInDate) || !isValid(checkOutDate)) return false;
      
      if (activeFilter === 'upcoming') {
        return booking.status === 'confirmed' && checkInDate >= new Date(today.getTime() - 86400000);
      }
      if (activeFilter === 'completed') {
        return booking.status === 'confirmed' && checkOutDate < today;
      }
      return true;
    });
  }, [bookings, activeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-600 bg-emerald-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600 bg-emerald-50';
      case 'part-paid': return 'text-blue-600 bg-blue-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const [paymentInputs, setPaymentInputs] = useState<{[key: string]: string}>({});

  const handleUpdatePayment = async (bookingId: string, totalAmount: number) => {
    const amount = parseFloat(paymentInputs[bookingId]);
    if (isNaN(amount)) return;

    let status: 'unpaid' | 'part-paid' | 'paid' = 'unpaid';
    if (amount >= totalAmount) status = 'paid';
    else if (amount > 0) status = 'part-paid';

    try {
      await setDoc(doc(db, 'bookings', bookingId), { 
        amountPaid: amount,
        paymentStatus: status
      }, { merge: true });
      await logAdminAction('update_payment', bookingId, `Updated payment to ₹${amount} (${status})`);
      setPaymentInputs(prev => {
        const next = {...prev};
        delete next[bookingId];
        return next;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        {editingBooking ? (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setEditingBooking(null)}
              className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors mb-8 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Bookings
            </button>
            <h2 className="text-3xl font-serif font-bold text-luxury-dark mb-8">Modify Booking</h2>
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-xl">
              <BookingForm user={user} userRole={userRole} editBooking={editingBooking} onClose={() => setEditingBooking(null)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} />
            </div>
          </div>
        ) : reviewingBooking ? (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setReviewingBooking(null)}
              className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors mb-8 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Bookings
            </button>
            <div className="bg-white rounded-3xl border border-luxury-dark/5 shadow-xl overflow-hidden">
              <ReviewForm booking={reviewingBooking} user={user} onClose={() => setReviewingBooking(null)} showToast={showToast} />
            </div>
          </div>
        ) : isAdminCreating ? (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setIsAdminCreating(false)}
              className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors mb-8 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Bookings
            </button>
            <h2 className="text-3xl font-serif font-bold text-luxury-dark mb-8">Create Manual Booking</h2>
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-xl">
              <BookingForm user={user} userRole={userRole} onClose={() => setIsAdminCreating(false)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors mb-4 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-dark">
                {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
              </h1>
              {userRole === 'admin' && (
                <button 
                  onClick={() => setIsAdminCreating(true)}
                  className="px-6 py-2 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center gap-2"
                >
                  <Calendar size={16} /> Create Booking
                </button>
              )}
            </div>
            <p className="text-luxury-dark/60 mt-2">
              {userRole === 'admin' ? 'Manage all luxury stays and celebration details' : 'Manage your luxury stays and celebration details'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-luxury-dark/5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-luxury-gold flex items-center justify-center text-luxury-dark font-bold text-xl">
              {user.displayName?.[0] || user.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-luxury-dark">{user.displayName || 'Guest'}</p>
              <p className="text-xs text-luxury-dark/40">{user.email}</p>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
            {[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'pending', label: 'Pending' },
              { id: 'cancelled', label: 'Cancelled' },
              { id: 'reviews', label: 'Manage Reviews' },
              { id: 'logs', label: 'Admin Logs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeFilter === tab.id 
                    ? 'bg-luxury-dark text-white shadow-lg shadow-luxury-dark/20' 
                    : 'text-luxury-dark/40 hover:text-luxury-dark hover:bg-white'
                }`}
              >
                {tab.label}
                <span className="ml-2 opacity-50">
                  ({tab.id === 'reviews' ? reviews.length : tab.id === 'logs' ? adminLogs.length : bookings.filter(b => {
                    if (tab.id === 'all') return true;
                    if (tab.id === 'pending') return b.status === 'pending';
                    if (tab.id === 'cancelled') return b.status === 'cancelled';
                    if (!b.checkIn || !b.checkOut) return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkInDate = parse(b.checkIn, 'dd/MM/yyyy', new Date());
                    const checkOutDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
                    if (!isValid(checkInDate) || !isValid(checkOutDate)) return false;
                    if (tab.id === 'upcoming') return b.status === 'confirmed' && checkInDate >= today;
                    if (tab.id === 'completed') return b.status === 'confirmed' && checkOutDate < today;
                    return true;
                  }).length})
                </span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
            <p className="text-luxury-dark/40 font-medium">Loading your bookings...</p>
          </div>
        ) : activeFilter === 'reviews' && userRole === 'admin' ? (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
              {[
                { id: 'all', label: 'All Reviews' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'rejected', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReviewFilter(tab.id as any)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    reviewFilter === tab.id 
                      ? 'bg-white text-luxury-dark shadow-sm' 
                      : 'text-luxury-dark/40 hover:text-luxury-dark'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 opacity-50">
                    ({tab.id === 'all' ? reviews.length : reviews.filter(r => r.status === tab.id).length})
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold">
                      {review.userName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-luxury-dark">{review.userName}</p>
                      <p className="text-[10px] text-luxury-dark/40">{review.createdAt.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    review.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                    review.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {review.status}
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? 'text-luxury-gold fill-luxury-gold' : 'text-luxury-dark/10'} />
                  ))}
                </div>
                <p className="text-sm text-luxury-dark/70 italic mb-6">"{review.comment}"</p>
                <div className="flex gap-2">
                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleReviewStatus(review.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReviewStatus(review.id, 'rejected')}
                        className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {review.status !== 'pending' && (
                    <button 
                      onClick={() => handleReviewStatus(review.id, 'pending')}
                      className="flex-1 py-2 bg-luxury-dark/5 text-luxury-dark/40 text-[10px] font-bold rounded-xl hover:bg-luxury-dark hover:text-white transition-all"
                    >
                      Reset to Pending
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filteredReviews.length === 0 && (
              <div className="col-span-full py-24 text-center bg-luxury-dark/5 rounded-3xl border border-dashed border-luxury-dark/10">
                <p className="text-luxury-dark/40 font-medium italic">No {reviewFilter !== 'all' ? reviewFilter : ''} reviews found.</p>
              </div>
            )}
          </div>
        </div>
        ) : activeFilter === 'logs' && userRole === 'admin' ? (
          <div className="bg-white rounded-3xl border border-luxury-dark/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-luxury-dark/5 border-b border-luxury-dark/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Admin</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Action</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Target ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-dark/5">
                  {adminLogs.map(log => (
                    <tr key={log.id} className="hover:bg-luxury-cream/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-luxury-dark/60">
                        {log.createdAt ? log.createdAt : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-luxury-dark">
                        {log.adminEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                          log.action.includes('delete') ? 'bg-red-50 text-red-600' :
                          log.action.includes('create') ? 'bg-emerald-50 text-emerald-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-luxury-dark/40">
                        {log.targetId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-xs text-luxury-dark/60">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {adminLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-luxury-dark/30 italic">
                        No administrative actions logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-luxury-dark/5 rounded-3xl p-12 md:p-24 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar size={32} className="text-luxury-dark/20" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">
              {userRole === 'admin' ? `No ${activeFilter !== 'all' ? activeFilter : ''} Bookings` : 'No Bookings Found'}
            </h3>
            <p className="text-luxury-dark/60 mb-8 max-w-md mx-auto">
              {userRole === 'admin' 
                ? `There are currently no ${activeFilter !== 'all' ? activeFilter : ''} bookings in the system.` 
                : "You haven't made any bookings yet. Start planning your perfect celebration today!"}
            </p>
            <button 
              onClick={onClose}
              className="luxury-button"
            >
              Explore Farmhouse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                layout
                className="bg-white border border-luxury-dark/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      <div className="mt-4 p-4 bg-luxury-dark/5 rounded-2xl border border-luxury-dark/5">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold mb-3">Guest Details</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-luxury-dark flex items-center gap-2">
                            <User size={14} className="text-luxury-gold" />
                            {booking.name || 'Guest'}
                          </p>
                          <p className="text-xs text-luxury-dark/60 flex items-center gap-2">
                            <Mail size={12} />
                            {booking.email}
                          </p>
                          <p className="text-xs text-luxury-dark/60 flex items-center gap-2">
                            <Phone size={12} />
                            {booking.mobile}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-[0.2em]">Booking ID: {booking.id.slice(0, 8)}</p>
                        {(userRole === 'admin' || booking.status === 'pending') && (
                          <button 
                            onClick={() => setEditingBooking(booking)}
                            className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold hover:text-luxury-dark transition-colors flex items-center gap-1"
                          >
                            <Edit3 size={10} /> Modify
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-luxury-dark">₹{booking.totalAmount.toLocaleString()}</p>
                      <div className="mt-2 space-y-1">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'part-paid' ? 'Partially Paid' : 'Unpaid'}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold space-y-0.5">
                          <p>Booking: ₹{(booking.bookingAmount || (booking.totalAmount - (booking.securityDeposit || 5000))).toLocaleString()}</p>
                          <p>Security: ₹{(booking.securityDeposit || 5000).toLocaleString()}</p>
                          <p className="pt-1 border-t border-luxury-dark/5">Received: ₹{(booking.amountPaid || 0).toLocaleString()}</p>
                          <p className="text-luxury-gold">Balance: ₹{(booking.totalAmount - (booking.amountPaid || 0)).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-luxury-dark/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Check-In (2 PM)</p>
                      <p className="font-bold text-luxury-dark">{booking.checkIn}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Check-Out (11 AM)</p>
                      <p className="font-bold text-luxury-dark">{booking.checkOut}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests (Day)</p>
                      <p className="font-bold text-luxury-dark">{booking.guestsDay || booking.guests || 0} Guests</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests (Night)</p>
                      <p className="font-bold text-luxury-dark">{booking.guestsNight || 0} Guests</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Occasion</p>
                      <p className="font-bold text-luxury-dark">{booking.occasion || 'General Stay'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booking Date</p>
                      <p className="font-bold text-luxury-dark">{booking.createdAt.split(',')[0]}</p>
                    </div>
                  </div>

                  {(booking.paymentStatus === 'unpaid' || booking.paymentStatus === 'part-paid') && booking.status === 'confirmed' && (
                    <div className="mt-8 p-6 bg-luxury-gold/5 rounded-2xl border border-luxury-gold/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-dark">
                            <IndianRupee size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-luxury-dark">Complete Payment</p>
                            <p className="text-xs text-luxury-dark/40">Pay via UPI to secure your booking</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-4 rounded-2xl border border-luxury-dark/5">
                          <div className="w-32 h-32 bg-luxury-cream rounded-xl flex items-center justify-center border border-luxury-dark/5 overflow-hidden shrink-0">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${booking.totalAmount - (booking.amountPaid || 0)}&cu=INR&tn=Booking%20${booking.id.slice(0, 8)}`)}`}
                              alt="Payment QR Code"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <a 
                              href={`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${booking.totalAmount - (booking.amountPaid || 0)}&cu=INR&tn=Booking%20${booking.id.slice(0, 8)}`}
                              className="w-full bg-luxury-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10 text-sm"
                            >
                              <Zap size={18} />
                              Pay ₹{(booking.totalAmount - (booking.amountPaid || 0)).toLocaleString()} Now
                            </a>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('9313501001@pthdfc');
                                  showToast('UPI ID copied to clipboard!', 'success');
                                }}
                                className="py-2.5 px-4 bg-white border border-luxury-dark/10 rounded-xl text-[10px] font-bold text-luxury-dark hover:bg-luxury-cream transition-colors flex items-center justify-center gap-2"
                              >
                                <Copy size={12} /> Copy UPI ID
                              </button>
                              <a 
                                href={`https://wa.me/919313501001?text=I%20have%20made%20the%20payment%20for%20Booking%20ID:%20${booking.id.slice(0, 8)}.%20Please%20verify.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <MessageSquare size={12} /> Send Proof
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-luxury-cream/30 rounded-xl mt-4 border border-luxury-dark/5">
                        <p className="text-[10px] text-luxury-dark/60 uppercase tracking-widest font-bold mb-2">Instructions:</p>
                        <ul className="text-[10px] text-luxury-dark/50 space-y-1 list-disc pl-4">
                          <li>Scan the QR code or click "Pay Now" on your mobile device.</li>
                          <li>Ensure the amount matches the balance shown above.</li>
                          <li>After successful payment, take a screenshot of the transaction.</li>
                          <li>Click "Send Proof" to share the screenshot on WhatsApp for verification.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {booking.status === 'pending' && booking.paymentStatus === 'unpaid' && (
                    <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900">Awaiting Confirmation</p>
                        <p className="text-sm text-amber-700/70">The owner will confirm your booking shortly. Payment option will appear once confirmed.</p>
                      </div>
                    </div>
                  )}

                  {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                    <div className="mt-8 flex flex-col md:flex-row gap-4">
                      <div className="flex-1 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">Booking Confirmed</p>
                          <p className="text-sm text-emerald-700/70">We are excited to host you! See you soon.</p>
                        </div>
                      </div>
                      
                      {parse(booking.checkOut, 'dd/MM/yyyy', new Date()) <= new Date() && (
                        <button 
                          onClick={() => setReviewingBooking(booking)}
                          className="px-8 py-4 bg-luxury-dark text-white rounded-2xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-luxury-dark/10"
                        >
                          <Star size={20} /> Leave a Review
                        </button>
                      )}
                    </div>
                  )}

                  {userRole === 'admin' && (
                    <div className="mt-8 pt-8 border-t border-luxury-dark/5">
                      <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-4">Admin Controls</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold">Update Payment Received</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-dark/40 text-xs">₹</span>
                              <input 
                                type="number"
                                placeholder="Amount"
                                value={paymentInputs[booking.id] ?? (booking.amountPaid || '')}
                                onChange={(e) => setPaymentInputs(prev => ({...prev, [booking.id]: e.target.value}))}
                                className="w-full pl-7 pr-4 py-2 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold text-xs font-bold"
                              />
                            </div>
                            <button 
                              onClick={() => handleUpdatePayment(booking.id, booking.totalAmount)}
                              className="px-4 py-2 bg-luxury-gold text-luxury-dark text-[10px] font-bold rounded-xl hover:bg-luxury-dark hover:text-white transition-all"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold">Status Actions</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'bookings', booking.id), { status: 'confirmed' }, { merge: true });
                                  await setDoc(doc(db, 'availability', booking.id), { status: 'confirmed' }, { merge: true });
                                  await logAdminAction('confirm_booking', booking.id, `Confirmed booking for ${booking.name}`);
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                                }
                              }}
                              disabled={booking.status === 'confirmed'}
                              className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await setDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' }, { merge: true });
                                  await deleteDoc(doc(db, 'availability', booking.id));
                                  await logAdminAction('cancel_booking', booking.id, `Cancelled booking for ${booking.name}`);
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                                }
                              }}
                              disabled={booking.status === 'cancelled'}
                              className="flex-1 px-3 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold">Danger Zone</label>
                          <div className="flex gap-2">
                            {deletingId === booking.id ? (
                              <>
                                <button 
                                  onClick={async () => {
                                    try {
                                      await deleteDoc(doc(db, 'bookings', booking.id));
                                      await deleteDoc(doc(db, 'availability', booking.id));
                                      await logAdminAction('delete_booking', booking.id, `Deleted booking for ${booking.name}`);
                                      setDeletingId(null);
                                    } catch (error) {
                                      handleFirestoreError(error, OperationType.DELETE, `bookings/${booking.id}`);
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={12} /> Confirm Delete
                                </button>
                                <button 
                                  onClick={() => setDeletingId(null)}
                                  className="px-4 py-2 bg-luxury-cream text-luxury-dark text-[10px] font-bold rounded-xl hover:bg-luxury-dark hover:text-white transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => setDeletingId(booking.id)}
                                className="w-full px-3 py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <Trash2 size={12} /> Delete Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
</motion.div>
);
};
const Navbar = ({ onBookNow, onLogin, user, userRole, onMyBookings }: { 
  onBookNow: () => void; 
  onLogin: () => void;
  user: FirebaseUser | null;
  userRole: string | null;
  onMyBookings: () => void;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Amenities', href: '#amenities' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Location', href: '#location' },
  ];

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
            alt="Unique Farmhouse Logo" 
            className="h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className={`text-2xl font-serif font-bold tracking-tighter ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}>UNIQUE</span>
            <span className={`text-[10px] tracking-[0.4em] uppercase -mt-1 ${isScrolled ? 'text-luxury-gold' : 'text-white/80'}`}>Farmhouse</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium tracking-wide hover:text-luxury-gold transition-colors ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}
            >
              {link.name}
            </a>
          ))}
          
          <div className="h-4 w-px bg-white/20" />

          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={onMyBookings}
                className={`flex items-center gap-2 text-sm font-medium hover:text-luxury-gold transition-colors ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}
              >
                {userRole === 'admin' ? <LayoutDashboard size={18} /> : <History size={18} />}
                {userRole === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
              </button>
              {userRole === 'admin' && (
                <span className="px-2 py-0.5 bg-luxury-gold text-luxury-dark text-[10px] font-bold rounded uppercase tracking-widest">Admin</span>
              )}
              <button 
                onClick={handleSignOut}
                className={`flex items-center gap-2 text-sm font-medium hover:text-red-500 transition-colors ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className={`flex items-center gap-2 text-sm font-medium hover:text-luxury-gold transition-colors ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}
            >
              <User size={18} />
              Sign In
            </button>
          )}

          <button 
            onClick={onBookNow}
            className="luxury-button !py-2 !px-6 text-sm flex items-center gap-2"
          >
            <Calendar size={16} />
            Book Now
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className={isScrolled ? 'text-luxury-dark' : 'text-white'} /> : <Menu className={isScrolled ? 'text-luxury-dark' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-black/5 p-6 md:hidden flex flex-col space-y-4 shadow-xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-lg font-serif text-luxury-dark hover:text-luxury-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            
            <div className="pt-6 border-t border-luxury-dark/5 flex flex-col gap-4">
              {user ? (
                <>
                  <button 
                    onClick={() => {
                      onMyBookings();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-luxury-dark font-bold"
                  >
                    {userRole === 'admin' ? <LayoutDashboard size={20} /> : <History size={20} />}
                    {userRole === 'admin' ? 'Admin Dashboard' : 'My Bookings'}
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-red-500 font-bold"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    onLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 text-luxury-dark font-bold"
                >
                  <User size={20} />
                  Sign In / Sign Up
                </button>
              )}
              <button 
                onClick={() => {
                  onBookNow();
                  setIsMobileMenuOpen(false);
                }}
                className="luxury-button w-full flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onBookNow }: { onBookNow: () => void }) => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg" 
          alt="Unique Farmhouse Exterior" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block text-sm md:text-base uppercase tracking-[0.4em] mb-6 font-medium text-luxury-gold"
        >
          Welcome to Noida's Finest Retreat
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-[1.1]"
        >
          Experience Luxury & Serenity at <br />
          <span className="italic text-luxury-gold">Unique Farmhouse</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto text-white/90"
        >
          Premium Private Villa / Farmhouse Stay in Noida. A sanctuary for celebrations, staycations, and unforgettable moments.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a 
            href="https://wa.me/919313501001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="luxury-button w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] border-none text-white"
          >
            <MessageCircle size={18} /> Send WhatsApp
          </a>
          <a href="tel:+919313501001" className="luxury-button-outline !border-white !text-white hover:!bg-white hover:!text-luxury-dark w-full sm:w-auto flex items-center justify-center gap-2">
            <Phone size={18} /> Call Now
          </a>
          <button onClick={onBookNow} className="luxury-button w-full sm:w-auto flex items-center justify-center gap-2">
            <Calendar size={18} /> Book Now
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-luxury-gold animate-scroll-line"></div>
        </div>
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720358/1_w50zwj.jpg" 
                alt="Luxury Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square overflow-hidden rounded-2xl shadow-2xl border-8 border-white hidden md:block">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/8_ldyqz4.jpg" 
                alt="Private Pool" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">The Experience</span>
            <h2 className="section-title text-left">A Private Farm House / Villa Stay in the Heart of Noida</h2>
            <div className="space-y-6 text-luxury-dark/70 text-lg leading-relaxed">
              <p>
                Unique Farmhouse offers a refined escape from the urban hustle. Our premium 4BHK private villa is designed for those who seek exclusivity, comfort, and a touch of nature without leaving the city.
              </p>
              <p>
                Whether you're planning an intimate family gathering, a vibrant party, or traditional ceremonies like Haldi, Mehndi, and Sangeet, our spacious interiors and lush outdoors provide the perfect backdrop.
              </p>
              <p className="font-medium text-luxury-dark flex items-center gap-2">
                <Heart className="text-luxury-gold fill-luxury-gold" size={20} />
                Proudly LGBTQ+ Friendly & Inclusive
              </p>
              <div className="pt-6 flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Staycations</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Parties</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Weddings</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-sm font-medium">Family Gatherings</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Amenities = () => {
  const amenities = [
    { 
      icon: <Maximize size={32} />, 
      title: "Private Villa", 
      features: [
        { icon: <Bed size={14} />, label: "4BHK Villa" },
        { icon: <Sofa size={14} />, label: "Luxury Decor" }
      ]
    },
    { 
      icon: <Waves size={32} />, 
      title: "Private Pool", 
      features: [
        { icon: <Waves size={14} />, label: "Crystal Clear" },
        { icon: <Sun size={14} />, label: "Exclusive" }
      ]
    },
    { 
      icon: <Shield size={32} />, 
      title: "Secure & Private", 
      features: [
        { icon: <Lock size={14} />, label: "24/7 Secure" },
        { icon: <EyeOff size={14} />, label: "Gated Entry" }
      ]
    },
    { 
      icon: <Users size={32} />, 
      title: "Spacious Interiors", 
      features: [
        { icon: <Users size={14} />, label: "Large Areas" },
        { icon: <LayoutGrid size={14} />, label: "Open Plan" }
      ]
    },
    { 
      icon: <Heart size={32} />, 
      title: "LGBTQ+ Friendly", 
      features: [
        { icon: <ShieldCheck size={14} />, label: "Safe Space" },
        { icon: <Smile size={14} />, label: "Welcoming" }
      ]
    },
    { 
      icon: <Coffee size={32} />, 
      title: "Premium Stay", 
      features: [
        { icon: <Star size={14} />, label: "High-end" },
        { icon: <Sparkles size={14} />, label: "Top Service" }
      ]
    },
    { 
      icon: <Utensils size={32} />, 
      title: "Operated Kitchen", 
      features: [
        { icon: <ChefHat size={14} />, label: "Equipped" },
        { icon: <Utensils size={14} />, label: "Dining Area" }
      ]
    },
    { 
      icon: <Gamepad2 size={32} />, 
      title: "Games & Fun", 
      features: [
        { icon: <Trophy size={14} />, label: "Cricket & Badminton" },
        { icon: <Target size={14} />, label: "Football & Basketball" },
        { icon: <Crown size={14} />, label: "Chess & Carom" },
        { icon: <Dices size={14} />, label: "Ludo & Cards" }
      ]
    },
    { 
      icon: <Wifi size={32} />, 
      title: "High-Speed WiFi", 
      features: [
        { icon: <Signal size={14} />, label: "Connected" },
        { icon: <Zap size={14} />, label: "Fiber Speed" }
      ]
    },
    { 
      icon: <MapPin size={32} />, 
      title: "Easy Access", 
      features: [
        { icon: <Map size={14} />, label: "Sector 135" },
        { icon: <Navigation size={14} />, label: "Convenient" }
      ]
    },
  ];

  return (
    <section id="amenities" className="py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <span className="section-subtitle">Curated For Comfort</span>
        <h2 className="section-title">World-Class Amenities</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-16">
          {amenities.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-xl transition-all duration-500 group flex flex-col items-center text-center"
            >
              <div className="text-luxury-gold mb-4 group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-base md:text-lg font-serif mb-4">{item.title}</h3>
              
              <div className="flex flex-col gap-2 w-full">
                {item.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center justify-center gap-2 px-3 py-1.5 bg-luxury-cream/50 rounded-lg border border-black/5">
                    <span className="text-luxury-gold">{feature.icon}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-luxury-dark/60">{feature.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = ({ onImageClick }: { onImageClick: (img: any) => void }) => {
  const images = [
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/7_njohl7.jpg", title: "Grand Entrance", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/5_jgyrsh.jpg", title: "Luxury Living Room", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/6_vohx9o.jpg", title: "Private Pool Area", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/8_ldyqz4.jpg", title: "Master Bedroom", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720360/9_dimmxb.jpg", title: "Dining Experience", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720361/10_cqiiz0.jpg", title: "Modern Kitchen", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720361/4_rghbk0.jpg", title: "Designer Bathroom", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720366/11_by6w6j.jpg", title: "Lush Garden", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720395/12_u3lwmc.jpg", title: "Evening View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720397/13.1_e9ejt0.jpg", title: "Cozy Lounge", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720429/13_zi1f4k.jpg", title: "Villa Night View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg", title: "Poolside Relaxation", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/14_q7pecm.jpg", title: "Interior Lounge", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/16_hnu7kn.jpg", title: "Bedroom Suite", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/17_dadfct.jpg", title: "Garden Path", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720564/18_jscf2j.jpg", title: "Living Space", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720564/19_qbqdte.jpg", title: "Outdoor Seating", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720565/20_hpzg1q.jpg", title: "Modern Decor", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720581/21_xudpvb.jpg", title: "Villa Facade", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720581/22_adlt8z.jpg", title: "Dining Detail", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720582/23_czfkcy.jpg", title: "Pool View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720582/24.1_mlxwh4.jpg", title: "Bedroom View", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720585/24.2_jwm62w.jpg", title: "Luxury Suite", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720593/24_owlcft.jpg", title: "Villa Exterior", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720596/25_e5rtfq.jpg", title: "Kitchen Detail", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720602/26_bzoxx0.jpg", title: "Bathroom Luxury", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720602/42_ua0rcq.jpg", title: "Garden View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720609/29_dxwezp.jpg", title: "Entrance Gate", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720609/30_jvwyob.jpg", title: "Lounge Area", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720610/31_wbkk7e.jpg", title: "Pool at Night", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720611/32_pry8jz.jpg", title: "Master Bath", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720620/33_o0las8.jpg", title: "Villa Side View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720621/34_hvefd6.jpg", title: "Elegant Living", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720622/35_uwijsn.jpg", title: "Pool Deck", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720632/36_azxit4.jpg", title: "Bedroom Comfort", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720632/37_o1jpil.jpg", title: "Dining Area", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720633/38_zv3kex.jpg", title: "Kitchen Modern", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720644/40_ajnhuo.jpg", title: "Villa Entrance", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/39_nd6ctt.jpg", title: "Lush Lawn", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/41_ahh1ur.jpg", title: "Interior Design", category: "Interior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720645/28_hszcpi.jpg", title: "Poolside View", category: "Exterior" },
    { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720646/27_tffeod.jpg", title: "Villa Night", category: "Exterior" },
  ];

  return (
    <section id="gallery" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <span className="section-subtitle !text-left !mx-0">Visual Journey</span>
            <h2 className="section-title !text-left !mb-0">Peek Inside Our Villa</h2>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {images.map((img, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => onImageClick(img)}
              className="relative group overflow-hidden rounded-2xl cursor-zoom-in"
            >
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-white p-6">
                <span className="text-[10px] uppercase tracking-[0.3em] mb-2 text-luxury-gold font-bold">{img.category}</span>
                <h3 className="text-xl font-serif text-center">{img.title}</h3>
                <div className="mt-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Maximize size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const GalleryModal = ({ image, onClose }: { image: any, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {image && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-7xl w-full max-h-full flex flex-col items-center"
          >
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
            >
              <X size={32} />
            </button>
            
            <img 
              src={image.src} 
              alt={image.title} 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
            
            <div className="mt-6 text-center text-white">
              <span className="text-luxury-gold text-xs uppercase tracking-[0.3em] font-bold mb-2 block">{image.category}</span>
              <h3 className="text-2xl font-serif">{image.title}</h3>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


const ReviewForm = ({ booking, user, onClose, showToast }: { booking: any; user: FirebaseUser; onClose: () => void; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'reviews'), {
        uid: user.uid,
        bookingId: booking.id,
        rating,
        comment,
        status: 'pending',
        createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss'),
        userName: user.displayName || user.email?.split('@')[0] || 'Guest'
      });
      onClose();
      showToast('Thank you for your review! It will be visible once approved by the admin.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">Leave a Review</h3>
      <p className="text-sm text-luxury-dark/60 mb-8">Share your experience at Unique Farmhouse</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-4">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star 
                  size={32} 
                  className={star <= rating ? 'text-luxury-gold fill-luxury-gold' : 'text-luxury-dark/10'} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-2">Your Comment</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full bg-luxury-dark/5 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none"
            placeholder="Tell us about your stay..."
          />
          <p className="text-[10px] text-right text-luxury-dark/30 mt-1">{comment.length}/1000 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-luxury-dark text-white py-4 rounded-2xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
};


const Reviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reviews');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) return null;

  const displayReviews = reviews.length > 0 ? reviews : [{
    id: 'default',
    userName: 'Anuj Mittal',
    rating: 5,
    comment: 'An absolutely stunning property! We hosted a family get-together here and everything was perfect. The pool is clean, the rooms are massive, and the staff is very helpful. Highly recommended for anyone looking for a private luxury stay in Noida.',
    createdAt: new Date().toISOString()
  }];

  const currentReview = displayReviews[currentIndex % displayReviews.length];

  return (
    <section id="reviews" className="py-24 px-6 bg-luxury-dark text-white overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-subtitle !text-luxury-gold">Guest Testimonials</span>
        <h2 className="section-title !text-white">What Our Guests Say</h2>
        
        <div className="relative mt-16">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentReview.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 relative"
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={24} 
                    className={i < currentReview.rating ? 'text-luxury-gold fill-luxury-gold' : 'text-white/10'} 
                  />
                ))}
              </div>
              
              <p className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
                "{currentReview.comment}"
              </p>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-luxury-gold">
                    {currentReview.userName[0].toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-medium">{currentReview.userName}</h4>
                <span className="text-sm text-white/50">Verified Guest</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {displayReviews.length > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-luxury-gold hover:text-luxury-dark transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentIndex((prev) => (prev + 1) % displayReviews.length)}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-luxury-gold hover:text-luxury-dark transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-serif font-bold text-luxury-gold">{averageRating}</span>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      className={i < Math.round(Number(averageRating)) ? 'text-luxury-gold fill-luxury-gold' : 'text-white/20'} 
                    />
                  ))}
                </div>
                <span className="text-xs uppercase tracking-widest text-white/40">Average Rating</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
            <div className="text-white/60 text-sm">
              Based on {reviews.length || 1} Verified {reviews.length === 1 || reviews.length === 0 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BookingCalendar = ({ 
  selected, 
  onChange, 
  minDate, 
  filterDate,
  dayClassName, 
  placeholderText,
  startDate,
  endDate,
  selectsStart,
  selectsEnd,
  className
}: any) => {
  const renderDayContents = (day: number, date: Date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const price = isWeekend ? 18000 : 15000;
    
    return (
      <div className="group relative flex flex-col items-center justify-center w-full h-full">
        <span className="relative z-10">{day}</span>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-luxury-dark text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] shadow-2xl border border-luxury-gold/30 scale-75 group-hover:scale-100 origin-bottom">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-luxury-gold/60 font-bold uppercase tracking-tighter">Price</span>
            <span className="font-bold">₹{price.toLocaleString()}</span>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-luxury-dark rotate-45 border-r border-b border-luxury-gold/30" />
        </div>
      </div>
    );
  };

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      filterDate={filterDate}
      dayClassName={dayClassName}
      placeholderText={placeholderText}
      renderDayContents={renderDayContents}
      startDate={startDate}
      endDate={endDate}
      selectsStart={selectsStart}
      selectsEnd={selectsEnd}
      dateFormat="dd/MM/yyyy"
      className={className}
    />
  );
};

const BookingForm = ({ isModal = false, onClose, user, editBooking, userRole, onLogin, allBookings = [], showToast }: { 
  isModal?: boolean, 
  onClose?: () => void,
  user: FirebaseUser | null,
  editBooking?: any,
  userRole?: string | null,
  onLogin?: () => void,
  allBookings?: any[],
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}) => {
  const [name, setName] = useState(editBooking?.name || (userRole === 'admin' && !editBooking ? '' : user?.displayName || ''));
  const [mobile, setMobile] = useState(editBooking?.mobile || '');
  const [email, setEmail] = useState(editBooking?.email || (userRole === 'admin' && !editBooking ? '' : user?.email || ''));
  const [guestsDay, setGuestsDay] = useState(editBooking?.guestsDay || 1);
  const [guestsNight, setGuestsNight] = useState(editBooking?.guestsNight || 0);
  const [occasion, setOccasion] = useState(editBooking?.occasion || '');
  const [checkIn, setCheckIn] = useState<Date | null>(editBooking?.checkIn ? parse(editBooking.checkIn, 'dd/MM/yyyy', new Date()) : null);
  const [checkOut, setCheckOut] = useState<Date | null>(editBooking?.checkOut ? parse(editBooking.checkOut, 'dd/MM/yyyy', new Date()) : null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdminBooking, setIsAdminBooking] = useState(userRole === 'admin' && !editBooking);
  const [bookingAmount, setBookingAmount] = useState<number>(editBooking?.bookingAmount || (editBooking ? (editBooking.totalAmount - (editBooking.securityDeposit || 5000)) : 0));
  const [securityAmount, setSecurityAmount] = useState<number>(editBooking?.securityDeposit || 5000);
  const [amountPaid, setAmountPaid] = useState<number>(editBooking?.amountPaid || 0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!editBooking && checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      let total = 0;
      let current = new Date(start);
      
      while (current < end) {
        const day = current.getDay(); 
        if (day >= 1 && day <= 4) {
          total += 15000;
        } else {
          total += 18000;
        }
        current.setDate(current.getDate() + 1);
      }
      setBookingAmount(total);
    }
  }, [checkIn, checkOut, editBooking]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const hasConflict = allBookings.some(b => {
        if (editBooking && b.id === editBooking.id) return false;
        const bStart = parse(b.checkIn, 'dd/MM/yyyy', new Date());
        bStart.setHours(0, 0, 0, 0);
        const bEnd = parse(b.checkOut, 'dd/MM/yyyy', new Date());
        bEnd.setHours(0, 0, 0, 0);
        const reqStart = new Date(checkIn);
        reqStart.setHours(0, 0, 0, 0);
        const reqEnd = new Date(checkOut);
        reqEnd.setHours(0, 0, 0, 0);
        
        return (reqStart < bEnd && reqEnd > bStart);
      });
      
      if (hasConflict) {
        setErrors(prev => ({ ...prev, checkIn: "Selected dates are already booked" }));
      } else {
        setErrors(prev => {
          const next = { ...prev };
          delete next.checkIn;
          return next;
        });
      }
    }
  }, [checkIn, checkOut, allBookings, editBooking]);

  const getDayClassName = useCallback((date: Date) => {
    const booking = allBookings.find(b => {
      const start = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      const end = parse(b.checkOut, 'dd/MM/yyyy', new Date());
      return date >= start && date < end;
    });
    if (!booking) return undefined;
    return `sold-out booking-${booking.status}`;
  }, [allBookings]);

  const { excludeCheckInDates, excludeCheckOutDates } = useMemo(() => {
    const checkInDates: Date[] = [];
    const checkOutDates: Date[] = [];
    
    allBookings.forEach(b => {
      if (editBooking && b.id === editBooking.id) return;
      
      const start = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      const end = parse(b.checkOut, 'dd/MM/yyyy', new Date());
      
      // For check-in: exclude from start to end-1
      let currentIn = new Date(start);
      while (currentIn < end) {
        checkInDates.push(new Date(currentIn));
        currentIn.setDate(currentIn.getDate() + 1);
      }

      // For check-out: exclude from start+1 to end
      let currentOut = new Date(start);
      currentOut.setDate(currentOut.getDate() + 1);
      while (currentOut <= end) {
        checkOutDates.push(new Date(currentOut));
        currentOut.setDate(currentOut.getDate() + 1);
      }
    });
    
    return { 
      excludeCheckInDates: checkInDates, 
      excludeCheckOutDates: checkOutDates 
    };
  }, [allBookings, editBooking]);

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: {[key: string]: string} = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!checkIn) {
      newErrors.checkIn = "Check-in date is required";
    } else {
      const checkInDate = new Date(checkIn);
      if (checkInDate < today && !editBooking) {
        newErrors.checkIn = "Check-in date cannot be in the past";
      }
      
      // Check for conflicts
      const hasConflict = allBookings.some(b => {
        if (editBooking && b.id === editBooking.id) return false;
        const bStart = parse(b.checkIn, 'dd/MM/yyyy', new Date());
        bStart.setHours(0, 0, 0, 0);
        const bEnd = parse(b.checkOut, 'dd/MM/yyyy', new Date());
        bEnd.setHours(0, 0, 0, 0);
        
        const reqStart = new Date(checkIn);
        reqStart.setHours(0, 0, 0, 0);
        const reqEnd = checkOut ? new Date(checkOut) : new Date(checkIn);
        reqEnd.setHours(0, 0, 0, 0);
        
        return (reqStart < bEnd && reqEnd > bStart);
      });
      
      if (hasConflict) {
        newErrors.checkIn = "Selected dates are already booked";
      }
    }
    
    if (!checkOut) {
      newErrors.checkOut = "Check-out date is required";
    } else if (checkIn) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out must be after check-in";
      }
    }
    
    if (guestsDay < 1) {
      newErrors.guestsDay = "At least 1 day guest is required";
    } else if (guestsDay > 50) {
      newErrors.guestsDay = "Maximum 50 day guests allowed";
    }
    
    if (guestsNight < 0) {
      newErrors.guestsNight = "Guests cannot be negative";
    } else if (guestsNight > 12) {
      newErrors.guestsNight = "Maximum 12 night guests allowed";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);

    const totalAmount = bookingAmount + securityAmount;
    const securityDeposit = securityAmount;

    try {
      let currentUser = user;
      if (!currentUser && !isAdminBooking) {
        showToast("Please sign in with Google to complete your booking.", "info");
        onLogin?.();
        setLoading(false);
        return;
      }

      if (currentUser || isAdminBooking) {
        const bookingData = {
          uid: editBooking ? editBooking.uid : (isAdminBooking ? 'admin_manual' : currentUser?.uid),
          checkIn: checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : '',
          checkOut: checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : '',
          guestsDay,
          guestsNight,
          status: editBooking ? editBooking.status : (isAdminBooking ? 'confirmed' : 'pending'),
          bookingAmount,
          totalAmount,
          amountPaid: amountPaid,
          securityDeposit,
          paymentStatus: amountPaid >= totalAmount ? 'paid' : (amountPaid > 0 ? 'part-paid' : 'unpaid'),
          createdAt: editBooking ? editBooking.createdAt : format(new Date(), 'dd/MM/yyyy, HH:mm:ss'),
          name,
          mobile,
          email,
          occasion,
          bookedBy: userRole === 'admin' ? 'admin' : 'client'
        };

        if (editBooking) {
          await setDoc(doc(db, 'bookings', editBooking.id), bookingData);
          await setDoc(doc(db, 'availability', editBooking.id), {
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            status: bookingData.status
          });
          if (userRole === 'admin') {
            await logAdminAction('edit_booking', editBooking.id, `Updated booking for ${name}`);
          }
        } else {
          const docRef = await addDoc(collection(db, 'bookings'), bookingData);
          await setDoc(doc(db, 'availability', docRef.id), {
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            status: bookingData.status
          });
          if (userRole === 'admin') {
            await logAdminAction('create_booking', docRef.id, `Created manual booking for ${name}`);
          }
        }
      }

      // Also send WhatsApp message for immediate attention
      const message = `*${editBooking ? 'Updated' : 'New'} Booking Request for Unique Farmhouse*%0A%0A` +
        `*Booking ID:* ${editBooking ? editBooking.id.slice(0, 8) : 'New'}%0A` +
        `*Name:* ${name || 'Not specified'}%0A` +
        `*Mobile:* ${mobile || 'Not specified'}%0A` +
        `*Email:* ${email || 'Not specified'}%0A` +
        `*Guests (Day):* ${guestsDay}%0A` +
        `*Guests (Night):* ${guestsNight}%0A` +
        `*Occasion:* ${occasion || 'Not specified'}%0A` +
        `*Check-In:* ${checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : 'Not specified'}%0A` +
        `*Check-Out:* ${checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : 'Not specified'}%0A` +
        `*Booking Amount:* ₹${bookingAmount.toLocaleString()}%0A` +
        `*Security Deposit:* ₹${securityAmount.toLocaleString()}%0A` +
        `*Total Amount:* ₹${totalAmount.toLocaleString()}`;
      
      window.open(`https://wa.me/919313501001?text=${message}`, '_blank');
      
      setSuccess(true);
    } catch (err) {
      handleFirestoreError(err, editBooking ? OperationType.UPDATE : OperationType.CREATE, editBooking ? `bookings/${editBooking.id}` : 'bookings');
      showToast(`Failed to ${editBooking ? 'update' : 'save'} booking. Please try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const totalAmount = bookingAmount + securityAmount;

    return (
      <div className="py-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">Booking Request Received!</h3>
        <p className="text-luxury-dark/60 mb-8">
          Your booking request for <strong>{checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : ''}</strong> to <strong>{checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : ''}</strong> has been successfully submitted. We will contact you shortly for payment and confirmation.
        </p>
        
        <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-3xl p-6 mb-8 text-left">
          <p className="text-xs uppercase tracking-widest font-bold text-luxury-dark mb-4">Next Steps & Payment Instructions</p>
          <ul className="text-sm text-luxury-dark/70 space-y-4">
            <li className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-dark text-xs flex items-center justify-center shrink-0 font-bold shadow-sm">1</span>
              <div>
                <p className="font-bold text-luxury-dark">Availability Review</p>
                <p className="text-xs opacity-80">Our team will review your request and verify availability for the selected dates.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-dark text-xs flex items-center justify-center shrink-0 font-bold shadow-sm">2</span>
              <div>
                <p className="font-bold text-luxury-dark">Payment to Confirm</p>
                <p className="text-xs opacity-80">To secure your booking, a minimum 50% advance payment is required via UPI. You can find payment details in "My Bookings" once your request is reviewed, or contact us directly.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-dark text-xs flex items-center justify-center shrink-0 font-bold shadow-sm">3</span>
              <div>
                <p className="font-bold text-luxury-dark">Instant Confirmation</p>
                <p className="text-xs opacity-80">Once payment proof is verified on WhatsApp (+91 93135 01001), your status will change to "Confirmed".</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-luxury-cream/50 rounded-3xl p-8 text-left border border-luxury-dark/5 mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-luxury-dark/5 pb-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold">Booking Summary</p>
            <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
              Payment Pending
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Guest Name</p>
                <p className="font-bold text-luxury-dark flex items-center gap-2">
                  <User size={14} className="text-luxury-gold" />
                  {name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Mobile Number</p>
                <p className="font-bold text-luxury-dark flex items-center gap-2">
                  <Phone size={14} className="text-luxury-gold" />
                  {mobile}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-luxury-dark flex items-center gap-2">
                  <Mail size={14} className="text-luxury-gold" />
                  {email}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Check-In</p>
                  <p className="font-bold text-luxury-dark">{checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Check-Out</p>
                  <p className="font-bold text-luxury-dark">{checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Guests (Day)</p>
                  <p className="font-bold text-luxury-dark">{guestsDay} Guests</p>
                </div>
                <div>
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Guests (Night)</p>
                  <p className="font-bold text-luxury-dark">{guestsNight} Guests</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Occasion</p>
                <p className="font-bold text-luxury-dark">{occasion || 'General Stay'}</p>
              </div>
              <div className="pt-4 border-t border-luxury-dark/5 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booking Amount</p>
                  <p className="font-bold text-luxury-dark">₹{bookingAmount.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Security Deposit</p>
                  <p className="font-bold text-luxury-dark">₹{securityAmount.toLocaleString()}</p>
                </div>
                <div className="pt-2 border-t border-luxury-dark/5 flex justify-between items-center">
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest font-bold">Total Amount</p>
                  <p className="text-xl font-serif font-bold text-luxury-dark">₹{totalAmount.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-luxury-dark/40 italic mt-1">(Security deposit is refundable after checkout)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose}
            className="luxury-button flex-1"
          >
            Close & Return
          </button>
          <a 
            href={`https://wa.me/919313501001?text=${encodeURIComponent(`*Booking Request Summary for Unique Farmhouse*\n\n*Name:* ${name}\n*Check-In:* ${checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : 'N/A'}\n*Check-Out:* ${checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : 'N/A'}\n*Guests:* ${guestsDay} Day / ${guestsNight} Night\n*Total Amount:* ₹${totalAmount.toLocaleString()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-button-outline flex-1 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            Share on WhatsApp
          </a>
        </div>
        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mt-6">You can track this booking in "My Bookings" section</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleBookNow}>
      {editBooking && editBooking.status === 'confirmed' && (editBooking.paymentStatus === 'unpaid' || editBooking.paymentStatus === 'part-paid') && (
        <div className="p-6 bg-luxury-gold/5 border border-luxury-gold/20 rounded-2xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-dark">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="font-bold text-luxury-dark">Complete Payment</p>
              <p className="text-xs text-luxury-dark/40">Pay via UPI to secure your booking</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-4 rounded-2xl border border-luxury-dark/5">
            <div className="w-32 h-32 bg-luxury-cream rounded-xl flex items-center justify-center border border-luxury-dark/5 overflow-hidden shrink-0">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${bookingAmount + securityAmount - amountPaid}&cu=INR&tn=Booking%20${editBooking.id.slice(0, 8)}`)}`}
                alt="Payment QR Code"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-3 w-full">
              <a 
                href={`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${bookingAmount + securityAmount - amountPaid}&cu=INR&tn=Booking%20${editBooking.id.slice(0, 8)}`}
                className="luxury-button w-full flex items-center justify-center gap-2 py-3"
              >
                <Zap size={16} /> Pay with UPI
              </a>
              <p className="text-[10px] text-luxury-dark/40 leading-relaxed">
                <strong>Instructions:</strong> Scan the QR code or click the button above to pay via any UPI app (PhonePe, GPay, Paytm). After payment, please share the screenshot on <a href="https://wa.me/919313501001" target="_blank" rel="noopener noreferrer" className="text-luxury-gold font-bold underline">WhatsApp</a> for verification.
              </p>
            </div>
          </div>
        </div>
      )}
      {userRole === 'admin' && !editBooking && (
        <div className="p-4 bg-luxury-gold/10 border border-luxury-gold/20 rounded-xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-dark">
              <User size={20} />
            </div>
            <div>
              <p className="font-bold text-luxury-dark text-sm">Admin Booking Mode</p>
              <p className="text-[10px] text-luxury-dark/60 uppercase tracking-widest">Booking on behalf of customer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newMode = !isAdminBooking;
              setIsAdminBooking(newMode);
              if (newMode) {
                setName('');
                setEmail('');
              } else {
                setName(user?.displayName || '');
                setEmail(user?.email || '');
              }
            }}
            className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              isAdminBooking 
                ? 'bg-luxury-dark text-white' 
                : 'bg-white text-luxury-dark border border-luxury-dark/10'
            }`}
          >
            {isAdminBooking ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      )}
      {!user && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-emerald-600 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>Quick Booking:</strong> Sign in with Google to manage your bookings and track payment status easily.
            </p>
          </div>
          <button
            type="button"
            onClick={onLogin}
            className="px-4 py-2 bg-luxury-dark text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-luxury-gold hover:text-luxury-dark transition-all whitespace-nowrap"
          >
            Sign In with Google
          </button>
        </div>
      )}

      {allBookings.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-red-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Sold Out Dates</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allBookings
              .filter(b => parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date())
              .sort((a, b) => parse(a.checkIn, 'dd/MM/yyyy', new Date()).getTime() - parse(b.checkIn, 'dd/MM/yyyy', new Date()).getTime())
              .slice(0, 5)
              .map((b, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-red-100 rounded text-[10px] text-red-700 font-medium">
                  {b.checkIn} - {b.checkOut}
                </span>
              ))}
            {allBookings.filter(b => parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date()).length > 5 && (
              <span className="text-[10px] text-red-400 self-center">+ more</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              required
              placeholder="Your Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => {
                  const next = {...prev};
                  delete next.name;
                  return next;
                });
              }}
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.name ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`} 
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
          </div>
          {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Mobile No.</label>
          <div className="relative">
            <input 
              type="tel" 
              required
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (errors.mobile) setErrors(prev => {
                  const next = {...prev};
                  delete next.mobile;
                  return next;
                });
              }}
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.mobile ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`} 
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
          </div>
          {errors.mobile && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.mobile}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Email Address</label>
        <div className="relative">
          <input 
            type="email" 
            required
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => {
                const next = {...prev};
                delete next.email;
                return next;
              });
            }}
            className={`w-full px-4 py-4 bg-luxury-cream border ${errors.email ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`} 
          />
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
        </div>
        {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Guests (Day Stay - Max 50)</label>
          <div className="relative">
            <input 
              type="number" 
              min="1"
              max="50"
              value={guestsDay}
              onChange={(e) => {
                setGuestsDay(parseInt(e.target.value) || 1);
                if (errors.guestsDay) setErrors(prev => {
                  const next = {...prev};
                  delete next.guestsDay;
                  return next;
                });
              }}
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.guestsDay ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`}
              placeholder="Number of day guests"
            />
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
          </div>
          {errors.guestsDay && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.guestsDay}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Guests (Night Stay - Max 12)</label>
          <div className="relative">
            <input 
              type="number" 
              min="0"
              max="12"
              value={guestsNight}
              onChange={(e) => {
                setGuestsNight(parseInt(e.target.value) || 0);
                if (errors.guestsNight) setErrors(prev => {
                  const next = {...prev};
                  delete next.guestsNight;
                  return next;
                });
              }}
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.guestsNight ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`}
              placeholder="Number of night guests"
            />
            <Moon className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
          </div>
          {errors.guestsNight && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.guestsNight}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Occasion</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="e.g. Birthday, Anniversary, Corporate Event"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
          />
          <PartyPopper className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Check-In (At 2:00 PM)</label>
          <div className="relative">
            <BookingCalendar
              selected={checkIn}
              onChange={(date: Date) => {
                setCheckIn(date);
                if (errors.checkIn) setErrors(prev => {
                  const next = {...prev};
                  delete next.checkIn;
                  return next;
                });
              }}
              minDate={new Date()}
              filterDate={(date: Date) => !excludeCheckInDates.some(d => d.toDateString() === date.toDateString())}
              dayClassName={getDayClassName}
              placeholderText="Select check-in date"
              startDate={checkIn}
              endDate={checkOut}
              selectsStart
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.checkIn ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`}
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20 pointer-events-none" size={16} />
          </div>
          {errors.checkIn && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.checkIn}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Check-Out (At 11:00 AM)</label>
          <div className="relative">
            <BookingCalendar
              selected={checkOut}
              onChange={(date: Date) => {
                setCheckOut(date);
                if (errors.checkOut) setErrors(prev => {
                  const next = {...prev};
                  delete next.checkOut;
                  return next;
                });
              }}
              minDate={checkIn ? addDays(checkIn, 1) : new Date()}
              filterDate={(date: Date) => !excludeCheckOutDates.some(d => d.toDateString() === date.toDateString())}
              dayClassName={getDayClassName}
              placeholderText="Select check-out date"
              startDate={checkIn}
              endDate={checkOut}
              selectsEnd
              className={`w-full px-4 py-4 bg-luxury-cream border ${errors.checkOut ? 'border-red-500' : 'border-black/5'} rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm`}
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20 pointer-events-none" size={16} />
          </div>
          {errors.checkOut && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.checkOut}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Booking Amount (₹)</label>
          <div className="relative">
            <input 
              type="number" 
              required
              value={bookingAmount}
              onChange={(e) => setBookingAmount(parseInt(e.target.value) || 0)}
              readOnly={userRole !== 'admin'}
              className={`w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm font-bold ${userRole !== 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
            <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
          <div className="flex gap-4 px-1">
            <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-luxury-gold" />
              Weekday: ₹15,000
            </p>
            <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-luxury-gold" />
              Weekend: ₹18,000
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Security Deposit (₹)</label>
          <div className="relative">
            <input 
              type="number" 
              required
              value={securityAmount}
              onChange={(e) => setSecurityAmount(parseInt(e.target.value) || 0)}
              readOnly={userRole !== 'admin'}
              className={`w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm font-bold ${userRole !== 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Amount Paid (₹)</label>
          <div className="relative">
            <input 
              type="number" 
              required
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm font-bold" 
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
          <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest px-1">
            Current Balance: ₹{(bookingAmount + securityAmount - amountPaid).toLocaleString()}
          </p>
        </div>
      )}

      <div className="p-4 bg-luxury-dark/5 rounded-xl flex items-center justify-between">
        <span className="text-xs font-bold text-luxury-dark/60 uppercase tracking-widest">Total Amount</span>
        <span className="text-xl font-serif font-bold text-luxury-dark">₹{(bookingAmount + securityAmount).toLocaleString()}</span>
      </div>

      <button 
        type="submit"
        disabled={loading || !!errors.checkIn || !!errors.checkOut}
        className="w-full bg-luxury-dark text-white py-4 rounded-xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Calendar size={18} />
            {editBooking ? 'Update Booking' : 'Request Booking'}
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-luxury-dark/30 uppercase tracking-widest mt-4">
        By clicking, you agree to our terms and conditions.
      </p>
    </form>
  );
};

const BookingModal = ({ isOpen, onClose, user, userRole, onLogin, allBookings, showToast }: { isOpen: boolean, onClose: () => void, user: FirebaseUser | null, userRole: string | null, onLogin: () => void, allBookings: any[], showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-dark/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-luxury-gold text-xs uppercase tracking-[0.3em] font-bold mb-2 block">Reserve Your Stay</span>
                  <h2 className="text-3xl font-serif text-luxury-dark">Book Now</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-luxury-cream rounded-full transition-colors text-luxury-dark/40 hover:text-luxury-dark"
                >
                  <X size={24} />
                </button>
              </div>
              <BookingForm isModal onClose={onClose} user={user} userRole={userRole} onLogin={onLogin} allBookings={allBookings} showToast={showToast} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BookingSection = ({ onBookNow }: { onBookNow: () => void }) => {
  return (
    <section id="booking" className="py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Reserve Your Stay</span>
            <h2 className="section-title text-left">Book Your Experience</h2>
            <p className="text-luxury-dark/60 mb-8 text-lg">
              Ready for an unforgettable stay? Our premium 4BHK villa is waiting for you. Experience the pinnacle of luxury and privacy in Noida.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Instant Response</h4>
                  <p className="text-sm text-luxury-dark/50">Our team responds to WhatsApp inquiries within minutes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Verified Booking</h4>
                  <p className="text-sm text-luxury-dark/50">Secure your dates with our official WhatsApp channel.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-medium">Direct Support</h4>
                  <p className="text-sm text-luxury-dark/50">Call us directly at +91 9313501001 for any special requests.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-luxury-dark p-12 rounded-3xl shadow-2xl border border-white/10 text-center text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-luxury-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Calendar size={40} className="text-luxury-gold" />
              </div>
              <h3 className="text-3xl font-serif mb-6">Ready to Experience Luxury?</h3>
              <p className="text-white/60 mb-10 max-w-md mx-auto">
                Check availability and book your stay instantly through our secure booking portal.
              </p>
              <button 
                onClick={onBookNow}
                className="luxury-button w-full !py-5 text-lg flex items-center justify-center gap-3 group/btn"
              >
                Open Booking Portal <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
              <div className="mt-8 flex items-center justify-center gap-6 text-white/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-luxury-gold" />
                  <span className="text-[10px] uppercase tracking-widest">Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-luxury-gold" />
                  <span className="text-[10px] uppercase tracking-widest">Instant Confirmation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


const LocationSection = () => {
  return (
    <section id="location" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Our Location</span>
            <h2 className="section-title text-left">Find Us in Noida</h2>
            
            <div className="space-y-8 mt-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-luxury-gold shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-xl font-serif mb-2">Address</h4>
                  <p className="text-luxury-dark/60 leading-relaxed">
                    Plot No 22, Phase 17, Sector 135, <br />
                    Noida, Uttar Pradesh 201305
                  </p>
                  <div className="mt-4 inline-block px-3 py-1 bg-luxury-cream border border-luxury-gold/20 rounded text-xs font-mono text-luxury-gold">
                    Plus Code: F9PV+JW Noida, Uttar Pradesh
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://www.google.com/maps/place/ELIVAAS+Unique+Farmhouse/data=!4m2!3m1!1s0x0:0x96585d25a6908e74?sa=X&ved=1t:2428&ictx=111" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="luxury-button flex items-center justify-center gap-2"
                >
                  <Navigation size={18} /> Get Directions
                </a>
                <a 
                  href="tel:+919313501001" 
                  className="luxury-button-outline flex items-center justify-center gap-2"
                >
                  <Phone size={18} /> Call Property
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-black/5"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.223456789!2d77.4012!3d28.5034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x96585d25a6908e74!2sELIVAAS%20Unique%20Farmhouse!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="Unique Farmhouse Location"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-luxury-dark text-white py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <a href="#" className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
                alt="Unique Farmhouse Logo" 
                className="h-16 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-3xl font-serif font-bold tracking-tighter">UNIQUE</span>
                <span className="text-xs tracking-[0.4em] uppercase -mt-1 text-luxury-gold">Farmhouse</span>
              </div>
            </a>
            <p className="text-white/50 text-sm leading-relaxed">
              Experience the pinnacle of luxury and privacy in Noida. Our farmhouse is the ideal destination for celebrations and serene retreats.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Heart size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-luxury-gold transition-colors">
                <Star size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><a href="#about" className="hover:text-luxury-gold transition-colors">About Us</a></li>
              <li><a href="#amenities" className="hover:text-luxury-gold transition-colors">Amenities</a></li>
              <li><a href="#gallery" className="hover:text-luxury-gold transition-colors">Gallery</a></li>
              <li><a href="#reviews" className="hover:text-luxury-gold transition-colors">Reviews</a></li>
              <li><a href="#booking" className="hover:text-luxury-gold transition-colors">Book Now</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Contact Info</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-luxury-gold" />
                <a href="tel:+919313501001" className="hover:text-luxury-gold transition-colors">+91 9313501001</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-luxury-gold mt-1" />
                <span>Plot No 22, Phase 17, Sector 135, Noida, UP 201305</span>
              </li>
              <li className="flex items-center gap-3">
                <Heart size={16} className="text-luxury-gold" />
                <span>LGBTQ+ Friendly Stay</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Newsletter</h4>
            <p className="text-white/50 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
            <div className="flex gap-2 mb-8">
              <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-luxury-gold w-full" />
              <button className="bg-luxury-gold text-luxury-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors">Join</button>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <h5 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4">Secure Payments</h5>
              <div className="flex flex-wrap gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="bg-white/10 p-2 rounded flex items-center justify-center" title="Visa">
                  <CreditCard size={16} />
                </div>
                <div className="bg-white/10 p-2 rounded flex items-center justify-center" title="Mastercard">
                  <CreditCard size={16} />
                </div>
                <div className="bg-white/10 p-2 rounded flex items-center justify-center" title="UPI">
                  <Zap size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            <div className="flex items-center gap-3 text-white/40">
              <ShieldCheck size={24} className="text-luxury-gold/50" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">SSL Secured</span>
                <span className="text-[9px] opacity-60">256-bit Encryption</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Lock size={24} className="text-luxury-gold/50" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Safe Booking</span>
                <span className="text-[9px] opacity-60">Privacy Protected</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Star size={24} className="text-luxury-gold/50" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Top Rated</span>
                <span className="text-[9px] opacity-60">Verified Property</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">© 2024 Unique Farmhouse. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const Toast = () => {
    if (!toast) return null;
    const colors = {
      success: 'bg-emerald-600',
      error: 'bg-red-600',
      info: 'bg-luxury-dark'
    };
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl flex items-center gap-3 ${colors[toast.type]}`}
      >
        {toast.type === 'success' && <CheckCircle2 size={18} />}
        {toast.type === 'error' && <AlertCircle size={18} />}
        {toast.type === 'info' && <Info size={18} />}
        {toast.message}
        <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      </motion.div>
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'availability'), where('status', 'in', ['confirmed', 'pending']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllBookings(bookingsData);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'availability'));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Fetch user role
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // Default for new users if not set during signup
            const role = currentUser.email === 'anujkumarmittal@gmail.com' ? 'admin' : 'client';
            setUserRole(role);
            await setDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Guest',
              role: role,
              isAnonymous: currentUser.isAnonymous,
              createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
            }, { merge: true });
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => setIsBookingModalOpen(false);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-luxury-dark">
        <div className="flex flex-col items-center gap-6">
          <img 
            src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
            alt="Logo" 
            className="h-24 w-auto animate-pulse"
            referrerPolicy="no-referrer"
          />
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-luxury-gold"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Navbar 
        onBookNow={openBookingModal} 
        onLogin={() => setIsAuthModalOpen(true)}
        user={user}
        userRole={userRole}
        onMyBookings={() => setIsDashboardOpen(true)}
      />
      <main>
        <Hero onBookNow={openBookingModal} />
        <About />
        <Amenities />
        <Gallery onImageClick={setSelectedImage} />
        <Reviews />
        <BookingSection onBookNow={openBookingModal} />
        <LocationSection />
      </main>
      <Footer />
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={closeBookingModal} 
        user={user} 
        userRole={userRole} 
        onLogin={() => setIsAuthModalOpen(true)} 
        allBookings={allBookings}
        showToast={showToast}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <GalleryModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <AnimatePresence>
        {isDashboardOpen && user && (
          <MyBookings user={user} userRole={userRole} onClose={() => setIsDashboardOpen(false)} onLogin={() => setIsAuthModalOpen(true)} allBookings={allBookings} showToast={showToast} />
        )}
      </AnimatePresence>

      {/* Floating Action Buttons for Mobile */}
      <div className="fixed bottom-6 left-6 right-6 z-40 md:hidden flex gap-3">
        <button 
          onClick={openBookingModal}
          className="flex-1 bg-luxury-gold text-luxury-dark py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl font-bold"
        >
          <Calendar size={20} /> Book Now
        </button>
        <a 
          href="https://wa.me/919313501001" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl font-bold"
        >
          <MessageCircle size={20} /> WhatsApp
        </a>
      </div>

      {/* Desktop Floating WhatsApp Button */}
      <motion.a
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/919313501001"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 hidden md:flex bg-[#25D366] text-white p-4 rounded-full shadow-2xl items-center justify-center group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-white text-luxury-dark px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with us on WhatsApp
        </span>
      </motion.a>

      <AnimatePresence>
        {toast && <Toast />}
      </AnimatePresence>
    </div>
  );
}
