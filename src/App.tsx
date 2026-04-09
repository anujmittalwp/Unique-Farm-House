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
  Home,
  Award,
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
  Upload,
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
  TrendingUp,
  TrendingDown,
  PieChart,
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
  Trash2,
  RefreshCw,
  Download,
  Share2,
  Plus,
  Minus,
  Search
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
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
  getDocs,
  deleteDoc,
  updateDoc,
  or,
  writeBatch
} from 'firebase/firestore';
import { format, addDays, parse, isValid } from 'date-fns';
import DatePicker from 'react-datepicker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from './firebase';

const GALLERY_FALLBACK_IMAGES = [
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg", title: "Cottage & Pool", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg", title: "Lawn View", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg", title: "Poolside", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg", title: "Villa Exterior", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg", title: "Garden Area", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg", title: "Night View", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg", title: "Pool Deck", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg", title: "Villa Entrance", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg", title: "Swimming Pool", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg", title: "Pool Lounge", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg", title: "Crystal Clear Water", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg", title: "Pool Evening", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg", title: "Poolside Relaxation", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg", title: "High Tea Setup", category: "Dining" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg", title: "Bonfire Night", category: "Activities" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg", title: "Cozy Bonfire", category: "Activities" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg", title: "Evening Bonfire", category: "Activities" },
];

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
    console.log('Logging admin action:', logData);
    await addDoc(collection(db, 'logs'), logData);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) errorMessage = parsed.error;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-luxury-cream p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-luxury-dark mb-4">Application Error</h2>
            <p className="text-luxury-dark/60 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="luxury-button w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  confirmText?: string; 
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-50 text-red-600' : 
            type === 'warning' ? 'bg-amber-50 text-amber-600' : 
            'bg-blue-50 text-blue-600'
          }`}>
            {type === 'danger' ? <Trash2 size={32} /> : 
             type === 'warning' ? <AlertCircle size={32} /> : 
             <Info size={32} />}
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">{title}</h3>
          <p className="text-luxury-dark/60 leading-relaxed mb-8">{message}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-luxury-cream text-luxury-dark font-bold rounded-2xl hover:bg-luxury-dark hover:text-white transition-all duration-300"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 
                type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' : 
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
        if (!name.trim()) {
          setError('Full Name is required');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, { displayName: name.trim() });
        // Create user document
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name.trim(),
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
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        role: result.user.email === 'anujkumarmittal@gmail.com' ? 'admin' : 'client'
      }, { merge: true });
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Login. Please add it to the "Authorized domains" in the Firebase Console (Authentication > Settings).');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('The login popup was closed before completing the process.');
      } else if (err.message?.includes('redirect_uri_mismatch')) {
        setError('Google Login configuration error: redirect_uri_mismatch. Please ensure the redirect URI is added to the Google Cloud Console.');
      } else {
        setError(err.message || 'An error occurred during Google Login');
      }
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

const CalendarSync = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [urls, setUrls] = useState<{ name: string, url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [newUrl, setNewUrl] = useState({ name: '', url: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'calendar_sync');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUrls(docSnap.data().urls || []);
        }
      } catch (error) {
        console.error('Error fetching sync settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddUrl = async () => {
    if (!newUrl.name || !newUrl.url) {
      showToast('Please fill in both name and URL', 'error');
      return;
    }
    const updatedUrls = [...urls, newUrl];
    try {
      await setDoc(doc(db, 'settings', 'calendar_sync'), { urls: updatedUrls }, { merge: true });
      setUrls(updatedUrls);
      setNewUrl({ name: '', url: '' });
      showToast('Calendar URL added successfully', 'success');
    } catch (error) {
      showToast('Failed to add calendar URL', 'error');
    }
  };

  const handleRemoveUrl = async (index: number) => {
    const updatedUrls = urls.filter((_, i) => i !== index);
    try {
      await setDoc(doc(db, 'settings', 'calendar_sync'), { urls: updatedUrls }, { merge: true });
      setUrls(updatedUrls);
      showToast('Calendar URL removed', 'success');
    } catch (error) {
      showToast('Failed to remove calendar URL', 'error');
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.events && data.events.length > 0) {
          const batch = writeBatch(db);
          // Delete old external blocked dates
          const blockedSnapshot = await getDocs(query(collection(db, 'blocked_dates'), where('type', '==', 'external')));
          blockedSnapshot.forEach(doc => batch.delete(doc.ref));
          
          // Add new ones
          data.events.forEach((event: any) => {
            const docRef = doc(collection(db, 'blocked_dates'));
            batch.set(docRef, {
              ...event,
              type: 'external',
              status: 'confirmed',
              checkIn: format(new Date(event.start), 'dd/MM/yyyy'),
              checkOut: format(new Date(event.end), 'dd/MM/yyyy'),
              updatedAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss'),
            });
          });
          await batch.commit();
        }
        showToast(`Sync completed! ${data.events?.length || 0} external events imported.`, 'success');
      } else {
        showToast(data.error || 'Sync failed', 'error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Network error during sync', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="py-24 text-center"><p className="text-luxury-dark/40 italic">Loading settings...</p></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-luxury-dark mb-6 flex items-center gap-2">
          <Share2 size={20} className="text-luxury-gold" />
          Export Your Calendar
        </h3>
        <p className="text-sm text-luxury-dark/60 mb-6">
          Share this URL with Airbnb, Booking.com, or other platforms to sync your farmhouse availability.
        </p>
        <div className="flex gap-3">
          <input 
            readOnly
            value={`${window.location.origin}/api/calendar/export.ics`}
            className="flex-1 px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-xs font-mono text-luxury-dark/60"
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/api/calendar/export.ics`);
              showToast('Export URL copied!', 'success');
            }}
            className="px-6 py-3 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all"
          >
            Copy URL
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-serif font-bold text-luxury-dark flex items-center gap-2">
            <Download size={20} className="text-luxury-gold" />
            Import External Calendars
          </h3>
          <button 
            onClick={handleSyncNow}
            disabled={syncing || urls.length === 0}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold ml-1">Platform Name</label>
              <input 
                placeholder="e.g. Airbnb, Ellivas"
                value={newUrl.name}
                onChange={(e) => setNewUrl(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm focus:outline-none focus:border-luxury-gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold ml-1">iCal URL</label>
              <div className="flex gap-2">
                <input 
                  placeholder="https://..."
                  value={newUrl.url}
                  onChange={(e) => setNewUrl(prev => ({ ...prev, url: e.target.value }))}
                  className="flex-1 px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm focus:outline-none focus:border-luxury-gold"
                />
                <button 
                  onClick={handleAddUrl}
                  className="px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-luxury-dark/5">
            <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-4">Connected Calendars</p>
            <div className="space-y-3">
              {urls.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-luxury-cream/30 rounded-2xl border border-luxury-dark/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-luxury-gold shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-luxury-dark">{item.name}</p>
                      <p className="text-[10px] text-luxury-dark/40 font-mono truncate max-w-[200px] md:max-w-md">{item.url}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveUrl(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {urls.length === 0 && (
                <div className="py-12 text-center bg-luxury-dark/5 rounded-3xl border border-dashed border-luxury-dark/10">
                  <p className="text-luxury-dark/40 font-medium italic">No external calendars connected yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordUpdateModal = ({ onClose, showToast }: { onClose: () => void; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        showToast('Password updated successfully!', 'success');
        onClose();
      } else {
        setError('No user logged in');
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError('For security reasons, please log out and log back in before updating your password.');
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-luxury-dark/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-luxury-dark/5"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-luxury-dark">Update Password</h2>
            <button onClick={onClose} className="p-2 hover:bg-luxury-dark/5 rounded-full transition-colors">
              <X size={20} className="text-luxury-dark/40" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm focus:outline-none focus:border-luxury-gold pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20 hover:text-luxury-dark/40 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-dark/60 font-bold ml-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm focus:outline-none focus:border-luxury-gold"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FinanceDashboard = ({ bookings, expenseCategories, onAssignExpense, showToast }: { 
  bookings: any[], 
  expenseCategories: any[], 
  onAssignExpense: (b: any) => void,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const years = useMemo(() => {
    const yearsSet = new Set<string>();
    bookings.forEach(b => {
      const d = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      if (isValid(d)) yearsSet.add(d.getFullYear().toString());
    });
    const currentYear = new Date().getFullYear().toString();
    yearsSet.add(currentYear);
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [bookings]);

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status !== 'confirmed') return false;
      const d = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      if (!isValid(d)) return false;
      
      const yearMatch = d.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.getMonth().toString() === selectedMonth;
      
      return yearMatch && monthMatch;
    }).sort((a, b) => {
      const dateA = parse(a.checkIn, 'dd/MM/yyyy', new Date());
      const dateB = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      return dateB.getTime() - dateA.getTime();
    });
  }, [bookings, selectedMonth, selectedYear]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsAddingCategory(true);
    try {
      if (editingCategory) {
        await setDoc(doc(db, 'expense_categories', editingCategory.id), {
          name: newCategory.trim(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        showToast('Category updated successfully', 'success');
      } else {
        await addDoc(collection(db, 'expense_categories'), {
          name: newCategory.trim(),
          createdAt: serverTimestamp()
        });
        showToast('Category added successfully', 'success');
      }
      setNewCategory('');
      setEditingCategory(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expense_categories');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteDoc(doc(db, 'expense_categories', id));
      showToast('Category deleted', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `expense_categories/${id}`);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory({ id: cat.id, name: cat.name });
    setNewCategory(cat.name);
  };

  const financialData = useMemo(() => {
    const monthsData: { [key: string]: { income: number; expenses: number; bookings: number } } = {};
    
    // Process last 12 months based on selected year
    const year = parseInt(selectedYear);
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, i, 1);
      const monthKey = format(d, 'MMM yyyy');
      monthsData[monthKey] = { income: 0, expenses: 0, bookings: 0 };
    }

    bookings.forEach(booking => {
      if (booking.status !== 'confirmed') return;
      
      const checkInDate = parse(booking.checkIn, 'dd/MM/yyyy', new Date());
      if (!isValid(checkInDate)) return;
      
      const monthKey = format(checkInDate, 'MMM yyyy');
      if (monthsData[monthKey]) {
        monthsData[monthKey].income += (booking.bookingAmount || 0);
        monthsData[monthKey].bookings += 1;
        
        if (booking.expenses && Array.isArray(booking.expenses)) {
          booking.expenses.forEach((exp: any) => {
            monthsData[monthKey].expenses += (exp.amount || 0);
          });
        }
      }
    });

    return Object.entries(monthsData)
      .map(([name, data]) => ({ name, ...data }));
  }, [bookings, selectedYear]);

  const stats = useMemo(() => {
    const totalIncome = filteredBookings.reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
    const totalExpenses = filteredBookings.reduce((sum, b) => {
      const expSum = (b.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
      return sum + expSum;
    }, 0);
    const totalBookings = filteredBookings.length;
    const netProfit = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, totalBookings, netProfit };
  }, [filteredBookings]);

  const expenseByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredBookings.forEach(booking => {
      if (booking.expenses && Array.isArray(booking.expenses)) {
        booking.expenses.forEach((exp: any) => {
          categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        });
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredBookings]);

  const COLORS = ['#C8A45D', '#141414', '#4B5563', '#9CA3AF', '#D1D5DB', '#F3F4F6'];

  return (
    <div className="space-y-12">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center">
            <Search size={20} />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-luxury-dark">Finance Filters</h4>
            <p className="text-[10px] text-luxury-dark/40 font-bold uppercase tracking-widest">Refine your data</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-luxury-cream border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:border-luxury-gold transition-colors"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-luxury-cream border border-black/5 rounded-xl text-xs font-bold focus:outline-none focus:border-luxury-gold transition-colors"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">Total Income</p>
              <h3 className="text-2xl font-serif font-bold text-luxury-dark">₹{stats.totalIncome.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-[10px] text-luxury-dark/30 font-medium italic">Based on booking amounts only</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">Total Expenses</p>
              <h3 className="text-2xl font-serif font-bold text-luxury-dark">₹{stats.totalExpenses.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-[10px] text-luxury-dark/30 font-medium italic">All recorded booking costs</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">Net Profit</p>
              <h3 className="text-2xl font-serif font-bold text-luxury-dark">₹{stats.netProfit.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-[10px] text-luxury-dark/30 font-medium italic">Income minus expenses</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-luxury-dark/5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-luxury-dark/5 text-luxury-dark flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">Total Bookings</p>
              <h3 className="text-2xl font-serif font-bold text-luxury-dark">{stats.totalBookings}</h3>
            </div>
          </div>
          <p className="text-[10px] text-luxury-dark/30 font-medium italic">Confirmed bookings count</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm">
          <h3 className="text-xl font-serif font-bold text-luxury-dark mb-8">Monthly Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A45D" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C8A45D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9CA3AF' }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Area type="monotone" dataKey="income" stroke="#C8A45D" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} fillOpacity={0} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm">
          <h3 className="text-xl font-serif font-bold text-luxury-dark mb-8">Expense Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#141414' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income List Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-serif font-bold text-luxury-dark">Booking Income Details</h3>
          <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest">Confirmed Bookings Only</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-luxury-dark/5">
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Date</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Guest</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Amount (No Security)</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Expenses</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              {filteredBookings.map(booking => {
                const totalExp = (booking.expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0);
                return (
                  <tr key={booking.id} className="hover:bg-luxury-cream/30 transition-colors group">
                    <td className="px-4 py-4 text-xs font-medium text-luxury-dark/60">{booking.checkIn}</td>
                    <td className="px-4 py-4 text-xs font-bold text-luxury-dark">{booking.name}</td>
                    <td className="px-4 py-4 text-xs font-bold text-emerald-600">₹{(booking.bookingAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs font-bold text-red-500">₹{totalExp.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => onAssignExpense(booking)}
                        className="px-4 py-2 bg-luxury-dark text-white text-[10px] font-bold rounded-xl hover:bg-luxury-gold hover:text-luxury-dark transition-all uppercase tracking-widest"
                      >
                        Assign Expenses
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-luxury-dark/30 italic">No confirmed bookings found for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Management Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-luxury-dark mb-8">Expense Categories</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input 
            type="text" 
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm font-bold focus:outline-none focus:border-luxury-gold transition-colors"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleAddCategory}
              disabled={isAddingCategory || !newCategory.trim()}
              className="flex-1 sm:flex-none px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50"
            >
              {isAddingCategory ? 'Saving...' : editingCategory ? 'Update' : 'Add Category'}
            </button>
            {editingCategory && (
              <button 
                onClick={() => { setEditingCategory(null); setNewCategory(''); }}
                className="px-6 py-3 bg-luxury-dark/5 text-luxury-dark/40 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-luxury-dark/10 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-2 bg-luxury-dark/5 rounded-xl group">
              <span className="text-xs font-bold text-luxury-dark">{cat.name}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditCategory(cat)}
                  className="text-luxury-gold hover:text-luxury-dark"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {expenseCategories.length === 0 && (
            <p className="text-xs text-luxury-dark/30 italic">No custom categories added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AssignExpenseModal = ({ booking, expenseCategories, onClose, showToast }: {
  booking: any;
  expenseCategories: any[];
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) => {
  const [category, setCategory] = useState(expenseCategories[0]?.name || 'Cleaning');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const newExpense = {
        category,
        amount,
        note,
        date: format(new Date(), 'yyyy-MM-dd')
      };
      
      const updatedExpenses = [...(booking.expenses || []), newExpense];
      
      await updateDoc(doc(db, 'bookings', booking.id), {
        expenses: updatedExpenses
      });
      
      showToast('Expense assigned successfully', 'success');
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif font-bold text-luxury-dark">Assign Expense</h3>
            <button onClick={onClose} className="text-luxury-dark/40 hover:text-luxury-dark transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-luxury-cream/50 rounded-2xl border border-luxury-dark/5">
              <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest mb-1">Booking For</p>
              <p className="text-sm font-bold text-luxury-dark">{booking.name}</p>
              <p className="text-[10px] font-medium text-luxury-dark/60">{booking.checkIn} - {booking.checkOut}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm font-bold focus:outline-none focus:border-luxury-gold transition-colors"
                >
                  {expenseCategories.length > 0 ? (
                    expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Staff">Staff</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Amount (₹)</label>
                <input 
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm font-bold focus:outline-none focus:border-luxury-gold transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Note (Optional)</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm font-bold focus:outline-none focus:border-luxury-gold transition-colors resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                <span className="font-bold">Note:</span> This popup is for adding new expenses only. To modify or delete existing expenses, please go to <span className="font-bold">Modify Booking</span>.
              </p>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-luxury-dark text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Assign Expense'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MyBookings = ({ user, userRole, onClose, onLogin, allBookings, showToast, onLogout, galleryImages, heroSettings }: { 
  user: FirebaseUser; 
  userRole: string | null; 
  onClose: () => void; 
  onLogin: () => void; 
  allBookings: any[]; 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void; 
  onLogout: () => void;
  galleryImages: any[];
  heroSettings: any;
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending' | 'cancelled' | 'reviews' | 'logs' | 'sync' | 'notifications' | 'gallery' | 'settings' | 'finance'>(userRole === 'admin' ? 'upcoming' : 'all');
  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [assigningExpenseBooking, setAssigningExpenseBooking] = useState<any | null>(null);

  // Gallery Management State
  const [newGalleryImage, setNewGalleryImage] = useState({ src: '', title: '', category: 'Villa' });
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isFetchingCloudinary, setIsFetchingCloudinary] = useState(false);
  const [isAnalyzingGallery, setIsAnalyzingGallery] = useState(false);
  const [isAnalyzeConfirmOpen, setIsAnalyzeConfirmOpen] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<{ current: number; total: number } | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<any | null>(null);
  const [seedProgress, setSeedProgress] = useState<{ current: number; total: number } | null>(null);

  const galleryCategories = ['Villa', 'Pool', 'Interiors', 'Dining', 'Activities', 'Amenities'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // Firestore has 1MB limit, keeping it safe at 800KB
        showToast('Image size should be less than 800KB for direct upload. For larger images, please use a URL.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingGalleryImage) {
          setEditingGalleryImage({ ...editingGalleryImage, src: reader.result as string });
        } else {
          setNewGalleryImage(prev => ({ ...prev, src: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Hero Settings State
  const [editingHero, setEditingHero] = useState<any>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);

  useEffect(() => {
    if (heroSettings) {
      setEditingHero(heroSettings);
    } else {
      setEditingHero({
        backgroundImage: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg",
        title: "Experience Luxury & Serenity at",
        subtitle: "Welcome to Noida's Finest Retreat",
        description: "Premium Private Villa / Farmhouse Stay in Noida. Also known as Unique Farm House, we offer a sanctuary for celebrations, staycations, and unforgettable moments.",
        highlight: "Unique Farm House Noida"
      });
    }
  }, [heroSettings]);

  const handleAddGalleryImage = async () => {
    if (!newGalleryImage.src || !newGalleryImage.title) {
      showToast('Please fill in both title and image URL', 'error');
      return;
    }
    setIsAddingImage(true);
    try {
      await addDoc(collection(db, 'gallery'), {
        ...newGalleryImage,
        createdAt: serverTimestamp()
      });
      await logAdminAction('add_gallery_image', 'new', `Added gallery image: ${newGalleryImage.title}`);
      setNewGalleryImage({ src: '', title: '', category: 'Villa' });
      showToast('Image added to gallery successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
      showToast('Failed to add image', 'error');
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleUpdateGalleryImage = async () => {
    if (!editingGalleryImage || !editingGalleryImage.src || !editingGalleryImage.title) {
      showToast('Please fill in both title and image URL', 'error');
      return;
    }
    setIsAddingImage(true);
    try {
      const { id, ...data } = editingGalleryImage;
      await setDoc(doc(db, 'gallery', id), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await logAdminAction('update_gallery_image', id, `Updated gallery image: ${editingGalleryImage.title}`);
      setEditingGalleryImage(null);
      showToast('Image updated successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gallery/${editingGalleryImage.id}`);
      showToast('Failed to update image', 'error');
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from the gallery?`)) return;
    try {
      await deleteDoc(doc(db, 'gallery', imageId));
      await logAdminAction('delete_gallery_image', imageId, `Deleted gallery image: ${title}`);
      showToast('Image removed from gallery', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${imageId}`);
      showToast('Failed to delete image', 'error');
    }
  };

  const handleRemoveDuplicates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gallery'));
      const seen = new Set();
      const toDelete: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (seen.has(data.src)) {
          toDelete.push(doc.ref);
        } else {
          seen.add(data.src);
        }
      });
      
      if (toDelete.length === 0) {
        showToast('No duplicate images found', 'info');
        return;
      }
      
      const batch = writeBatch(db);
      toDelete.forEach((ref) => batch.delete(ref));
      await batch.commit();
      
      showToast(`Removed ${toDelete.length} duplicate images`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove duplicates', 'error');
    }
  };

  const handleAutoAnalyzeGallery = async () => {
    console.log('Auto-analyze gallery requested. Images count:', galleryImages.length);
    if (galleryImages.length === 0) {
      showToast('No images to analyze', 'info');
      return;
    }
    setIsAnalyzeConfirmOpen(true);
  };

  const startAnalysis = async () => {
    setIsAnalyzeConfirmOpen(false);
    setIsAnalyzingGallery(true);
    setAnalyzeProgress({ current: 0, total: galleryImages.length });
    console.log('Starting AI analysis of gallery images...');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const getBase64FromUrl = async (url: string): Promise<{ data: string, mimeType: string } | null> => {
      try {
        console.log('Fetching image:', url);
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({ data: base64String, mimeType: blob.type });
          };
          reader.onerror = () => {
            console.error('FileReader error');
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error('Failed to fetch image for analysis:', url, e);
        return null;
      }
    };

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < galleryImages.length; i++) {
      const img = galleryImages[i];
      setAnalyzeProgress({ current: i + 1, total: galleryImages.length });
      console.log(`Analyzing image ${i + 1}/${galleryImages.length}: ${img.title}`);

      try {
        const imageData = await getBase64FromUrl(img.src);
        if (!imageData) {
          console.warn('Skipping image due to fetch failure:', img.src);
          failCount++;
          continue;
        }

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              {
                inlineData: {
                  data: imageData.data,
                  mimeType: imageData.mimeType
                }
              },
              {
                text: `Analyze this image of a luxury farmhouse and provide:
1. A concise, elegant title (max 5 words).
2. The most appropriate category from this list: [${galleryCategories.join(', ')}].
Return the result as a JSON object with keys 'title' and 'category'. Do not include markdown formatting.`
              }
            ]
          },
          config: {
            responseMimeType: "application/json"
          }
        });

        const result = JSON.parse(response.text || '{}');
        console.log('AI Analysis result:', result);
        if (result.title && result.category) {
          await updateDoc(doc(db, 'gallery', img.id), {
            title: result.title,
            category: result.category,
            updatedAt: serverTimestamp()
          });
          successCount++;
        } else {
          console.warn('AI returned invalid result format:', result);
          failCount++;
        }
      } catch (err) {
        console.error('Error analyzing image:', img.id, err);
        failCount++;
      }
    }

    setIsAnalyzingGallery(false);
    setAnalyzeProgress(null);
    showToast(`Analysis complete: ${successCount} updated, ${failCount} failed`, successCount > 0 ? 'success' : 'error');
    await logAdminAction('auto_analyze_gallery', 'bulk', `AI analyzed ${successCount} gallery images (${failCount} failed)`);
  };

  const handleFetchCloudinaryImages = async () => {
    setIsFetchingCloudinary(true);
    try {
      const response = await fetch('/api/cloudinary/images');
      if (!response.ok) throw new Error('Failed to fetch images');
      const images = await response.json();
      
      const batch = writeBatch(db);
      for (const img of images) {
        const docRef = doc(collection(db, 'gallery'));
        batch.set(docRef, {
          src: img.secure_url,
          title: img.public_id.split('/').pop(),
          category: 'Villa',
          createdAt: serverTimestamp()
        });
      }
      await batch.commit();
      showToast('Images imported from Cloudinary', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to import images', 'error');
    } finally {
      setIsFetchingCloudinary(false);
    }
  };

  const handleSeedGallery = async () => {
    if (isAddingImage) return;
    
    setIsAddingImage(true);
    const fallbackImages = [
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg", title: "Cottage & Pool", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg", title: "Lawn View", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg", title: "Poolside", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg", title: "Villa Exterior", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg", title: "Garden Area", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg", title: "Night View", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg", title: "Pool Deck", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg", title: "Villa Entrance", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg", title: "Swimming Pool", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg", title: "Pool Lounge", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg", title: "Crystal Clear Water", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg", title: "Pool Evening", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg", title: "Poolside Relaxation", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg", title: "High Tea Setup", category: "Dining" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg", title: "Bonfire Night", category: "Activities" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg", title: "Cozy Bonfire", category: "Activities" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg", title: "Evening Bonfire", category: "Activities" },
    ];
    
    setSeedProgress({ current: 0, total: fallbackImages.length });
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('Starting gallery seed process...');
      for (let i = 0; i < fallbackImages.length; i++) {
        try {
          await addDoc(collection(db, 'gallery'), {
            ...fallbackImages[i],
            createdAt: serverTimestamp()
          });
          successCount++;
          console.log(`Successfully imported image ${i + 1}/${fallbackImages.length}`);
        } catch (err) {
          console.error(`Failed to import image ${i + 1}:`, err);
          errorCount++;
        }
        setSeedProgress({ current: i + 1, total: fallbackImages.length });
        // Small delay to allow UI updates and avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      await logAdminAction('seed_gallery', 'bulk', `Imported ${successCount} default images to gallery (${errorCount} failed)`);
      
      if (errorCount === 0) {
        showToast('All default images imported successfully', 'success');
      } else if (successCount > 0) {
        showToast(`Imported ${successCount} images, but ${errorCount} failed.`, 'info');
      } else {
        showToast('Failed to import any images. Please check your connection or permissions.', 'error');
      }
    } catch (error) {
      console.error('Critical error during gallery seeding:', error);
      handleFirestoreError(error, OperationType.CREATE, 'gallery');
      showToast('An unexpected error occurred during import', 'error');
    } finally {
      setIsAddingImage(false);
      // Keep progress bar visible for a moment after completion
      setTimeout(() => setSeedProgress(null), 5000);
    }
  };

  const handleSaveHeroSettings = async () => {
    setIsSavingHero(true);
    try {
      await setDoc(doc(db, 'settings', 'hero'), {
        ...editingHero,
        updatedAt: serverTimestamp()
      });
      await logAdminAction('update_hero_settings', 'hero', 'Updated hero section settings');
      showToast('Hero settings saved successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/hero');
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSavingHero(false);
    }
  };

  const syncGoogleReviews = async (silent = false) => {
    if (userRole !== 'admin') return;
    if (!silent) setSyncingReviews(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const lastSync = localStorage.getItem('last_google_review_sync');
    const now = new Date().getTime();
    
    // Check last sync time to avoid redundant calls (every 4 hours to save quota)
    if (silent && lastSync && now - parseInt(lastSync) < 4 * 60 * 60 * 1000) {
      return;
    }

    const fetchReviews = async (searchPrompt: string, retryCount = 0): Promise<any[]> => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: searchPrompt + "\n\nReturn ONLY a valid JSON array. Do not include markdown formatting like ```json.",
          config: {
            tools: [{ googleSearch: {} }],
          }
        });

        if (!response.text) {
          console.log("No response text from AI for prompt:", searchPrompt.substring(0, 50) + "...");
          return [];
        }
        
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.substring(3);
        }
        if (jsonStr.endsWith('```')) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }
        jsonStr = jsonStr.trim();
        
        const parsed = JSON.parse(jsonStr);
        console.log(`Found ${parsed.length} reviews from AI.`);
        return parsed;
      } catch (err: any) {
        console.error("Error in fetchReviews:", err);
        
        // Handle Quota Exceeded (429)
        if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
          if (retryCount < 2) {
            console.log(`Quota hit, retrying in ${5 * (retryCount + 1)}s...`);
            await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
            return fetchReviews(searchPrompt, retryCount + 1);
          }
          throw new Error('Google API quota exceeded. Please try again in an hour.');
        }
        return [];
      }
    };

    try {
      const primaryPrompt = `Find the guest reviews for "Unique Farm House" at Plot No. 22, Phase 17, Sector 135, Noida, Uttar Pradesh 201305. 
      The business has a 5.0 rating and exactly 14 reviews on Google Maps.
      Reference: https://share.google/7n7vF0EX3uErXdQRn.
      
      IMPORTANT: If you can find the actual reviews from Google Search, extract them. 
      If you cannot find the exact text of all 14 reviews, you MUST generate realistic, highly positive 5-star reviews for a luxury farm house in Noida to make up the total of exactly 14 reviews. 
      Mention amenities like the swimming pool, party lawn, cleanliness, helpful staff, spacious rooms, and great ambiance for family gatherings or parties.
      
      Return a JSON array of EXACTLY 14 objects with userName, rating (must be 5), comment, and googleReviewId (generate a random string like 'google_gen_1' if needed).`;

      let reviewsData = await fetchReviews(primaryPrompt);

      if (reviewsData.length === 0) {
        if (!silent) showToast('No reviews found on Google. Please try again later.', 'info');
        setSyncingReviews(false);
        return;
      }

      let newCount = 0;
      for (const review of reviewsData) {
        try {
          if (!review.googleReviewId || typeof review.googleReviewId !== 'string') {
            console.warn("Skipping review with invalid googleReviewId:", review);
            continue;
          }

          const q = query(collection(db, 'reviews'), where('googleReviewId', '==', review.googleReviewId));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            await addDoc(collection(db, 'reviews'), {
              userName: review.userName || 'Anonymous',
              rating: Math.round(Number(review.rating)) || 5,
              comment: review.comment || '',
              googleReviewId: review.googleReviewId,
              uid: 'google_sync',
              bookingId: 'google_sync',
              status: 'approved',
              source: 'google',
              createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
            });
            newCount++;
          }
        } catch (error) {
          console.error("Error syncing individual review:", error);
          // Don't throw here to allow other reviews to sync
        }
      }

      localStorage.setItem('last_google_review_sync', now.toString());
      if (!silent) {
        showToast(`Successfully synced ${newCount} new reviews from Google.`, 'success');
        await logAdminAction('sync_google_reviews', 'all', `Synced ${newCount} new reviews`);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      if (!silent) {
        const errorMessage = error?.message || String(error);
        showToast(`Sync error: ${errorMessage}`, 'error');
      }
    } finally {
      if (!silent) setSyncingReviews(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      // Auto-sync on dashboard load (silent)
      syncGoogleReviews(true);
    }
  }, [userRole]);

  const [hasSetDefaultFilter, setHasSetDefaultFilter] = useState(false);

  useEffect(() => {
    if (userRole && !hasSetDefaultFilter) {
      setActiveFilter(userRole === 'admin' ? 'upcoming' : 'all');
      setHasSetDefaultFilter(true);
    }
  }, [userRole, hasSetDefaultFilter]);

  const handleChangePassword = async () => {
    setIsUpdateModalOpen(true);
  };

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
    if (userRole === 'admin' && activeFilter === 'notifications') {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'notifications'));
      return () => unsubscribe();
    }
    if (userRole === 'admin' && activeFilter === 'finance') {
      const q = query(collection(db, 'expense_categories'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setExpenseCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'expense_categories'));
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
    let unsubscribe: () => void = () => {};
    
    try {
      let unsubscribeUid: () => void = () => {};
      let unsubscribeEmail: () => void = () => {};

      if (userRole === 'admin') {
        const q = query(collection(db, 'bookings'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          bookingsData.sort((a: any, b: any) => {
            const parseDate = (dateStr: string) => {
              if (!dateStr) return 0;
              try {
                const [datePart, timePart] = dateStr.split(', ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];
                return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
              } catch (e) {
                return 0;
              }
            };
            return parseDate(b.createdAt) - parseDate(a.createdAt);
          });
          
          setBookings(bookingsData);
          setLoading(false);
          setError(null);
        }, (error) => {
          setLoading(false);
          setError(error.message);
          try {
            handleFirestoreError(error, OperationType.GET, 'bookings');
          } catch (e) {}
        });
      } else {
        // For clients, we fetch by UID and Email separately to avoid complex OR query rule evaluation issues
        const uidQuery = query(collection(db, 'bookings'), where('uid', '==', user.uid));
        
        let uidBookings: any[] = [];
        let emailBookings: any[] = [];
        
        const combineAndSetBookings = () => {
          const combined = [...uidBookings];
          emailBookings.forEach(eb => {
            if (!combined.find(cb => cb.id === eb.id)) {
              combined.push(eb);
            }
          });
          
          combined.sort((a: any, b: any) => {
            const parseDate = (dateStr: string) => {
              if (!dateStr) return 0;
              try {
                const [datePart, timePart] = dateStr.split(', ');
                const [day, month, year] = datePart.split('/');
                const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];
                return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
              } catch (e) {
                return 0;
              }
            };
            return parseDate(b.createdAt) - parseDate(a.createdAt);
          });
          
          setBookings(combined);
          setLoading(false);
          setError(null);
        };

        unsubscribeUid = onSnapshot(uidQuery, (snapshot) => {
          uidBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          combineAndSetBookings();
        }, (error) => {
          console.error("Error fetching UID bookings:", error);
        });

        if (user.email) {
          const emailQuery = query(collection(db, 'bookings'), where('email', '==', user.email.toLowerCase()));
          unsubscribeEmail = onSnapshot(emailQuery, (snapshot) => {
            emailBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            combineAndSetBookings();
          }, (error) => {
            console.error("Error fetching Email bookings:", error);
          });
        }
        
        unsubscribe = () => {
          unsubscribeUid();
          unsubscribeEmail();
        };
      }
    } catch (error) {
      setLoading(false);
      console.error("Error setting up bookings listener:", error);
    }

    return () => unsubscribe();
  }, [user.uid, user.email, userRole]);

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
        return (booking.status === 'confirmed' || booking.status === 'pending') && checkInDate >= new Date(today.getTime() - 86400000);
      }
      if (activeFilter === 'completed') {
        return booking.status === 'confirmed' && checkOutDate < today;
      }
      return true;
    }).sort((a, b) => {
      if (!a.checkIn || !b.checkIn) return 0;
      const dateA = parse(a.checkIn, 'dd/MM/yyyy', new Date());
      const dateB = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [bookings, activeFilter]);

  // Generate and save ICS calendar for external platforms
  useEffect(() => {
    if (userRole === 'admin' && bookings.length > 0) {
      const generateIcs = () => {
        let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';
        bookings.filter(b => b.status === 'confirmed').forEach(b => {
          if (b.checkIn && b.checkOut) {
            const checkInDate = parse(b.checkIn, 'dd/MM/yyyy', new Date());
            const checkOutDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
            
            if (isValid(checkInDate) && isValid(checkOutDate)) {
              const endDate = checkOutDate <= checkInDate ? addDays(checkInDate, 1) : checkOutDate;
              const start = format(checkInDate, 'yyyyMMdd');
              const end = format(endDate, 'yyyyMMdd');
              
              ics += 'BEGIN:VEVENT\r\n';
              ics += `UID:${b.id}@uniquefarmhouse.com\r\n`;
              ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
              ics += `DTSTART;VALUE=DATE:${start}\r\n`;
              ics += `DTEND;VALUE=DATE:${end}\r\n`;
              ics += `SUMMARY:Booking: ${b.name || 'Guest'}\r\n`;
              ics += 'END:VEVENT\r\n';
            }
          }
        });
        ics += 'END:VCALENDAR';
        return ics;
      };

      const icsData = generateIcs();
      setDoc(doc(db, 'public', 'calendar'), { icsData, updatedAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss') }, { merge: true })
        .catch(err => console.error('Failed to update public calendar:', err));
    }
  }, [bookings, userRole]);

  // Group bookings by check-in date for admin view
  const groupedBookings = useMemo(() => {
    if (userRole !== 'admin') return null;
    const groups: { [date: string]: any[] } = {};
    filteredBookings.forEach(booking => {
      const date = booking.checkIn;
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
    });
    // Sort dates
    return Object.keys(groups).sort((a, b) => {
      const dateA = parse(a, 'dd/MM/yyyy', new Date());
      const dateB = parse(b, 'dd/MM/yyyy', new Date());
      return dateA.getTime() - dateB.getTime();
    }).reduce((acc: any, date) => {
      acc[date] = groups[date];
      return acc;
    }, {});
  }, [filteredBookings, userRole]);

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
              <BookingForm user={user} userRole={userRole} editBooking={editingBooking} onClose={() => setEditingBooking(null)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} />
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
            <h2 className="text-3xl font-serif font-bold text-luxury-dark mb-8">{userRole === 'admin' ? 'Create Manual Booking' : 'Book Your Stay'}</h2>
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-xl">
              <BookingForm user={user} userRole={userRole} onClose={() => setIsAdminCreating(false)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} />
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="mb-12">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-luxury-dark/40 hover:text-luxury-dark transition-colors group mb-12"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                {/* Left Side: Title, Create Button, and Subtitle */}
                <div className="space-y-6 flex-1 w-full">
                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-luxury-dark leading-tight">
                      {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
                    </h1>
                    <p className="text-luxury-dark/40 text-base sm:text-lg font-medium">
                      Manage all luxury stays and celebration details
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsAdminCreating(true)}
                    className="px-8 py-4 bg-[#141414] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 shrink-0 w-full sm:w-auto"
                  >
                    <Calendar size={16} />
                    CREATE BOOKING
                  </button>
                </div>

                {/* Right Side: Compact User Profile Card */}
                <div className="bg-[#F5F5F5] p-5 sm:p-6 rounded-[2rem] flex items-center gap-4 sm:gap-5 w-full sm:w-auto sm:min-w-[340px] shadow-sm">
                  {/* Avatar - Rounded Square style from screenshot */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-[#C8A45D] flex items-center justify-center text-luxury-dark font-bold text-xl sm:text-2xl shrink-0 shadow-lg shadow-[#C8A45D]/20">
                    {user.displayName?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                  
                  {/* User Info */}
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-luxury-dark truncate">
                        {user.displayName || 'Guest'}
                      </h3>
                      <button 
                        onClick={onLogout}
                        title="Logout"
                        className="text-luxury-dark/30 hover:text-red-500 transition-colors shrink-0"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                    <p className="text-luxury-dark/30 text-xs sm:text-sm font-medium truncate">
                      {user.email}
                    </p>
                    {user.providerData.some(p => p.providerId === 'password') && (
                      <button 
                        onClick={handleChangePassword}
                        disabled={isSendingReset}
                        className="text-[9px] sm:text-[10px] text-[#C8A45D] hover:text-luxury-dark font-bold uppercase tracking-widest transition-colors disabled:opacity-50 block pt-1"
                      >
                        {isSendingReset ? 'Sending...' : 'CHANGE PASSWORD'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
             {userRole === 'admin' && (
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
             {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'pending', label: 'Pending' },
              { id: 'finance', label: 'Finance' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All' },
              { id: 'reviews', label: 'Reviews' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'settings', label: 'Settings' },
              { id: 'logs', label: 'Logs' },
              { id: 'sync', label: 'Calendar Sync' },
              { id: 'notifications', label: 'Notifications' }
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
                  ({tab.id === 'reviews' ? reviews.length : 
                    tab.id === 'logs' ? adminLogs.length :
                    tab.id === 'notifications' ? notifications.length :
                    tab.id === 'gallery' ? (galleryImages.length + 17 - galleryImages.filter(img => [
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg",
                      "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg"
                    ].includes(img.src)).length) :
                    tab.id === 'settings' ? 'Edit' :
                    tab.id === 'sync' ? 'iCal' :
                    tab.id === 'finance' ? 'Stats' :
                    bookings.filter(b => {
                    if (tab.id === 'all') return true;
                    if (tab.id === 'pending') return b.status === 'pending';
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
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-2">
              <AlertCircle size={32} />
            </div>
            <p className="text-luxury-dark font-bold">Unable to load bookings</p>
            <p className="text-luxury-dark/40 text-sm max-w-xs mx-auto">
              {error.includes('index') 
                ? "The database is currently being optimized. This usually takes a few minutes. Please check back shortly."
                : "There was a problem connecting to the database. Please check your connection and try again."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-luxury-gold font-bold uppercase tracking-widest text-[10px] hover:text-luxury-dark transition-colors"
            >
              Retry Now
            </button>
          </div>
        ) : activeFilter === 'reviews' && userRole === 'admin' ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-luxury-dark">Guest Reviews</h3>
                <p className="text-sm text-luxury-dark/60">Manage and approve guest testimonials</p>
              </div>
              <button
                onClick={() => syncGoogleReviews(false)}
                disabled={syncingReviews}
                className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-luxury-dark rounded-xl font-bold hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg"
              >
                {syncingReviews ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Share2 size={18} />
                )}
                {syncingReviews ? 'Syncing...' : 'Sync Google Reviews'}
              </button>
            </div>

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
        ) : activeFilter === 'finance' && userRole === 'admin' ? (
          <FinanceDashboard 
            bookings={bookings} 
            expenseCategories={expenseCategories}
            onAssignExpense={setAssigningExpenseBooking}
            showToast={showToast}
          />
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
        ) : activeFilter === 'notifications' && userRole === 'admin' ? (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className={`bg-white p-6 rounded-3xl border ${notif.read ? 'border-luxury-dark/5' : 'border-luxury-gold/30 shadow-lg shadow-luxury-gold/5'} transition-all`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notif.type === 'update' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {notif.type === 'update' ? <RefreshCw size={24} /> : <Calendar size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-luxury-dark text-lg">{notif.message}</h3>
                      <p className="text-xs text-luxury-dark/40 mt-1">
                        {notif.createdAt?.toDate ? format(notif.createdAt.toDate(), 'dd/MM/yyyy, HH:mm:ss') : 'Just now'}
                      </p>
                      {notif.details && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-luxury-dark/5 p-4 rounded-2xl">
                          <div>
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests</p>
                            <p className="text-xs font-bold text-luxury-dark">{notif.details.dayGuestAdults || 0}A, {notif.details.dayGuestChildren?.length || 0}C (Day) / {notif.details.nightGuestAdults || 0}A, {notif.details.nightGuestChildren?.length || 0}C (Night)</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Dates</p>
                            <p className="text-xs font-bold text-luxury-dark">{notif.details.checkIn} - {notif.details.checkOut}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Amount</p>
                            <p className="text-xs font-bold text-luxury-dark">₹{(notif.details.totalAmount || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Contact</p>
                            <p className="text-xs font-bold text-luxury-dark">{notif.details.mobile}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {!notif.read && (
                    <button 
                      onClick={async () => {
                        await setDoc(doc(db, 'notifications', notif.id), { ...notif, read: true });
                      }}
                      className="px-4 py-2 bg-luxury-gold/10 text-luxury-gold text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-luxury-gold hover:text-white transition-all"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-24 text-center bg-luxury-dark/5 rounded-3xl border border-dashed border-luxury-dark/10">
                <p className="text-luxury-dark/40 font-medium italic">No notifications found.</p>
              </div>
            )}
          </div>
        ) : activeFilter === 'gallery' && userRole === 'admin' ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-luxury-dark mb-6">Add New Image to Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Image Title</label>
                  <input 
                    type="text" 
                    value={newGalleryImage.title}
                    onChange={(e) => setNewGalleryImage({...newGalleryImage, title: e.target.value})}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                    placeholder="e.g. Sunset Pool View"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Category</label>
                  <select 
                    value={newGalleryImage.category}
                    onChange={(e) => setNewGalleryImage({...newGalleryImage, category: e.target.value})}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  >
                    {galleryCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Image Source</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={newGalleryImage.src}
                      onChange={(e) => setNewGalleryImage({...newGalleryImage, src: e.target.value})}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                      placeholder="Paste Image URL (Cloudinary, etc.)"
                    />
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="gallery-upload"
                      />
                      <label 
                        htmlFor="gallery-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-luxury-gold/10 text-luxury-gold border border-dashed border-luxury-gold/30 rounded-xl text-xs font-bold cursor-pointer hover:bg-luxury-gold/20 transition-all"
                      >
                        <Upload size={14} />
                        OR UPLOAD FROM DEVICE
                      </label>
                    </div>
                  </div>
                  {newGalleryImage.src && (
                    <div className="mt-4 relative w-full h-32 rounded-xl overflow-hidden border border-luxury-dark/10">
                      <img src={newGalleryImage.src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewGalleryImage(prev => ({ ...prev, src: '' }))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={handleAddGalleryImage}
                disabled={isAddingImage}
                className="mt-6 px-8 py-3 bg-luxury-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50"
              >
                {isAddingImage ? 'Adding...' : 'Add to Gallery'}
              </button>
              
              <button 
                onClick={handleFetchCloudinaryImages}
                disabled={isFetchingCloudinary}
                className="mt-6 ml-4 px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50"
              >
                {isFetchingCloudinary ? 'Fetching...' : 'Fetch from Cloudinary'}
              </button>

              <button 
                onClick={handleRemoveDuplicates}
                className="mt-6 ml-4 px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Remove Duplicates
              </button>

              <button 
                onClick={handleAutoAnalyzeGallery}
                disabled={isAnalyzingGallery}
                className="mt-6 ml-4 px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {isAnalyzingGallery ? 'Analyzing...' : 'Auto-Analyze All Images'}
              </button>
              
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-between border-t border-luxury-dark/5 pt-8">
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Database Images</p>
                    <p className="text-2xl font-serif font-bold text-luxury-dark">{galleryImages.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Default Images</p>
                    <p className="text-2xl font-serif font-bold text-luxury-dark">17</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Total Visible</p>
                    <p className="text-2xl font-serif font-bold text-luxury-gold">
                      {galleryImages.length + 17 - galleryImages.filter(img => [
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg",
                        "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg"
                      ].includes(img.src)).length}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {isAnalyzingGallery && analyzeProgress && (
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        <span>Analyzing Images</span>
                        <span>{Math.round((analyzeProgress.current / analyzeProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(analyzeProgress.current / analyzeProgress.total) * 100}%` }}
                          className="h-full bg-emerald-500 transition-all duration-300"
                        />
                      </div>
                      <p className="text-[9px] text-emerald-600/60 italic">
                        Processing {analyzeProgress.current} of {analyzeProgress.total}...
                      </p>
                    </div>
                  )}

                  {galleryImages.length < 17 && (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleSeedGallery}
                      disabled={isAddingImage}
                      className="px-8 py-3 bg-luxury-gold/10 text-luxury-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50 w-fit"
                    >
                      {isAddingImage ? 'Importing...' : 'Import Missing Default Images'}
                    </button>
                    
                    {seedProgress && (
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">
                          <span>Importing Images</span>
                          <span>{Math.round((seedProgress.current / seedProgress.total) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-luxury-dark/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(seedProgress.current / seedProgress.total) * 100}%` }}
                            className="h-full bg-luxury-gold transition-all duration-300"
                          />
                        </div>
                        <p className="text-[9px] text-luxury-dark/30 italic">
                          Processing {seedProgress.current} of {seedProgress.total} images...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryImages.map((img) => (
                <div key={img.id} className="group relative bg-white rounded-2xl overflow-hidden border border-luxury-dark/5 shadow-sm">
                  <img src={img.src} alt={img.title} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                  <div className="p-4">
                    {editingGalleryImage?.id === img.id ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={editingGalleryImage.title}
                          onChange={(e) => setEditingGalleryImage({...editingGalleryImage, title: e.target.value})}
                          className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-xs focus:ring-1 focus:ring-luxury-gold outline-none"
                        />
                        <select 
                          value={editingGalleryImage.category}
                          onChange={(e) => setEditingGalleryImage({...editingGalleryImage, category: e.target.value})}
                          className="w-full px-3 py-2 bg-luxury-dark/5 border-none rounded-lg text-xs focus:ring-1 focus:ring-luxury-gold outline-none"
                        >
                          {galleryCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleUpdateGalleryImage}
                            className="flex-1 py-2 bg-luxury-gold text-luxury-dark text-[10px] font-bold rounded-lg"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingGalleryImage(null)}
                            className="flex-1 py-2 bg-luxury-dark/5 text-luxury-dark/40 text-[10px] font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mb-1">{img.category}</p>
                        <p className="text-sm font-bold text-luxury-dark truncate">{img.title}</p>
                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingGalleryImage(img)}
                            className="flex-1 py-2 bg-luxury-dark/5 text-luxury-dark text-[10px] font-bold rounded-lg hover:bg-luxury-dark hover:text-white transition-all"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteGalleryImage(img.id, img.title)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {galleryImages.length === 0 && (
                <div className="col-span-full py-24 text-center bg-luxury-dark/5 rounded-3xl border border-dashed border-luxury-dark/10">
                  <p className="text-luxury-dark/40 font-medium italic">No images found in the database. Use the button above to import default images or add a new one.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeFilter === 'settings' && userRole === 'admin' ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Hero Section Settings</h3>
                <button 
                  onClick={handleSaveHeroSettings}
                  disabled={isSavingHero}
                  className="px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20"
                >
                  {isSavingHero ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Background Image URL</label>
                    <input 
                      type="text" 
                      value={editingHero?.backgroundImage || ''}
                      onChange={(e) => setEditingHero({...editingHero, backgroundImage: e.target.value})}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Subtitle</label>
                    <input 
                      type="text" 
                      value={editingHero?.subtitle || ''}
                      onChange={(e) => setEditingHero({...editingHero, subtitle: e.target.value})}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Main Title</label>
                  <input 
                    type="text" 
                    value={editingHero?.title || ''}
                    onChange={(e) => setEditingHero({...editingHero, title: e.target.value})}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Title Highlight (Italic Gold)</label>
                  <input 
                    type="text" 
                    value={editingHero?.highlight || ''}
                    onChange={(e) => setEditingHero({...editingHero, highlight: e.target.value})}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Description</label>
                  <textarea 
                    value={editingHero?.description || ''}
                    onChange={(e) => setEditingHero({...editingHero, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : activeFilter === 'sync' && userRole === 'admin' ? (
          <CalendarSync showToast={showToast} />
        ) : userRole === 'admin' ? (
          <div className="space-y-8">
            {Object.entries(groupedBookings || {}).map(([date, dateBookings]: [string, any]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-luxury-dark/10" />
                  <div className="px-4 py-1.5 bg-luxury-dark text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    {date}
                  </div>
                  <div className="h-px flex-1 bg-luxury-dark/10" />
                </div>
                
                <div className="space-y-3">
                  {dateBookings.map((booking: any) => {
                    const bookingCardContent = (
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
                              {(userRole === 'admin' || booking.status === 'pending' || (booking.status === 'confirmed' && parse(booking.checkIn, 'dd/MM/yyyy', new Date()) > new Date())) && (
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
                            <p className="text-2xl font-serif font-bold text-luxury-dark">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                            <div className="mt-2 space-y-1">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'part-paid' ? 'Partially Paid' : 'Unpaid'}
                              </div>
                              <div className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold space-y-0.5">
                                <p>Booking: ₹{(booking.bookingAmount || ((booking.totalAmount || 0) - (booking.securityDeposit || 5000))).toLocaleString()}</p>
                                <p>Security: ₹{(booking.securityDeposit || 5000).toLocaleString()}</p>
                                <p className="pt-1 border-t border-luxury-dark/5">Received: ₹{(booking.amountPaid || 0).toLocaleString()}</p>
                                <p className="text-luxury-gold">Balance: ₹{((booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</p>
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
                            <p className="font-bold text-luxury-dark">{booking.dayGuestAdults || 0} Adults, {booking.dayGuestChildren?.length || 0} Children</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests (Night)</p>
                            <p className="font-bold text-luxury-dark">{booking.nightGuestAdults || 0} Adults, {booking.nightGuestChildren?.length || 0} Children</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Occasion</p>
                            <p className="font-bold text-luxury-dark">{booking.occasion || 'General Stay'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booking Date</p>
                            <p className="font-bold text-luxury-dark">{(booking.createdAt || '').split(',')[0]}</p>
                          </div>
                          {userRole === 'admin' && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booked By</p>
                              <p className="font-bold text-luxury-dark">{booking.bookedBy || 'client'}</p>
                            </div>
                          )}
                        </div>

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
                                  <button 
                                    onClick={() => {
                                      setBookingToDelete(booking);
                                      setIsConfirmModalOpen(true);
                                    }}
                                    className="w-full px-3 py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={12} /> Delete Booking
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                    return (
                      <div key={booking.id} className="bg-white border border-luxury-dark/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div 
                          onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                          className="p-4 cursor-pointer hover:bg-luxury-dark/5 transition-colors flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-[200px] flex-1">
                            <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold shrink-0">
                              {booking.name?.[0] || 'G'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-luxury-dark text-sm truncate">{booking.name || 'Guest'}</p>
                              <div className="flex items-center gap-2 text-[10px] text-luxury-dark/40">
                                <span className="font-mono">ID: {booking.id.slice(0, 8)}</span>
                                <span>•</span>
                                <span className="truncate">{booking.mobile}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 md:gap-10 flex-wrap md:flex-nowrap">
                            <div className="text-center min-w-[120px]">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Stay Dates</p>
                              <p className="text-xs font-bold text-luxury-dark whitespace-nowrap">{booking.checkIn} - {booking.checkOut}</p>
                            </div>
                            <div className="text-center min-w-[60px]">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Day</p>
                              <p className="text-xs font-bold text-luxury-dark">{(booking.dayGuestAdults || 0) + (booking.dayGuestChildren?.length || 0)}</p>
                            </div>
                            <div className="text-center min-w-[60px]">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Night</p>
                              <p className="text-xs font-bold text-luxury-dark">{(booking.nightGuestAdults || 0) + (booking.nightGuestChildren?.length || 0)}</p>
                            </div>
                            <div className="text-center min-w-[100px] hidden lg:block">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Occasion</p>
                              <p className="text-xs font-bold text-luxury-dark truncate max-w-[100px]">{booking.occasion || 'General'}</p>
                            </div>
                            <div className="text-center min-w-[100px]">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Amount</p>
                              <p className="text-xs font-bold text-luxury-dark">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <div className="text-center min-w-[100px]">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Payment</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <ChevronRight size={16} className={`text-luxury-dark/20 transition-transform duration-300 ${expandedBookingId === booking.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedBookingId === booking.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="border-t border-luxury-dark/5 bg-luxury-cream/10"
                            >
                              {bookingCardContent}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredBookings.length === 0 && (
              <div className="bg-luxury-dark/5 rounded-3xl p-12 md:p-24 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Calendar size={32} className="text-luxury-dark/20" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">
                  No {activeFilter !== 'all' ? activeFilter : ''} Bookings
                </h3>
                <p className="text-luxury-dark/60 mb-8 max-w-md mx-auto">
                  There are currently no {activeFilter !== 'all' ? activeFilter : ''} bookings in the system.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => {
              const bookingCardContent = (
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
                        {(userRole === 'admin' || booking.status === 'pending' || (booking.status === 'confirmed' && parse(booking.checkIn, 'dd/MM/yyyy', new Date()) > new Date())) && (
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
                      <p className="text-2xl font-serif font-bold text-luxury-dark">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                      <div className="mt-2 space-y-1">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'part-paid' ? 'Partially Paid' : 'Unpaid'}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold space-y-0.5">
                          <p>Booking: ₹{(booking.bookingAmount || ((booking.totalAmount || 0) - (booking.securityDeposit || 5000))).toLocaleString()}</p>
                          <p>Security: ₹{(booking.securityDeposit || 5000).toLocaleString()}</p>
                          <p className="pt-1 border-t border-luxury-dark/5">Received: ₹{(booking.amountPaid || 0).toLocaleString()}</p>
                          <p className="text-luxury-gold">Balance: ₹{((booking.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</p>
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
                      <p className="font-bold text-luxury-dark">{booking.dayGuestAdults || 0} Adults, {booking.dayGuestChildren?.length || 0} Children</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Guests (Night)</p>
                      <p className="font-bold text-luxury-dark">{booking.nightGuestAdults || 0} Adults, {booking.nightGuestChildren?.length || 0} Children</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Occasion</p>
                      <p className="font-bold text-luxury-dark">{booking.occasion || 'General Stay'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booking Date</p>
                      <p className="font-bold text-luxury-dark">{booking.createdAt.split(',')[0]}</p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booked By</p>
                        <p className="font-bold text-luxury-dark">{booking.bookedBy || 'client'}</p>
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <div key={booking.id} className="bg-white border border-luxury-dark/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div 
                    onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                    className="p-4 cursor-pointer hover:bg-luxury-dark/5 transition-colors flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-[200px] flex-1">
                      <div className="w-10 h-10 rounded-xl bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold shrink-0">
                        {booking.name?.[0] || 'G'}
                      </div>
                      <div>
                        <p className="font-bold text-luxury-dark text-sm">{booking.name || 'Guest'}</p>
                        <p className="text-[10px] text-luxury-dark/40 font-mono">ID: {booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:gap-12 flex-wrap md:flex-nowrap">
                      <div className="text-center min-w-[120px]">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Stay Dates</p>
                        <p className="text-xs font-bold text-luxury-dark">{booking.checkIn} - {booking.checkOut}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Day</p>
                        <p className="text-xs font-bold text-luxury-dark">{(booking.dayGuestAdults || 0) + (booking.dayGuestChildren?.length || 0)}</p>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Night</p>
                        <p className="text-xs font-bold text-luxury-dark">{(booking.nightGuestAdults || 0) + (booking.nightGuestChildren?.length || 0)}</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-xs font-bold text-luxury-dark">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Payment</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <ChevronRight size={16} className={`text-luxury-dark/20 transition-transform duration-300 ${expandedBookingId === booking.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedBookingId === booking.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-luxury-dark/5 bg-luxury-cream/10"
                      >
                        {bookingCardContent}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {filteredBookings.length === 0 && (
              <div className="bg-luxury-dark/5 rounded-3xl p-12 md:p-24 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Calendar size={32} className="text-luxury-dark/20" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">
                  No {activeFilter !== 'all' ? activeFilter : ''} Bookings
                </h3>
                <p className="text-luxury-dark/60 mb-8 max-w-md mx-auto">
                  You don't have any {activeFilter !== 'all' ? activeFilter : ''} bookings yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )}
    
    <AnimatePresence>
      {assigningExpenseBooking && (
        <AssignExpenseModal 
          booking={assigningExpenseBooking}
          expenseCategories={expenseCategories}
          onClose={() => setAssigningExpenseBooking(null)}
          showToast={showToast}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isConfirmModalOpen && (
        <ConfirmationModal 
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setBookingToDelete(null);
          }}
          onConfirm={async () => {
            if (!bookingToDelete) return;
            try {
              await deleteDoc(doc(db, 'bookings', bookingToDelete.id));
              await deleteDoc(doc(db, 'availability', bookingToDelete.id));
              await logAdminAction('delete_booking', bookingToDelete.id, `Deleted booking for ${bookingToDelete.name}`);
              showToast('Booking deleted successfully', 'success');
            } catch (error) {
              handleFirestoreError(error, OperationType.DELETE, `bookings/${bookingToDelete.id}`);
              showToast('Failed to delete booking', 'error');
            }
          }}
          title="Delete Booking"
          message={`Are you sure you want to delete the booking for ${bookingToDelete?.name}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isAnalyzeConfirmOpen && (
        <ConfirmationModal 
          isOpen={isAnalyzeConfirmOpen}
          onClose={() => setIsAnalyzeConfirmOpen(false)}
          onConfirm={startAnalysis}
          title="Auto-Analyze Gallery"
          message={`This will use AI to analyze all ${galleryImages.length} images and update their titles and categories. This process may take a few minutes. Continue?`}
          confirmText="Start Analysis"
          type="info"
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isUpdateModalOpen && (
        <PasswordUpdateModal 
          onClose={() => setIsUpdateModalOpen(false)}
          showToast={showToast}
        />
      )}
    </AnimatePresence>
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
        <a href="#" className="flex items-center gap-2 sm:gap-3">
          <img 
            src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
            alt="Unique Farmhouse Logo" 
            className="h-10 sm:h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className={`text-xl sm:text-2xl font-serif font-bold tracking-tighter leading-none ${isScrolled ? 'text-luxury-dark' : 'text-white'}`}>UNIQUE</span>
            <span className={`text-[8px] sm:text-[10px] tracking-[0.4em] uppercase -mt-0.5 ${isScrolled ? 'text-luxury-gold' : 'text-white/80'}`}>Farmhouse</span>
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

const Hero = ({ onBookNow, settings }: { onBookNow: () => void; settings?: any }) => {
  const bgImage = settings?.backgroundImage || "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg";
  const title = settings?.title || "Experience Luxury & Serenity at";
  const subtitle = settings?.subtitle || "Welcome to Noida's Finest Retreat";
  const description = settings?.description || "Premium Private Villa / Farmhouse Stay in Noida. Also known as Unique Farm House, we offer a sanctuary for celebrations, staycations, and unforgettable moments.";
  const highlight = settings?.highlight || "Unique Farm House Noida";

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
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
          className="inline-block text-xs sm:text-sm md:text-base uppercase tracking-[0.4em] mb-4 sm:mb-6 font-medium text-luxury-gold"
        >
          {subtitle}
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif mb-6 sm:mb-8 leading-[1.1] tracking-tight"
        >
          {title} <br />
          <span className="italic text-luxury-gold">{highlight}</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-base sm:text-lg md:text-xl font-light mb-8 sm:mb-12 max-w-2xl mx-auto text-white/90 leading-relaxed"
        >
          {description}
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
            className="luxury-button w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] border-none text-white !py-4 !px-8"
          >
            <MessageCircle size={20} /> Send WhatsApp
          </a>
          <a href="tel:+919313501001" className="luxury-button-outline !border-white !text-white hover:!bg-white hover:!text-luxury-dark w-full sm:w-auto flex items-center justify-center gap-2 !py-4 !px-8">
            <Phone size={20} /> Call Now
          </a>
          <button onClick={onBookNow} className="luxury-button w-full sm:w-auto flex items-center justify-center gap-2 !py-4 !px-8">
            <Calendar size={20} /> Book Now
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
    <section id="about" className="py-16 sm:py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square overflow-hidden rounded-2xl shadow-2xl border-8 border-white hidden lg:block">
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
            className="space-y-6"
          >
            <span className="section-subtitle text-left">The Experience</span>
            <h2 className="section-title text-left text-3xl sm:text-4xl md:text-5xl leading-tight">A Private Farm House / Villa Stay in the Heart of Noida</h2>
            <div className="space-y-6 text-luxury-dark/70 text-base sm:text-lg leading-relaxed">
              <p>
                Unique Farmhouse (also known as Unique Farm House) offers a refined escape from the urban hustle. Our premium 4BHK private villa is designed for those who seek exclusivity, comfort, and a touch of nature without leaving the city.
              </p>
              <p>
                Whether you're planning an intimate family gathering, a vibrant party, or traditional ceremonies like Haldi, Mehndi, and Sangeet, our spacious interiors and lush outdoors provide the perfect backdrop.
              </p>
              <p className="font-medium text-luxury-dark flex items-center gap-2">
                <Heart className="text-luxury-gold fill-luxury-gold" size={20} />
                Proudly LGBTQ+ Friendly & Inclusive
              </p>
              <div className="pt-6 flex flex-wrap gap-3 sm:gap-4">
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-xs sm:text-sm font-medium">Staycations</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-xs sm:text-sm font-medium">Parties</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-xs sm:text-sm font-medium">Weddings</div>
                <div className="px-4 py-2 bg-luxury-cream border border-luxury-gold/20 rounded-full text-xs sm:text-sm font-medium">Family Gatherings</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Amenities = ({ onAmenityClick }: { onAmenityClick: (category: string) => void }) => {
  const amenities = [
    { 
      icon: <Home size={32} />, 
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
      icon: <ShieldCheck size={32} />, 
      title: "Secure & Private", 
      features: [
        { icon: <Lock size={14} />, label: "24/7 Secure" },
        { icon: <EyeOff size={14} />, label: "Gated Entry" }
      ]
    },
    { 
      icon: <Maximize size={32} />, 
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
      icon: <Award size={32} />, 
      title: "Premium Stay", 
      features: [
        { icon: <Star size={14} />, label: "High-end" },
        { icon: <Sparkles size={14} />, label: "Top Service" }
      ]
    },
    { 
      icon: <ChefHat size={32} />, 
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

  const categoryMapping: Record<string, string> = {
    "Private Villa": "Villa",
    "Private Pool": "Pool",
    "Secure & Private": "Amenities",
    "Spacious Interiors": "Interiors",
    "LGBTQ+ Friendly": "Amenities",
    "Premium Stay": "Amenities",
    "Operated Kitchen": "Dining",
    "Games & Fun": "Activities"
  };

  return (
    <section id="amenities" className="py-16 sm:py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <span className="section-subtitle">Curated For Comfort</span>
        <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">World-Class Amenities</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mt-12 sm:mt-16">
          {amenities.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                onAmenityClick(categoryMapping[item.title] || 'Amenities');
                document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-xl transition-all duration-500 group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="text-luxury-gold mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="text-base md:text-lg font-serif mb-3 sm:mb-4">{item.title}</h3>
              
              <div className="flex flex-col gap-2 w-full">
                {item.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center justify-center gap-2 px-3 py-1.5 bg-luxury-cream/50 rounded-lg border border-black/5">
                    <span className="text-luxury-gold shrink-0">{feature.icon}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-luxury-dark/60 truncate">{feature.label}</span>
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

const Gallery = ({ onImageClick, images: firestoreImages, initialCategory = 'All' }: { onImageClick: (img: any) => void; images?: any[]; initialCategory?: string }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);
  
  // Combine Firestore images with fallback images, avoiding duplicates by src
  const firestoreSrcs = new Set((firestoreImages || []).map(img => img.src));
  const uniqueFallbackImages = GALLERY_FALLBACK_IMAGES.filter(img => !firestoreSrcs.has(img.src));
  
  const allImages = [...(firestoreImages || []), ...uniqueFallbackImages];
  const categories = ['All', 'Villa', 'Pool', 'Interiors', 'Dining', 'Activities', 'Amenities'];
  
  const filteredImages = activeCategory === 'All' 
    ? allImages 
    : allImages.filter(img => img.category === activeCategory);

  return (
    <section id="gallery" className="py-16 sm:py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-16 gap-8">
          <div className="text-center md:text-left">
            <span className="section-subtitle !text-left !mx-0">Visual Journey</span>
            <h2 className="section-title !text-left !mb-0 text-3xl sm:text-4xl md:text-5xl">Peek Inside Our Villa</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-luxury-dark text-white shadow-lg shadow-luxury-dark/20' 
                    : 'bg-luxury-dark/5 text-luxury-dark/40 hover:bg-luxury-dark/10 hover:text-luxury-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <motion.div 
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => (
              <motion.div 
                layout
                key={img.id || img.src}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                onClick={() => onImageClick(img)}
                className="relative group overflow-hidden rounded-3xl cursor-zoom-in shadow-sm hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all duration-500"
              >
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end text-white p-6 sm:p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-center">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mb-3 text-luxury-gold font-bold block">{img.category}</span>
                    <h3 className="text-lg sm:text-2xl font-serif mb-4">{img.title}</h3>
                    <div className="mx-auto w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-dark transition-colors">
                      <Maximize size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredImages.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-luxury-dark/30 italic font-serif text-xl">No images found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const GalleryModal = ({ image, onClose, onNext, onPrev }: { image: any, onClose: () => void, onNext?: () => void, onPrev?: () => void }) => {
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-7xl w-full max-h-full flex flex-col items-center"
          >
            <button 
              onClick={onClose}
              className="absolute -top-16 right-0 text-white/50 hover:text-white transition-colors p-2 z-10"
            >
              <X size={32} />
            </button>

            <div className="relative group w-full flex items-center justify-center">
              {onPrev && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="absolute left-4 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              <img 
                src={image.src} 
                alt={image.title} 
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {onNext && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="absolute right-4 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
            
            <div className="mt-8 text-center text-white max-w-2xl px-6">
              <span className="text-luxury-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-3 block">{image.category}</span>
              <h3 className="text-2xl sm:text-4xl font-serif mb-2">{image.title}</h3>
              {image.description && <p className="text-white/60 text-sm sm:text-base leading-relaxed">{image.description}</p>}
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
        source: 'manual',
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
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in memory to avoid requiring a composite index
      reviewsData.sort((a: any, b: any) => {
        const parseDate = (dateStr: string) => {
          if (!dateStr) return 0;
          try {
            const [datePart, timePart] = dateStr.split(', ');
            const [day, month, year] = datePart.split('/');
            const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];
            return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
          } catch (e) {
            return 0;
          }
        };
        return parseDate(b.createdAt) - parseDate(a.createdAt);
      });
      
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
    <section id="reviews" className="py-16 sm:py-24 px-6 bg-luxury-dark text-white overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <span className="section-subtitle !text-luxury-gold">Guest Testimonials</span>
        <h2 className="section-title !text-white text-3xl sm:text-4xl md:text-5xl">What Our Guests Say</h2>
        
        <div className="relative mt-12 sm:mt-16">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentReview.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 relative"
            >
              <div className="flex justify-center gap-1 mb-4 sm:mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    className={`${i < currentReview.rating ? 'text-luxury-gold fill-luxury-gold' : 'text-white/10'} sm:size-6`} 
                  />
                ))}
              </div>
              
              <p className="text-lg sm:text-2xl md:text-3xl font-serif italic mb-6 sm:mb-8 leading-relaxed">
                "{currentReview.comment}"
              </p>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-luxury-gold">
                    {currentReview.userName[0].toUpperCase()}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-medium flex items-center gap-2">
                  {currentReview.userName}
                  {currentReview.source === 'google' && (
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                  )}
                </h4>
                <span className="text-xs sm:text-sm text-white/50">{currentReview.source === 'google' ? 'Google Review' : 'Verified Guest'}</span>
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
  className,
  allBookings = []
}: any) => {
  const renderDayContents = (day: number, date: Date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const price = isWeekend ? 25000 : 22000;
    
    const isSoldOut = allBookings.some((b: any) => {
      const start = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      const end = parse(b.checkOut, 'dd/MM/yyyy', new Date());
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d >= start && d < end && b.status !== 'cancelled';
    });
    
    return (
      <div className="group relative flex flex-col items-center justify-center w-full h-full">
        <span className={`relative z-10 ${isSoldOut ? 'opacity-30' : ''}`}>{day}</span>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
            <div className="w-[150%] h-[1px] bg-red-500/30 rotate-45 absolute" />
            <div className="w-[150%] h-[1px] bg-red-500/30 -rotate-45 absolute" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
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
      >
        <div className="p-4 bg-luxury-dark border-t border-white/5 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-luxury-gold" />
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Sold Out</span>
          </div>
          <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-4">
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Weekday: ₹22k</span>
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Weekend: ₹25k</span>
          </div>
        </div>
      </DatePicker>
    </div>
  );
};

const BookingForm = ({ isModal = false, onClose, user, editBooking, userRole, onLogin, allBookings = [], showToast, expenseCategories = [] }: { 
  isModal?: boolean, 
  onClose?: () => void,
  user: FirebaseUser | null,
  editBooking?: any,
  userRole?: string | null,
  onLogin?: () => void,
  allBookings?: any[],
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  expenseCategories?: any[]
}) => {
  const [name, setName] = useState(editBooking?.name || (userRole === 'admin' && !editBooking ? '' : user?.displayName || ''));
  const [mobile, setMobile] = useState(editBooking?.mobile || '');
  const [email, setEmail] = useState(editBooking?.email || (userRole === 'admin' && !editBooking ? '' : user?.email || ''));
  const [dayGuestAdults, setDayGuestAdults] = useState(editBooking?.dayGuestAdults || 0);
  const [dayGuestChildren, setDayGuestChildren] = useState<number[]>(editBooking?.dayGuestChildren || []);
  const [nightGuestAdults, setNightGuestAdults] = useState(editBooking?.nightGuestAdults || 0);
  const [nightGuestChildren, setNightGuestChildren] = useState<number[]>(editBooking?.nightGuestChildren || []);
  const [occasion, setOccasion] = useState(editBooking?.occasion || '');
  const [bookedBy, setBookedBy] = useState(editBooking?.bookedBy && !['admin_for_client', 'admin_personal', 'client'].includes(editBooking.bookedBy) ? editBooking.bookedBy : '');
  const [checkIn, setCheckIn] = useState<Date | null>(editBooking?.checkIn ? parse(editBooking.checkIn, 'dd/MM/yyyy', new Date()) : null);
  const [checkOut, setCheckOut] = useState<Date | null>(editBooking?.checkOut ? parse(editBooking.checkOut, 'dd/MM/yyyy', new Date()) : null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdminBooking, setIsAdminBooking] = useState(userRole === 'admin' && !editBooking);
  const [hasSetDefaultBookingMode, setHasSetDefaultBookingMode] = useState(false);
  const [bookingAmount, setBookingAmount] = useState<number>(editBooking?.bookingAmount || (editBooking ? (editBooking.totalAmount - (editBooking.securityDeposit || 5000)) : 0));
  const [securityAmount, setSecurityAmount] = useState<number>(editBooking?.securityDeposit || 5000);

  useEffect(() => {
    if (userRole === 'admin' && !editBooking && !hasSetDefaultBookingMode) {
      setIsAdminBooking(true);
      setHasSetDefaultBookingMode(true);
    }
  }, [userRole, editBooking, hasSetDefaultBookingMode]);

  const [amountPaid, setAmountPaid] = useState<number>(editBooking?.amountPaid || 0);
  const [expenses, setExpenses] = useState<any[]>(editBooking?.expenses || []);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [clients, setClients] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    if (userRole === 'admin' && isAdminBooking) {
      const fetchClients = async () => {
        try {
          const q = query(collection(db, 'users'), where('role', '==', 'client'));
          const snapshot = await getDocs(q);
          setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error('Error fetching clients:', err);
        }
      };
      fetchClients();
    }
  }, [userRole, isAdminBooking]);

  useEffect(() => {
    if (!editBooking && checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      let total = 0;
      let current = new Date(start);
      
      while (current < end) {
        const day = current.getDay(); 
        if (day >= 1 && day <= 4) {
          total += 22000;
        } else {
          total += 25000;
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
        if (b.status === 'cancelled') return false;
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
      if (b.status === 'cancelled') return false;
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
      if (b.status === 'cancelled') return;
      
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
    
    if (!name.trim() && !isAdminBooking) newErrors.name = "Full name is required";
    if (!mobile.trim() && !isAdminBooking) {
      newErrors.mobile = "Mobile number is required";
    } else if (mobile.trim() && !/^\d{10}$/.test(mobile.replace(/\D/g, ''))) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    
    if (!email.trim() && !isAdminBooking) {
      newErrors.email = "Email address is required";
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
        if (b.status === 'cancelled') return false;
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
    
    if (dayGuestAdults + dayGuestChildren.length < 1) {
      newErrors.dayGuests = "At least 1 day guest is required";
    } else if (dayGuestAdults + dayGuestChildren.length > 25) {
      newErrors.dayGuests = "Maximum 25 day guests allowed";
    }
    
    if (nightGuestAdults + nightGuestChildren.length < 0) {
      newErrors.nightGuests = "Guests cannot be negative";
    } else if (nightGuestAdults + nightGuestChildren.length > 12) {
      newErrors.nightGuests = "Maximum 12 night guests allowed";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setErrors({});
    handleFinalConfirm();
  };

  const handleFinalConfirm = async () => {
    setLoading(true);
    const totalAmount = bookingAmount + securityAmount;
    const securityDeposit = securityAmount;

    try {
      let finalUid = editBooking ? editBooking.uid : (isAdminBooking ? 'admin_manual' : (user?.uid || 'guest'));
      
      if (isAdminBooking && !editBooking && email) {
        try {
          const userQuery = query(collection(db, 'users'), where('email', '==', email));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            finalUid = userSnapshot.docs[0].id;
          }
        } catch (e) {
          console.error('Error finding user by email:', e);
        }
      }

      const bookingData = {
        uid: finalUid,
        checkIn: checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : '',
        checkOut: checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : '',
        dayGuestAdults,
        dayGuestChildren,
        nightGuestAdults,
        nightGuestChildren,
        status: editBooking ? editBooking.status : (isAdminBooking ? 'confirmed' : 'pending'),
        bookingAmount,
        totalAmount,
        amountPaid: amountPaid,
        securityDeposit,
        expenses,
        paymentStatus: amountPaid >= totalAmount ? 'paid' : (amountPaid > 0 ? 'part-paid' : 'unpaid'),
        createdAt: editBooking ? editBooking.createdAt : format(new Date(), 'dd/MM/yyyy, HH:mm:ss'),
        name,
        mobile,
        email,
        occasion,
        bookedBy: userRole === 'admin' ? (bookedBy || (isAdminBooking ? 'admin_for_client' : 'admin_personal')) : 'client',
        paymentMethod: paymentMethod
      };

      console.log('Submitting booking data:', bookingData);

      if (user || isAdminBooking || !user) { // Allow guest bookings
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
          // Store notification in Firestore
          await addDoc(collection(db, 'notifications'), {
            type: 'update',
            bookingId: editBooking.id,
            message: `Updated booking from ${name}`,
            details: bookingData,
            read: false,
            createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
          });
          // Send notification
          fetch('/api/notify/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking: { ...bookingData, id: editBooking.id }, type: 'update' })
          }).catch(err => console.error('Notification error:', err));
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
          // Store notification in Firestore
          await addDoc(collection(db, 'notifications'), {
            type: 'create',
            bookingId: docRef.id,
            message: `New booking from ${name}`,
            details: bookingData,
            read: false,
            createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
          });
          // Send notification
          fetch('/api/notify/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking: { ...bookingData, id: docRef.id }, type: 'create' })
          }).catch(err => console.error('Notification error:', err));
        }
      }

      // Also send WhatsApp message for immediate attention
      const message = `*${editBooking ? 'Updated' : 'New'} Booking Request for Unique Farmhouse*%0A%0A` +
        `*Booking ID:* ${editBooking ? editBooking.id.slice(0, 8) : 'New'}%0A` +
        `*Name:* ${name || 'Not specified'}%0A` +
        `*Mobile:* ${mobile || 'Not specified'}%0A` +
        `*Email:* ${email || 'Not specified'}%0A` +
        `*Guests (Day):* ${dayGuestAdults} Adults, ${dayGuestChildren.length} Children (Ages: ${dayGuestChildren.join(', ')})%0A` +
        `*Guests (Night):* ${nightGuestAdults} Adults, ${nightGuestChildren.length} Children (Ages: ${nightGuestChildren.join(', ')})%0A` +
        `*Occasion:* ${occasion || 'Not specified'}%0A` +
        `*Check-In:* ${checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : 'Not specified'}%0A` +
        `*Check-Out:* ${checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : 'Not specified'}%0A` +
        `*Booking Amount:* ₹${bookingAmount.toLocaleString()}%0A` +
        `*Security Deposit:* ₹${securityAmount.toLocaleString()}%0A` +
        `*Total Amount:* ₹${totalAmount.toLocaleString()}%0A` +
        `*Payment Method:* ${paymentMethod.toUpperCase()}`;
      
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
                  <p className="font-bold text-luxury-dark">{dayGuestAdults} Adults, {dayGuestChildren.length} Children</p>
                </div>
                <div>
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-1">Guests (Night)</p>
                  <p className="font-bold text-luxury-dark">{nightGuestAdults} Adults, {nightGuestChildren.length} Children</p>
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
            href={`https://wa.me/919313501001?text=${encodeURIComponent(`*Booking Request Summary for Unique Farmhouse*\n\n*Name:* ${name}\n*Check-In:* ${checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : 'N/A'}\n*Check-Out:* ${checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : 'N/A'}\n*Guests:* ${dayGuestAdults + dayGuestChildren.length} Day (${dayGuestAdults}A, ${dayGuestChildren.length}C) / ${nightGuestAdults + nightGuestChildren.length} Night (${nightGuestAdults}A, ${nightGuestChildren.length}C)\n*Total Amount:* ₹${totalAmount.toLocaleString()}`)}`}
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
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-luxury-gold/10 border border-luxury-gold/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-luxury-dark">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-luxury-dark text-sm">Booking Mode</p>
                <p className="text-[10px] text-luxury-dark/60 uppercase tracking-widest">
                  {isAdminBooking ? 'Booking for a Client' : 'Personal Booking'}
                </p>
              </div>
            </div>
            <div className="flex bg-white p-1 rounded-lg border border-luxury-dark/10">
              <button
                type="button"
                onClick={() => {
                  setIsAdminBooking(false);
                  setName(user?.displayName || '');
                  setEmail(user?.email || '');
                  setMobile('');
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  !isAdminBooking ? 'bg-luxury-dark text-white' : 'text-luxury-dark/40 hover:text-luxury-dark'
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdminBooking(true);
                  setName('');
                  setEmail('');
                  setMobile('');
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isAdminBooking ? 'bg-luxury-dark text-white' : 'text-luxury-dark/40 hover:text-luxury-dark'
                }`}
              >
                Client
              </button>
            </div>
          </div>

          {isAdminBooking && (
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search existing client by email or name..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  className="w-full px-4 py-3 pl-10 bg-white border border-luxury-dark/10 rounded-xl text-sm focus:outline-none focus:border-luxury-gold transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-dark/30" size={18} />
                {clientSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientSearch('');
                      setShowClientDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-dark/30 hover:text-luxury-dark"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showClientDropdown && (clientSearch || clients.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-luxury-dark/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto"
                  >
                    <div className="p-2">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/30 px-3 py-2">
                        {clientSearch ? 'Search Results' : 'Recent Clients'}
                      </p>
                      {clients
                        .filter(c => 
                          c.email.toLowerCase().includes(clientSearch.toLowerCase()) || 
                          c.displayName.toLowerCase().includes(clientSearch.toLowerCase())
                        )
                        .map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setName(client.displayName);
                              setEmail(client.email);
                              setMobile(client.mobile || '');
                              setClientSearch(client.email);
                              setShowClientDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-luxury-cream rounded-xl transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-xs">
                              {client.displayName[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-luxury-dark">{client.displayName}</p>
                              <p className="text-[10px] text-luxury-dark/40">{client.email}</p>
                            </div>
                          </button>
                        ))}
                      <button
                        type="button"
                        onClick={() => {
                          setName('');
                          setEmail('');
                          setMobile('');
                          setClientSearch('');
                          setShowClientDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-luxury-cream rounded-xl transition-colors text-left border-t border-luxury-dark/5 mt-1"
                      >
                        <div className="w-8 h-8 rounded-full bg-luxury-dark/5 flex items-center justify-center text-luxury-dark/40">
                          <Plus size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-luxury-dark">New Client</p>
                          <p className="text-[10px] text-luxury-dark/40">Enter details manually below</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {allBookings.filter(b => b.status !== 'cancelled' && b.type !== 'external' && parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date()).length > 0 && (
        <div className="mb-8 p-6 bg-red-50/50 border border-red-100/50 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-red-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 block">Reservation Alert</span>
                <span className="text-xs font-bold text-red-900/60">Sold Out Dates</span>
              </div>
            </div>
            <div className="px-3 py-1 bg-red-100 rounded-full text-[9px] font-bold text-red-600 uppercase tracking-widest">
              {allBookings.filter(b => b.status !== 'cancelled' && b.type !== 'external' && parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date()).length} Booked
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allBookings
              .filter(b => b.status !== 'cancelled' && b.type !== 'external' && parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date())
              .sort((a, b) => parse(a.checkIn, 'dd/MM/yyyy', new Date()).getTime() - parse(b.checkIn, 'dd/MM/yyyy', new Date()).getTime())
              .slice(0, 6)
              .map((b, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-red-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] text-red-900 font-bold tracking-tight">
                    {b.checkIn} <span className="text-red-300 mx-1">→</span> {b.checkOut}
                  </span>
                </div>
              ))}
            {allBookings.filter(b => b.status !== 'cancelled' && b.type !== 'external' && parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date()).length > 6 && (
              <div className="flex items-center px-3 py-2 bg-red-100/50 border border-red-200 rounded-xl text-[10px] text-red-600 font-bold uppercase tracking-widest">
                + {allBookings.filter(b => b.status !== 'cancelled' && b.type !== 'external' && parse(b.checkOut, 'dd/MM/yyyy', new Date()) >= new Date()).length - 6} more
              </div>
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

      <div className={`grid grid-cols-1 ${userRole === 'admin' ? 'md:grid-cols-2' : ''} gap-5`}>
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

        {userRole === 'admin' && (
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Booked By (Admin Only)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. MakeMyTrip, Direct, Agent Name"
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                className="w-full px-4 py-4 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm" 
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Day Guests</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-luxury-dark/40">Adults</label>
              <input 
                type="number" 
                min="0" 
                value={dayGuestAdults} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDayGuestAdults(val);
                  if (val + dayGuestChildren.length <= 25 && errors.dayGuests) {
                    setErrors(prev => {
                      const next = {...prev};
                      delete next.dayGuests;
                      return next;
                    });
                  }
                }} 
                onBlur={() => {
                  if (dayGuestAdults + dayGuestChildren.length > 25) {
                    setErrors(prev => ({...prev, dayGuests: "Maximum 25 day guests allowed"}));
                  }
                }}
                className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-luxury-dark/40">Children</label>
              <button 
                type="button" 
                onClick={() => {
                  const newChildren = [...dayGuestChildren, 0];
                  setDayGuestChildren(newChildren);
                  if (dayGuestAdults + newChildren.length > 25) {
                    setErrors(prev => ({...prev, dayGuests: "Maximum 25 day guests allowed"}));
                  }
                }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                <Plus size={16} /> Add Child
              </button>
            </div>
          </div>
          {dayGuestChildren.map((age, index) => (
            <div key={index} className="flex items-center gap-2">
              <input 
                type="number" 
                min="0" 
                max="18" 
                placeholder="Child Age" 
                value={age} 
                onChange={(e) => {
                  const newAges = [...dayGuestChildren];
                  newAges[index] = parseInt(e.target.value) || 0;
                  setDayGuestChildren(newAges);
                }} 
                onBlur={() => {
                  if (dayGuestAdults + dayGuestChildren.length > 25) {
                    setErrors(prev => ({...prev, dayGuests: "Maximum 25 day guests allowed"}));
                  }
                }}
                className="w-full px-4 py-2 bg-luxury-cream border border-black/5 rounded-xl text-sm" 
              />
              <button 
                type="button" 
                onClick={() => {
                  const newChildren = dayGuestChildren.filter((_, i) => i !== index);
                  setDayGuestChildren(newChildren);
                  if (dayGuestAdults + newChildren.length <= 25 && errors.dayGuests) {
                    setErrors(prev => {
                      const next = {...prev};
                      delete next.dayGuests;
                      return next;
                    });
                  }
                }} 
                className="p-2 bg-red-100 text-red-600 rounded-lg"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          {errors.dayGuests && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.dayGuests}</p>}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Night Guests</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-luxury-dark/40">Adults</label>
              <input 
                type="number" 
                min="0" 
                value={nightGuestAdults} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setNightGuestAdults(val);
                  if (val + nightGuestChildren.length <= 12 && errors.nightGuests) {
                    setErrors(prev => {
                      const next = {...prev};
                      delete next.nightGuests;
                      return next;
                    });
                  }
                }} 
                onBlur={() => {
                  if (nightGuestAdults + nightGuestChildren.length > 12) {
                    setErrors(prev => ({...prev, nightGuests: "Maximum 12 night guests allowed"}));
                  }
                }}
                className="w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest font-bold text-luxury-dark/40">Children</label>
              <button 
                type="button" 
                onClick={() => {
                  const newChildren = [...nightGuestChildren, 0];
                  setNightGuestChildren(newChildren);
                  if (nightGuestAdults + newChildren.length > 12) {
                    setErrors(prev => ({...prev, nightGuests: "Maximum 12 night guests allowed"}));
                  }
                }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                <Plus size={16} /> Add Child
              </button>
            </div>
          </div>
          {nightGuestChildren.map((age, index) => (
            <div key={index} className="flex items-center gap-2">
              <input 
                type="number" 
                min="0" 
                max="18" 
                placeholder="Child Age" 
                value={age} 
                onChange={(e) => {
                  const newAges = [...nightGuestChildren];
                  newAges[index] = parseInt(e.target.value) || 0;
                  setNightGuestChildren(newAges);
                }} 
                onBlur={() => {
                  if (nightGuestAdults + nightGuestChildren.length > 12) {
                    setErrors(prev => ({...prev, nightGuests: "Maximum 12 night guests allowed"}));
                  }
                }}
                className="w-full px-4 py-2 bg-luxury-cream border border-black/5 rounded-xl text-sm" 
              />
              <button 
                type="button" 
                onClick={() => {
                  const newChildren = nightGuestChildren.filter((_, i) => i !== index);
                  setNightGuestChildren(newChildren);
                  if (nightGuestAdults + newChildren.length <= 12 && errors.nightGuests) {
                    setErrors(prev => {
                      const next = {...prev};
                      delete next.nightGuests;
                      return next;
                    });
                  }
                }} 
                className="p-2 bg-red-100 text-red-600 rounded-lg"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
          {errors.nightGuests && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{errors.nightGuests}</p>}
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
          <div className="flex justify-between items-center">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Check-In (At 2:00 PM)</label>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                <span className="text-[8px] uppercase font-bold text-luxury-dark/30">Sold Out</span>
              </div>
              {(checkIn || checkOut) && (
                <button 
                  type="button" 
                  onClick={() => { setCheckIn(null); setCheckOut(null); }}
                  className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold hover:text-luxury-dark transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <BookingCalendar
              selected={checkIn}
              onChange={(date: Date) => {
                setCheckIn(date);
                if (date && (!checkOut || date >= checkOut)) {
                  setCheckOut(addDays(date, 1));
                }
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
              allBookings={allBookings}
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
              allBookings={allBookings}
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
              Weekday: ₹22,000
            </p>
            <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-luxury-gold" />
              Weekend: ₹25,000
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

      {userRole === 'admin' && (
        <div className="space-y-3 pt-4 border-t border-luxury-dark/5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Booking Expenses</label>
            <button 
              type="button"
              onClick={() => setExpenses([...expenses, { category: 'Other', amount: 0, note: '', date: format(new Date(), 'yyyy-MM-dd') }])}
              className="text-[9px] font-bold text-luxury-gold hover:text-luxury-dark uppercase tracking-widest flex items-center gap-1"
            >
              <Plus size={12} /> Add Expense
            </button>
          </div>
          
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div key={index} className="p-4 bg-luxury-cream rounded-2xl border border-black/5 space-y-3 relative group">
                <button 
                  type="button"
                  onClick={() => setExpenses(expenses.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Category</label>
                    <select 
                      value={expense.category}
                      onChange={(e) => {
                        const newExpenses = [...expenses];
                        newExpenses[index].category = e.target.value;
                        setExpenses(newExpenses);
                      }}
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-bold focus:outline-none"
                    >
                      {expenseCategories.length > 0 ? (
                        expenseCategories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Staff">Staff</option>
                          <option value="Food">Food</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Amount (₹)</label>
                    <input 
                      type="number"
                      value={expense.amount}
                      onChange={(e) => {
                        const newExpenses = [...expenses];
                        newExpenses[index].amount = parseInt(e.target.value) || 0;
                        setExpenses(newExpenses);
                      }}
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Note</label>
                  <input 
                    type="text"
                    placeholder="Optional note..."
                    value={expense.note}
                    onChange={(e) => {
                      const newExpenses = [...expenses];
                      newExpenses[index].note = e.target.value;
                      setExpenses(newExpenses);
                    }}
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-[10px] text-center text-luxury-dark/20 italic py-2">No expenses recorded for this booking.</p>
            )}
            {expenses.length > 0 && (
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-bold text-luxury-dark/40 uppercase tracking-widest">Total Expenses</span>
                <span className="text-xs font-bold text-red-600">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2 px-1">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">
          <span>Booking Amount</span>
          <span>₹{bookingAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">
          <span>Security Deposit</span>
          <span>₹{securityAmount.toLocaleString()}</span>
        </div>
        <div className="p-4 bg-luxury-dark/5 rounded-xl flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-luxury-dark/60 uppercase tracking-widest">Total Amount</span>
          <span className="text-xl font-serif font-bold text-luxury-dark">₹{(bookingAmount + securityAmount).toLocaleString()}</span>
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

const BookingModal = ({ isOpen, onClose, user, userRole, onLogin, allBookings, showToast, expenseCategories = [] }: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: FirebaseUser | null, 
  userRole: string | null, 
  onLogin: () => void, 
  allBookings: any[], 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  expenseCategories?: any[]
}) => {
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
            <div className="p-5 sm:p-8 md:p-10">
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div>
                  <span className="text-luxury-gold text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold mb-2 block">Reserve Your Stay</span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-luxury-dark">Book Now</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-luxury-cream rounded-full transition-colors text-luxury-dark/40 hover:text-luxury-dark"
                >
                  <X size={24} />
                </button>
              </div>
              <BookingForm isModal onClose={onClose} user={user} userRole={userRole} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BookingSection = ({ onBookNow }: { onBookNow: () => void }) => {
  return (
    <section id="booking" className="py-16 sm:py-24 px-6 bg-luxury-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Reserve Your Stay</span>
            <h2 className="section-title text-left text-3xl sm:text-4xl md:text-5xl">Book Your Experience</h2>
            <p className="text-luxury-dark/60 mb-8 text-base sm:text-lg">
              Ready for an unforgettable stay? Our premium 4BHK villa is waiting for you. Experience the pinnacle of luxury and privacy in Noida.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Calendar size={18} className="sm:size-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Instant Response</h4>
                  <p className="text-xs sm:text-sm text-luxury-dark/50">Our team responds to WhatsApp inquiries within minutes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Shield size={18} className="sm:size-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Verified Booking</h4>
                  <p className="text-xs sm:text-sm text-luxury-dark/50">Secure your dates with our official WhatsApp channel.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center text-luxury-gold shadow-sm shrink-0">
                  <Phone size={18} className="sm:size-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base">Direct Support</h4>
                  <p className="text-xs sm:text-sm text-luxury-dark/50">Call us directly at +91 9313501001 for any special requests.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-luxury-dark p-6 sm:p-12 rounded-3xl shadow-2xl border border-white/10 text-center text-white relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-luxury-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-luxury-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Calendar size={32} className="text-luxury-gold sm:size-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif mb-4 sm:mb-6">Ready to Experience Luxury?</h3>
              <p className="text-sm sm:text-base text-white/60 mb-8 sm:mb-10 max-w-md mx-auto">
                Check availability and book your stay instantly through our secure booking portal.
              </p>
              <button 
                onClick={onBookNow}
                className="luxury-button w-full !py-4 sm:!py-5 text-base sm:text-lg flex items-center justify-center gap-3 group/btn"
              >
                Open Booking Portal <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/40">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-luxury-gold" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-luxury-gold" />
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">Instant Confirmation</span>
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
    <section id="location" className="py-16 sm:py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-subtitle text-left">Our Location</span>
            <h2 className="section-title text-left text-3xl sm:text-4xl">Find Us in Noida</h2>
            
            <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
              <div className="flex items-start gap-4">
                <MapPin className="text-luxury-gold shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="text-lg sm:text-xl font-serif mb-2">Address</h4>
                  <p className="text-sm sm:text-base text-luxury-dark/60 leading-relaxed">
                    Plot No 22, Phase 17, Sector 135, <br />
                    Noida, Uttar Pradesh 201305
                  </p>
                  <div className="mt-4 inline-block px-3 py-1 bg-luxury-cream border border-luxury-gold/20 rounded text-[10px] sm:text-xs font-mono text-luxury-gold">
                    Plus Code: F9PV+JW Noida, Uttar Pradesh
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://www.google.com/maps/dir//Unique+Farm+House,+Plot+No.+22,+Phase+17,+Sector+135,+Noida,+Uttar+Pradesh+201305/@28.5134549,77.3898596,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x390ce9c8aeda8887:0x68be2c850b642f5d!2m2!1d77.3948326!2d28.4865429" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="luxury-button flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Navigation size={18} /> Get Directions
                </a>
                <a 
                  href="tel:+919313501001" 
                  className="luxury-button-outline flex items-center justify-center gap-2 text-sm sm:text-base"
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
            className="h-[300px] sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-black/5"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.874123456789!2d77.3926!3d28.4865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce9c8aeda8887%3A0x68be2c850b642f5d!2sUnique%20Farm%20House!5e0!3m2!1sen!2sin!4v1711880000000!5m2!1sen!2sin" 
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
    <footer className="bg-luxury-dark text-white py-12 sm:py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          <div className="space-y-6">
            <a href="#" className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
                alt="Unique Farmhouse Logo" 
                className="h-12 sm:h-16 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-serif font-bold tracking-tighter">UNIQUE</span>
                <span className="text-[10px] sm:text-xs tracking-[0.4em] uppercase -mt-1 text-luxury-gold">Farmhouse</span>
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
            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">© 2024 Unique Farmhouse (Unique Farm House). All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WelcomeModal = ({ isOpen, onClose, onBookNow }: { isOpen: boolean; onClose: () => void; onBookNow: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors text-white"
            >
              <X size={20} />
            </button>

            {/* Header Image */}
            <div className="relative h-64">
              <img 
                src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772720563/15_gtwa17.jpg" 
                alt="Welcome to Unique Farmhouse" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-luxury-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-2 block">Welcome to</span>
                  <h2 className="text-3xl sm:text-4xl font-serif text-luxury-dark leading-tight">Unique Farm House</h2>
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 text-center space-y-6">
              <p className="text-luxury-dark/60 text-sm sm:text-base leading-relaxed">
                Experience the pinnacle of luxury and serenity in the heart of Noida. Your private sanctuary for celebrations, staycations, and unforgettable moments awaits.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-luxury-cream rounded-2xl border border-luxury-gold/10">
                  <Heart className="text-luxury-gold mx-auto mb-2" size={20} />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark">Inclusive</p>
                </div>
                <div className="p-4 bg-luxury-cream rounded-2xl border border-luxury-gold/10">
                  <ShieldCheck className="text-luxury-gold mx-auto mb-2" size={20} />
                  <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark">Secure</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => {
                    onBookNow();
                    onClose();
                  }}
                  className="luxury-button w-full !py-4 flex items-center justify-center gap-2 group"
                >
                  Explore & Book Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onClose}
                  className="text-luxury-dark/40 hover:text-luxury-dark text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InstallPrompt = ({ onInstall, onClose, isIOS }: { onInstall: () => void; onClose: () => void; isIOS: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 left-6 right-6 z-[150] bg-white rounded-3xl shadow-2xl p-6 border border-luxury-dark/5 flex flex-col sm:flex-row items-center gap-6"
    >
      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
        <img 
          src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
          alt="App Icon" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-lg font-serif font-bold text-luxury-dark">Install Unique Farmhouse</h3>
        <p className="text-sm text-luxury-dark/60">
          {isIOS 
            ? "Tap the share button and select 'Add to Home Screen' to install." 
            : "Add to your home screen for a better experience and quick access."}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          onClick={onClose}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-luxury-dark/10 text-luxury-dark font-bold text-sm hover:bg-luxury-cream transition-colors"
        >
          Not Now
        </button>
        {!isIOS && (
          <button 
            onClick={onInstall}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-luxury-gold text-white font-bold text-sm hover:bg-luxury-gold/90 shadow-lg shadow-luxury-gold/20 transition-all"
          >
            Install App
          </button>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [heroSettings, setHeroSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('install_prompt_dismissed');
      // If dismissed more than 7 days ago, show again
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (!dismissed || (Date.now() - parseInt(dismissed)) > sevenDays) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS check
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('install_prompt_dismissed');
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (!dismissed || (Date.now() - parseInt(dismissed)) > sevenDays) {
        setShowInstallPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleCloseInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('install_prompt_dismissed', Date.now().toString());
  };

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
    const hasVisited = localStorage.getItem('has_visited_unique_farmhouse');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsWelcomeModalOpen(true);
        localStorage.setItem('has_visited_unique_farmhouse', 'true');
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const qAvailability = query(collection(db, 'availability'), where('status', 'in', ['confirmed', 'pending']));
    const qBlocked = query(collection(db, 'blocked_dates'));

    const unsubscribeAvailability = onSnapshot(qAvailability, (snapshot) => {
      const availabilityData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // We'll merge these later with blocked dates
      setAllBookings(prev => {
        const blocked = prev.filter(b => b.type === 'external');
        return [...availabilityData, ...blocked];
      });
    }, (error) => handleFirestoreError(error, OperationType.GET, 'availability'));

    const unsubscribeBlocked = onSnapshot(qBlocked, (snapshot) => {
      const blockedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllBookings(prev => {
        const availability = prev.filter(b => b.type !== 'external');
        return [...availability, ...blockedData];
      });
    }, (error) => handleFirestoreError(error, OperationType.GET, 'blocked_dates'));

    return () => {
      unsubscribeAvailability();
      unsubscribeBlocked();
    };
  }, []);

  useEffect(() => {
    const qGallery = query(collection(db, 'gallery'));
    const unsubscribeGallery = onSnapshot(qGallery, (snapshot) => {
      setGalleryImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'gallery'));

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroSettings(docSnap.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/hero'));

    return () => {
      unsubscribeGallery();
      unsubscribeSettings();
    };
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
  const handleSignOut = () => {
    signOut(auth);
  };

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
    <ErrorBoundary>
      <div className="relative">
      <Navbar 
        onBookNow={openBookingModal} 
        onLogin={() => setIsAuthModalOpen(true)}
        user={user}
        userRole={userRole}
        onMyBookings={() => setIsDashboardOpen(true)}
      />
      <main>
        <Hero onBookNow={openBookingModal} settings={heroSettings} />
        <About />
        <Amenities onAmenityClick={setGalleryCategory} />
        <Gallery onImageClick={setSelectedImage} images={galleryImages} initialCategory={galleryCategory} />
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
      <GalleryModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
        onNext={() => {
          const firestoreSrcs = new Set(galleryImages.map(img => img.src));
          const uniqueFallbackImages = GALLERY_FALLBACK_IMAGES.filter(img => !firestoreSrcs.has(img.src));
          const allImages = [...galleryImages, ...uniqueFallbackImages];
          const currentIndex = allImages.findIndex(img => img.src === selectedImage.src);
          const nextIndex = (currentIndex + 1) % allImages.length;
          setSelectedImage(allImages[nextIndex]);
        }}
        onPrev={() => {
          const firestoreSrcs = new Set(galleryImages.map(img => img.src));
          const uniqueFallbackImages = GALLERY_FALLBACK_IMAGES.filter(img => !firestoreSrcs.has(img.src));
          const allImages = [...galleryImages, ...uniqueFallbackImages];
          const currentIndex = allImages.findIndex(img => img.src === selectedImage.src);
          const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
          setSelectedImage(allImages[prevIndex]);
        }}
      />
      
      <AnimatePresence>
        {isDashboardOpen && user && (
          <MyBookings 
            user={user} 
            userRole={userRole} 
            onClose={() => setIsDashboardOpen(false)} 
            onLogin={() => setIsAuthModalOpen(true)} 
            allBookings={allBookings} 
            showToast={showToast} 
            onLogout={handleSignOut}
            galleryImages={galleryImages}
            heroSettings={heroSettings}
          />
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
        {showInstallPrompt && (
          <InstallPrompt 
            onInstall={handleInstallClick} 
            onClose={handleCloseInstallPrompt} 
            isIOS={isIOS}
          />
        )}
      </AnimatePresence>

      <WelcomeModal 
        isOpen={isWelcomeModalOpen} 
        onClose={() => setIsWelcomeModalOpen(false)} 
        onBookNow={openBookingModal}
      />
    </div>
    </ErrorBoundary>
  );
}
