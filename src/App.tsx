import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Clock,
  AlertCircle,
  IndianRupee,
  Copy,
  MessageSquare
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
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
  getDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
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
  // throw new Error(JSON.stringify(errInfo)); // Optional: throw to propagate
}

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          role: 'client'
        });
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
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
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-luxury-dark/60 text-sm">
                  {isLogin ? 'Enter your details to manage your bookings' : 'Join us for a luxury farmhouse experience'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/40 mb-2 ml-1">Password</label>
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

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-dark text-white py-4 rounded-2xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>

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
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-luxury-dark/60 hover:text-luxury-dark transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MyBookings = ({ user, userRole, onClose }: { user: FirebaseUser; userRole: string | null; onClose: () => void }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors mb-4 group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-luxury-dark">
              {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
            </h1>
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
            <p className="text-luxury-dark/40 font-medium">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-luxury-dark/5 rounded-3xl p-12 md:p-24 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar size={32} className="text-luxury-dark/20" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">
              {userRole === 'admin' ? 'No Bookings in System' : 'No Bookings Found'}
            </h3>
            <p className="text-luxury-dark/60 mb-8 max-w-md mx-auto">
              {userRole === 'admin' 
                ? 'There are currently no bookings in the system. New bookings will appear here as they are made.' 
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
            {bookings.map((booking) => (
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
                      {userRole === 'admin' && (
                        <div className="mt-3 p-3 bg-luxury-dark/5 rounded-xl border border-luxury-dark/5">
                          <p className="text-xs font-bold text-luxury-dark flex items-center gap-2">
                            <User size={12} className="text-luxury-gold" />
                            {booking.name || 'Guest'}
                          </p>
                          <p className="text-[10px] text-luxury-dark/60 flex items-center gap-2 mt-1">
                            <Mail size={10} />
                            {booking.email}
                          </p>
                          <p className="text-[10px] text-luxury-dark/60 flex items-center gap-2 mt-1">
                            <Phone size={10} />
                            {booking.mobile}
                          </p>
                        </div>
                      )}
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-[0.2em] mt-3">Booking ID: {booking.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-luxury-dark">₹{booking.totalAmount.toLocaleString()}</p>
                      <p className={`text-xs font-bold mt-1 ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {booking.paymentStatus === 'paid' ? 'Payment Completed' : 'Payment Pending'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-luxury-dark/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Check-In (2 PM)</p>
                      <p className="font-bold text-luxury-dark">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Check-Out (11 AM)</p>
                      <p className="font-bold text-luxury-dark">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests</p>
                      <p className="font-bold text-luxury-dark">{booking.guests} Guests</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Occasion</p>
                      <p className="font-bold text-luxury-dark">{booking.occasion || 'General Stay'}</p>
                    </div>
                  </div>

                  {booking.paymentStatus === 'unpaid' && booking.status === 'confirmed' && (
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
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${booking.totalAmount}&cu=INR&tn=Booking%20${booking.id.slice(0, 8)}`)}`}
                              alt="Payment QR Code"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 space-y-3 w-full">
                            <a 
                              href={`upi://pay?pa=9313501001@pthdfc&pn=Unique%20Farmhouse&am=${booking.totalAmount}&cu=INR&tn=Booking%20${booking.id.slice(0, 8)}`}
                              className="w-full bg-luxury-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10"
                            >
                              <Zap size={18} />
                              Pay ₹{booking.totalAmount.toLocaleString()} Now
                            </a>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('9313501001@pthdfc');
                                  alert('UPI ID copied to clipboard!');
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
                      
                      <p className="text-[10px] text-center text-luxury-dark/30 mt-4 uppercase tracking-widest leading-relaxed">
                        Scan QR code with any UPI App or click "Pay Now" on mobile. <br />
                        After payment, send proof via WhatsApp for instant confirmation.
                      </p>
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
                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">Booking Confirmed</p>
                        <p className="text-sm text-emerald-700/70">We are excited to host you! See you soon.</p>
                      </div>
                    </div>
                  )}

                  {userRole === 'admin' && (
                    <div className="mt-8 pt-8 border-t border-luxury-dark/5 flex flex-wrap gap-3">
                      <p className="w-full text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-1">Admin Controls</p>
                      <button 
                        onClick={async () => {
                          try {
                            await setDoc(doc(db, 'bookings', booking.id), { status: 'confirmed' }, { merge: true });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                          }
                        }}
                        disabled={booking.status === 'confirmed'}
                        className="flex-1 min-w-[120px] px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm Booking
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await setDoc(doc(db, 'bookings', booking.id), { status: 'cancelled' }, { merge: true });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                          }
                        }}
                        disabled={booking.status === 'cancelled'}
                        className="flex-1 min-w-[120px] px-4 py-3 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel Booking
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const newPaymentStatus = booking.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                            await setDoc(doc(db, 'bookings', booking.id), { paymentStatus: newPaymentStatus }, { merge: true });
                          } catch (error) {
                            handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
                          }
                        }}
                        className={`flex-1 min-w-[120px] px-4 py-3 ${booking.paymentStatus === 'paid' ? 'bg-amber-600' : 'bg-luxury-dark'} text-white text-xs font-bold rounded-xl hover:opacity-90 transition-colors`}
                      >
                        Mark as {booking.paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
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
          <button onClick={onBookNow} className="luxury-button w-full sm:w-auto">Check Availability</button>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-16">
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
              <h3 className="text-lg font-serif mb-4">{item.title}</h3>
              
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


const Reviews = () => {
  return (
    <section id="reviews" className="py-24 px-6 bg-luxury-dark text-white">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-subtitle !text-luxury-gold">Guest Testimonials</span>
        <h2 className="section-title !text-white">What Our Guests Say</h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 relative"
        >
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="text-luxury-gold fill-luxury-gold" />
            ))}
          </div>
          
          <p className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
            "An absolutely stunning property! We hosted a family get-together here and everything was perfect. The pool is clean, the rooms are massive, and the staff is very helpful. Highly recommended for anyone looking for a private luxury stay in Noida."
          </p>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-luxury-gold">A</span>
            </div>
            <h4 className="text-lg font-medium">Anuj Mittal</h4>
            <span className="text-sm text-white/50">Verified Guest</span>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-serif font-bold text-luxury-gold">5.0</span>
              <div className="text-left">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-luxury-gold fill-luxury-gold" />)}
                </div>
                <span className="text-xs uppercase tracking-widest text-white/40">Average Rating</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
            <div className="text-white/60 text-sm">
              Based on 1 Verified Review
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BookingForm = ({ isModal = false, onClose, user }: { 
  isModal?: boolean, 
  onClose?: () => void,
  user: FirebaseUser | null
}) => {
  const [name, setName] = useState(user?.displayName || '');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [guests, setGuests] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const guestCount = guests;
    const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;
    const totalAmount = Math.max(1, nights) * 25000; // Base price per night

    try {
      if (user) {
        // Save to Firestore
        await addDoc(collection(db, 'bookings'), {
          uid: user.uid,
          checkIn,
          checkOut,
          guests: guestCount,
          status: 'pending',
          totalAmount,
          paymentStatus: 'unpaid',
          createdAt: new Date().toISOString(),
          name,
          mobile,
          email,
          occasion
        });
      }

      // Also send WhatsApp message for immediate attention
      const message = `*New Booking Request for Unique Farmhouse*%0A%0A` +
        `*Name:* ${name || 'Not specified'}%0A` +
        `*Mobile:* ${mobile || 'Not specified'}%0A` +
        `*Email:* ${email || 'Not specified'}%0A` +
        `*Guests:* ${guests}%0A` +
        `*Occasion:* ${occasion || 'Not specified'}%0A` +
        `*Check-In:* ${checkIn || 'Not specified'}%0A` +
        `*Check-Out:* ${checkOut || 'Not specified'}%0A` +
        `*Total Amount:* ₹${totalAmount.toLocaleString()}`;
      
      window.open(`https://wa.me/919313501001?text=${message}`, '_blank');
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'bookings');
      alert('Failed to save booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">Request Sent!</h3>
        <p className="text-luxury-dark/60 mb-8">We've received your booking request. You can track the status in "My Bookings".</p>
        <p className="text-xs text-luxury-dark/30 uppercase tracking-widest">Redirecting...</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleBookNow}>
      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Note:</strong> You are not signed in. Sign in to track your booking status and pay online.
          </p>
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
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Mobile No.</label>
          <div className="relative">
            <input 
              type="tel" 
              required
              placeholder="Phone Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Email Address</label>
          <div className="relative">
            <input 
              type="email" 
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">No. of Guests</label>
          <div className="relative">
            <input 
              type="number" 
              min="1"
              max="50"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm"
              placeholder="Number of guests"
            />
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
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
            <input 
              type="date" 
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Check-Out (At 11:00 AM)</label>
          <div className="relative">
            <input 
              type="date" 
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-luxury-dark text-white py-4 rounded-xl font-bold hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Calendar size={18} />
            Request Booking
          </>
        )}
      </button>
      
      <p className="text-[10px] text-center text-luxury-dark/30 uppercase tracking-widest mt-4">
        By clicking, you agree to our terms and conditions.
      </p>
    </form>
  );
};

const BookingModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: FirebaseUser | null }) => {
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
              <BookingForm isModal onClose={onClose} user={user} />
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: role
          }, { merge: true });
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
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
      
      <BookingModal isOpen={isBookingModalOpen} onClose={closeBookingModal} user={user} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <GalleryModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <AnimatePresence>
        {isDashboardOpen && user && (
          <MyBookings user={user} userRole={userRole} onClose={() => setIsDashboardOpen(false)} />
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


      {/* Desktop Floating Book Now Button */}
      <motion.button
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openBookingModal}
        className="fixed bottom-8 right-8 z-40 hidden md:flex bg-luxury-gold text-luxury-dark px-8 py-4 rounded-full items-center gap-3 shadow-2xl font-bold group"
      >
        <Calendar size={20} />
        <span>Book Your Stay</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  );
}
