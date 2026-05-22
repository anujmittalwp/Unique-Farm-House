import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import emailjs from '@emailjs/browser';
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
  Edit2,
  Trash2,
  CreditCard,
  LogOut,
  History,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LayoutDashboard,
  Eye,
  Moon,
  CheckCircle2,
  Clock,
  Cloud,
  AlertCircle,
  Edit3,
  IndianRupee,
  Copy,
  MessageSquare,
  RefreshCw,
  Download,
  Share2,
  Plus,
  Minus,
  Search,
  BookOpen,
  Save,
  Image as GalleryIcon,
  Settings,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Tag,
  ExternalLink,
  Maximize2,
  Table,
  Ticket,
  Gift
} from 'lucide-react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Blog, BlogPost } from './Blog';
import { BlogAdmin } from './BlogAdmin';
import PrivacyPolicy from './PrivacyPolicy';
import { getAI, safeAiCall } from './lib/ai';
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
  limit,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  or,
  writeBatch,
  increment,
  getDocFromServer
} from 'firebase/firestore';
import { format, addDays, parse, isValid } from 'date-fns';
import DatePicker from 'react-datepicker';
import Papa from 'papaparse';
import { ElegantLeadsDashboard } from './ElegantLeadsDashboard';
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';


const playNotificationSound = () => {
  const isEnabled = localStorage.getItem('notif_sound_enabled') !== 'false';
  if (!isEnabled) return;
  
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Audio play blocked or failed:', e));
  } catch (e) {}
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushReminder = ({ onEnable, onDismiss }: { onEnable: () => void, onDismiss: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-[150] max-w-sm w-full"
    >
      <div className="p-6 bg-luxury-dark border border-luxury-gold/30 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-luxury-gold/20 rounded-2xl flex items-center justify-center shrink-0">
            <BellRing className="text-luxury-gold" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1">Turn on Notifications</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Get real-time updates for new leads, bookings, and important alerts directly on your device.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onEnable}
                className="flex-1 py-3 px-4 bg-luxury-gold hover:bg-white text-luxury-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Enable Now
              </button>
              <button 
                onClick={onDismiss}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PushBlockedReminder = ({ onDismiss }: { onDismiss: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-6 right-6 z-[150] max-w-sm w-full"
    >
      <div className="p-6 bg-red-900/90 border border-red-500/30 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <BellOff className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1">Notifications Blocked</h4>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              You've blocked notifications. Please enable them in your browser settings (click lock icon next to URL) to receive real-time alerts.
            </p>
            <button 
              onClick={onDismiss}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Understand
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GALLERY_FALLBACK_IMAGES = [
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg", title: "Unique Farmhouse Cottage with Swimming Pool and Lush Lawn", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg", title: "Scenic Lawn View of Unique Farmhouse Property", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg", title: "Luxury Poolside Area at Unique Farmhouse", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg", title: "Modern Villa Exterior and Pool View", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg", title: "Beautiful Garden Area and Landscaping", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg", title: "Unique Farmhouse Villa Night View with Lighting", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg", title: "Spacious Pool Deck for Relaxation", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg", title: "Grand Villa Entrance at Unique Farmhouse", category: "Villa" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg", title: "Large Private Swimming Pool at Unique Farmhouse", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg", title: "Comfortable Pool Lounge and Seating", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg", title: "Crystal Clear Water in the Private Pool", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg", title: "Evening Poolside Ambiance at Unique Farmhouse", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg", title: "Relaxing Poolside View with Sunbeds", category: "Pool" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg", title: "Elegant High Tea Setup at Unique Farmhouse", category: "Dining" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg", title: "Bonfire Night Experience for Guests", category: "Activities" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg", title: "Cozy Bonfire Setup in the Garden", category: "Activities" },
  { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg", title: "Evening Bonfire Gathering Area", category: "Activities" },
];

const APP_VERSION = '1.0.10';

const clearAppCache = (forced = false) => {
  console.log(`Clearing application cache and cookies (Forced: ${forced})...`);
  
  // Save Firebase auth token if not forced (to avoid unnecessary logout)
  const savedAuth = localStorage.getItem('firebase:authUser');
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear Cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  
  // Restore auth if not forced
  if (!forced && savedAuth) {
    localStorage.setItem('firebase:authUser', savedAuth);
  }
  
  // Set the current version
  localStorage.setItem('app_version', APP_VERSION);
  
  // Force reload to apply changes
  window.location.reload();
};

const useEscapeKey = (onClose: () => void, isOpen: boolean = true) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, isOpen]);
};

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
  if (errInfo.error.includes('Missing or insufficient permissions')) {
    throw JSON.stringify(errInfo);
  } else {
    throw new Error(JSON.stringify(errInfo));
  }
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

const NotificationPanel = ({ notifications, onClose, onClear }: { notifications: any[], onClose: () => void, onClear: () => void }) => {
  useEscapeKey(onClose, true);
  return (
    <>
      <div className="fixed inset-0 z-[120]" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute top-16 right-0 w-[350px] bg-white rounded-3xl shadow-2xl border border-luxury-dark/5 z-[130] overflow-hidden"
      >
        <div className="p-6 border-b border-luxury-dark/5 flex justify-between items-center bg-luxury-dark text-white">
          <h3 className="font-bold text-sm tracking-widest uppercase">Live Activity</h3>
          <button onClick={onClear} className="text-[10px] uppercase tracking-widest hover:text-luxury-gold transition-colors font-bold opacity-70">Clear All</button>
        </div>
        <div className="max-h-[400px] overflow-y-auto bg-luxury-cream/30">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-luxury-dark/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BellOff size={20} className="text-luxury-dark/20" />
              </div>
              <p className="text-xs text-luxury-dark/40 font-medium italic">No new activity detected.</p>
            </div>
          ) : (
            <div className="divide-y divide-luxury-dark/5">
              {notifications.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-white transition-colors cursor-default">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      notif.type === 'booking' ? 'bg-emerald-50 text-emerald-600' : 
                      notif.type === 'lead' ? 'bg-blue-50 text-blue-600' : 'bg-luxury-gold/10 text-luxury-gold'
                    }`}>
                      {notif.type === 'booking' ? <Calendar size={16} /> : 
                       notif.type === 'lead' ? <User size={16} /> : <Info size={16} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-luxury-dark leading-tight">{notif.title}</p>
                      <p className="text-[11px] text-luxury-dark/50 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[9px] text-luxury-dark/30 mt-2 font-bold uppercase tracking-wider">
                        {format(new Date(notif.createdAt), 'HH:mm • MMM dd')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

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
  useEscapeKey(onClose, isOpen);
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
  useEscapeKey(onClose, isOpen);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not authorized for Google Login. Please add it to "Authorized domains" in the Firebase Console.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login popup was closed. Please follow these steps:\n1. Ensure you allow popups for this site.\n2. Check if your browser blocks "Third-party cookies" (common in Incognito/Safari).\n3. Disable any ad-blockers for this session.\n4. If using a custom domain, ensure your Auth configuration is complete.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error: This might be due to a strict firewall or ad-blocker blocking Firebase services. Try disabling your ad-blocker.');
      } else if (err.message?.includes('redirect_uri_mismatch')) {
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked! Please allow popups for this site and try again.');
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
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="font-bold">Login Problem</span>
                  </div>
                  <p className="mb-3 opacity-80 whitespace-pre-line">{error}</p>
                  <button 
                    onClick={() => clearAppCache(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:text-luxury-dark transition-colors underline"
                  >
                    Clear Data & Refresh App
                  </button>
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
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-luxury-dark/5 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20 hover:text-luxury-dark/40 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
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

                {isForgotPassword && (
                  <p className="mt-4 text-[10px] text-center text-luxury-dark/40 italic">
                    Note: If you are an agent and haven't created an account yet, please choose "Sign Up" instead of resetting your password.
                  </p>
                )}

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

const UserManagement = ({ 
  users, 
  onUpdateRole, 
  onUpdatePermissions,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  showToast,
  currentUserEmail
}: { 
  users: any[], 
  onUpdateRole: (userId: string, role: string) => Promise<void>,
  onUpdatePermissions: (userId: string, permissions: any) => Promise<void>,
  onUpdateUser: (userId: string, data: any) => Promise<void>,
  onDeleteUser: (userId: string) => Promise<void>,
  onAddUser: (email: string, name: string) => Promise<void>,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  currentUserEmail?: string | null
}) => {
  const [editingPermissions, setEditingPermissions] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '' });
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const permissionList = [
    { id: 'addBookings', label: 'Add Bookings' },
    { id: 'viewBookings', label: 'View Bookings' },
    { id: 'editBookings', label: 'Edit Bookings' },
    { id: 'deleteBookings', label: 'Delete Bookings' },
    { id: 'addLeads', label: 'Add Leads' },
    { id: 'viewLeads', label: 'View Leads' },
    { id: 'editLeads', label: 'Edit Leads (Status, Tags, Remarks)' },
    { id: 'deleteLeads', label: 'Delete Leads' },
    { id: 'leadsSettings', label: 'Leads Settings (Export, Sync, etc)' },
    { id: 'viewFinance', label: 'View Finance' },
    { id: 'addBlogs', label: 'Add Blogs' },
    { id: 'viewBlogs', label: 'View Blogs' },
    { id: 'editBlogs', label: 'Edit Blogs' },
    { id: 'deleteBlogs', label: 'Delete Blogs' },
    { id: 'addSettings', label: 'Add Settings' },
    { id: 'viewSettings', label: 'View Settings' },
    { id: 'editSettings', label: 'Edit Settings' },
    { id: 'deleteSettings', label: 'Delete Settings' }
  ];

  const permissionMatrix = [
    { module: 'Bookings', add: 'addBookings', view: 'viewBookings', edit: 'editBookings', delete: 'deleteBookings', setting: null },
    { module: 'Leads', add: 'addLeads', view: 'viewLeads', edit: 'editLeads', delete: 'deleteLeads', setting: 'leadsSettings' },
    { module: 'Finance', add: null, view: 'viewFinance', edit: null, delete: null, setting: null },
    { module: 'Blogs', add: 'addBlogs', view: 'viewBlogs', edit: 'editBlogs', delete: 'deleteBlogs', setting: null },
    { module: 'Settings', add: 'addSettings', view: 'viewSettings', edit: 'editSettings', delete: 'deleteSettings', setting: null },
  ];

  const handleTogglePermission = (id: string) => {
    if (!editingPermissions) return;
    setEditingPermissions({
      ...editingPermissions,
      permissions: {
        ...(editingPermissions.permissions || {}),
        [id]: !editingPermissions.permissions?.[id]
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!editingPermissions) return;
    try {
      await onUpdatePermissions(editingPermissions.id, editingPermissions.permissions);
      showToast('Permissions updated successfully', 'success');
      setEditingPermissions(null);
    } catch (error) {
      console.error(error);
      showToast('Failed to update permissions', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-luxury-dark/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-luxury-dark/5 flex justify-between items-center bg-[#FAFAFA]">
          <div>
            <h3 className="text-2xl font-serif font-bold text-luxury-dark">User Management</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Manage agent accounts and permissions</p>
          </div>
          <div className="flex gap-4">
            <div className="hidden sm:block px-4 py-2 bg-luxury-gold/10 rounded-xl border border-luxury-gold/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold">Total Users: {users.length}</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-luxury-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10"
            >
              <Plus size={14} />
              Add Agent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-luxury-dark/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-dark/40">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-dark/40">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-dark/40">Permissions</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-dark/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-luxury-dark/5 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} className="text-luxury-dark/20" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-luxury-dark">{user.displayName || 'Anonymous User'}</p>
                        <p className="text-xs text-luxury-dark/40">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={user.role || 'client'}
                      onChange={(e) => onUpdateRole(user.id, e.target.value)}
                      disabled={(user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) && currentUserEmail !== 'anujkumarmittal@gmail.com'}
                      className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl outline-none transition-all cursor-pointer ${
                        user.role === 'admin' ? 'bg-luxury-dark text-white' :
                        user.role === 'agent' ? 'bg-luxury-gold text-luxury-dark' :
                        'bg-luxury-dark/5 text-luxury-dark/40'
                      }`}
                    >
                      <option value="client">Client</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    {user.role === 'admin' ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F9D58] bg-[#0F9D58]/10 px-3 py-1 rounded-lg">Full Access</span>
                    ) : user.role === 'agent' ? (
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {user.permissions && Object.entries(user.permissions).filter(([k, v]) => v && permissionList.some(p => p.id === k)).map(([k, _]) => (
                          <span key={k} className="px-2 py-0.5 bg-luxury-dark/5 text-luxury-dark/60 rounded text-[9px] font-bold uppercase tracking-tight">
                            {permissionList.find(p => p.id === k)?.label || k}
                          </span>
                        ))}
                        {(!user.permissions || Object.values(user.permissions).every(v => !v)) && (
                          <span className="text-[10px] italic text-luxury-dark/20">No specific permissions set</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-luxury-dark/20">Read only access</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-luxury-dark/40 hover:text-luxury-dark hover:bg-luxury-dark/5 rounded-xl transition-all"
                        title="Edit User Profile"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.role === 'agent' && (
                        <button 
                          onClick={() => setEditingPermissions(user)}
                          className="p-2 text-luxury-gold hover:bg-luxury-gold/10 rounded-xl transition-all"
                          title="Edit Permissions"
                        >
                          <Settings size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setDeletingUser(user)}
                        disabled={(user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) && currentUserEmail !== 'anujkumarmittal@gmail.com'}
                        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Edit User</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Update basic information</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-luxury-dark/5 text-luxury-dark/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                  className="w-full bg-luxury-dark/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none text-sm font-medium transition-all"
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-luxury-dark/5 border-none rounded-2xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none text-sm font-medium transition-all"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setEditingUser(null)}
                className="py-4 border border-luxury-dark/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-luxury-dark/40 hover:bg-luxury-dark/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setUpdating(true);
                  await onUpdateUser(editingUser.id, { 
                    displayName: editingUser.displayName, 
                    email: editingUser.email 
                  });
                  setUpdating(false);
                  setEditingUser(null);
                }}
                disabled={updating}
                className="py-4 bg-luxury-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-2">Delete User?</h3>
            <p className="text-sm text-luxury-dark/40 mb-8 px-4">
              Are you sure you want to delete <span className="font-bold text-luxury-dark">{deletingUser.displayName || deletingUser.email}</span>? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeletingUser(null)}
                className="py-4 border border-luxury-dark/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-luxury-dark/40 hover:bg-luxury-dark/5 transition-all"
              >
                No, Keep
              </button>
              <button 
                onClick={async () => {
                  setUpdating(true);
                  await onDeleteUser(deletingUser.id);
                  setUpdating(false);
                  setDeletingUser(null);
                }}
                disabled={updating}
                className="py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 disabled:opacity-50"
              >
                {updating ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingPermissions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Agent Permissions</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Configure access for {editingPermissions.displayName}</p>
              </div>
              <button 
                onClick={() => setEditingPermissions(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-luxury-dark/5 text-luxury-dark/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 overflow-y-auto flex-1">
              <div className="min-w-[600px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-luxury-dark/10">
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest bg-luxury-dark/5 rounded-tl-xl">Name</th>
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest text-center bg-luxury-dark/5">Add</th>
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest text-center bg-luxury-dark/5">View</th>
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest text-center bg-luxury-dark/5">Edit</th>
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest text-center bg-luxury-dark/5">Delete</th>
                      <th className="py-4 px-4 text-xs font-bold text-luxury-dark uppercase tracking-widest text-center bg-luxury-dark/5 rounded-tr-xl">Setting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionMatrix.map((row, idx) => (
                      <tr key={row.module} className={idx % 2 === 0 ? 'bg-white' : 'bg-luxury-dark/[0.02]'}>
                        <td className="py-4 px-4 text-sm font-bold text-luxury-dark/80">{row.module}</td>
                        <td className="py-4 px-4 text-center">
                          {row.add && (
                            <input
                              type="checkbox"
                              checked={editingPermissions.permissions?.[row.add] || false}
                              onChange={() => handleTogglePermission(row.add)}
                              className="w-5 h-5 rounded border-luxury-dark/20 text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {row.view && (
                            <input
                              type="checkbox"
                              checked={editingPermissions.permissions?.[row.view] || false}
                              onChange={() => handleTogglePermission(row.view)}
                              className="w-5 h-5 rounded border-luxury-dark/20 text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {row.edit && (
                            <input
                              type="checkbox"
                              checked={editingPermissions.permissions?.[row.edit] || false}
                              onChange={() => handleTogglePermission(row.edit)}
                              className="w-5 h-5 rounded border-luxury-dark/20 text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {row.delete && (
                            <input
                              type="checkbox"
                              checked={editingPermissions.permissions?.[row.delete] || false}
                              onChange={() => handleTogglePermission(row.delete)}
                              className="w-5 h-5 rounded border-luxury-dark/20 text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {row.setting && (
                            <input
                              type="checkbox"
                              checked={editingPermissions.permissions?.[row.setting] || false}
                              onChange={() => handleTogglePermission(row.setting)}
                              className="w-5 h-5 rounded border-luxury-dark/20 text-luxury-gold focus:ring-luxury-gold cursor-pointer"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0 mt-4">
              <button 
                onClick={() => setEditingPermissions(null)}
                className="py-4 border border-luxury-dark/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-luxury-dark/40 hover:bg-luxury-dark/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePermissions}
                className="py-4 bg-luxury-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Add New Agent</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Authorize a new team member</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-luxury-dark/5 text-luxury-dark/40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  className="w-full px-6 py-4 bg-luxury-dark/5 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-luxury-gold outline-none transition-all placeholder:text-luxury-dark/20 text-luxury-dark"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-4">Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="agent@example.com"
                  className="w-full px-6 py-4 bg-luxury-dark/5 border-none rounded-2xl text-xs font-medium focus:ring-2 focus:ring-luxury-gold outline-none transition-all placeholder:text-luxury-dark/20 text-luxury-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="py-4 border border-luxury-dark/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-luxury-dark/40 hover:bg-luxury-dark/5 transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={adding || !newUser.email || !newUser.name}
                onClick={async () => {
                  setAdding(true);
                  try {
                    await onAddUser(newUser.email, newUser.name);
                    setShowAddModal(false);
                    setNewUser({ email: '', name: '' });
                  } catch (err) {
                    // Toast is handled by onAddUser in App.tsx
                  } finally {
                    setAdding(false);
                  }
                }}
                className="py-4 bg-luxury-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg shadow-luxury-dark/10 disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Agent'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const CalendarSync = ({ showToast, canEditSettingsAdmin }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, canEditSettingsAdmin?: boolean }) => {
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
      const response = await fetch(BACKEND_URL + '/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      if (!response.ok) {
        throw new Error(`Server Sync failed with status ${response.status}`);
      }

      const result = await response.json();
      const allExternalEvents = result.events || [];

      if (allExternalEvents.length > 0 || urls.length > 0) {
        const batch = writeBatch(db);
        const blockedSnapshot = await getDocs(query(collection(db, 'blocked_dates'), where('type', '==', 'external')));
        blockedSnapshot.forEach(doc => batch.delete(doc.ref));
        
        allExternalEvents.forEach((event: any) => {
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
        showToast(`Sync completed! ${allExternalEvents.length} external events imported.`, 'success');
      } else {
        showToast('Sync completed! No new events found.', 'info');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      showToast(`Sync failed: ${error.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="py-24 text-center"><p className="text-luxury-dark/40 italic">Loading settings...</p></div>;

  const exportUrl = `${window.location.origin}/api/calendar/export.ics`;

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
            value={exportUrl}
            className="flex-1 px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl text-xs font-mono text-luxury-dark/60"
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(exportUrl);
              showToast('Export URL copied!', 'success');
            }}
            className="px-6 py-3 bg-luxury-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all"
          >
            Copy URL
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-luxury-dark/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-luxury-dark">Cloudflare Worker Sync + Notifications</h4>
              <p className="text-[10px] text-luxury-dark/50 mt-1">Deploy this to handle calendar sync, email relay, and real-time alerts.</p>
            </div>
            <button 
               onClick={() => {
                  const code = `/** Unique Farmhouse Worker v3.0 **/
let controllers = new Set();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // 3. CORS PROXY ROUTE
    if (url.pathname === '/api/proxy/fetch') {
      try {
        const bodyData = await request.json();
        const targetUrl = bodyData.url;
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/calendar, text/plain, */*"
          }
        });
        const text = await res.text();
        return new Response(text, {
           headers: { ...headers, "Content-Type": res.headers.get("Content-Type") || "text/plain" }
        });
      } catch(e) {
        return new Response("CORS Fetch failed", { status: 500, headers });
      }
    }
    
    // 4. CALENDAR EXPORT
    if (url.pathname.includes('/export.ics')) {
      const PROJECT_ID = "gen-lang-client-0648775775";
      const DATABASE_ID = "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e";
      const API_KEY = "AIzaSyBWtRZJYKaFyix-eY5Up2QQWoTB07y7zAk";
      try {
        const firestoreUrl = \`https://firestore.googleapis.com/v1/projects/\${PROJECT_ID}/databases/\${DATABASE_ID}/documents/public/calendar?key=\${API_KEY}\`;
        const res = await fetch(firestoreUrl);
        const data = await res.json();
        let icsContent = data.fields?.icsData?.stringValue;
        let lastUpdated = data.fields?.updatedAt?.stringValue || new Date().toUTCString();
        if (!icsContent) {
           icsContent = "BEGIN:VCALENDAR\\r\\nVERSION:2.0\\r\\nPRODID:-//Unique Farmhouse//Bookings//EN\\r\\nCALSCALE:GREGORIAN\\r\\nMETHOD:PUBLISH\\r\\nEND:VCALENDAR\\r\\n";
        }
        return new Response(icsContent, {
          headers: {
            ...headers,
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="calendar.ics"',
            "Last-Modified": lastUpdated
          }
        });
      } catch (e) {
        return new Response("Error", { status: 500, headers });
      }
    }
    
    return new Response("Not Found", { status: 404, headers });
  }
};`;
                  navigator.clipboard.writeText(code);
                  showToast('Updated Worker code copied!', 'success');
               }}
               className="px-4 py-2 bg-luxury-gold text-luxury-dark font-bold text-[10px] uppercase rounded-lg hover:bg-luxury-dark hover:text-white transition-colors"
            >
               Copy Advanced Worker Script
            </button>
          </div>
          <div className="p-3 bg-luxury-cream/50 rounded-xl border border-black/5">
            <p className="text-[10px] text-luxury-dark/60 leading-relaxed italic">
              <b>Notification Sync:</b> This script now supports Server-Sent Events (SSE). After deploying, ensure your Worker URL is saved in <b>Settings</b>.
            </p>
          </div>
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
                  disabled={!canEditSettingsAdmin}
                  className="px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50"
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
                  {canEditSettingsAdmin && (
                    <button 
                      onClick={() => handleRemoveUrl(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
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

const DataMigration = ({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [importing, setImporting] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});

  const exportData = async (collectionName: string) => {
    setExporting(collectionName);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${collectionName}_export_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`${collectionName} exported successfully`, 'success');
    } catch (error) {
      console.error(`Export failed for ${collectionName}:`, error);
      showToast(`Export failed for ${collectionName}`, 'error');
    } finally {
      setExporting(null);
    }
  };

  const importData = async (collectionName: string, file: File) => {
    setImporting(collectionName);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format: Expected an array of objects');
      }

      let batch = writeBatch(db);
      let count = 0;

      for (const item of data) {
        const { id, ...rest } = item;
        const docRef = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
        batch.set(docRef, rest, { merge: true });
        count++;
        
        if (count % 500 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }

      if (count % 500 !== 0) {
        await batch.commit();
      }

      showToast(`Successfully imported ${count} items into ${collectionName}`, 'success');
      await logAdminAction('import_data', collectionName, `Imported ${count} items`);
      setSelectedFiles(prev => ({ ...prev, [collectionName]: '' }));
    } catch (error: any) {
      console.error(`Import failed for ${collectionName}:`, error);
      showToast(`Import failed: ${error.message}`, 'error');
    } finally {
      setImporting(null);
    }
  };

  const collections = [
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={24} className="text-[#C8A45D]" /> },
    { id: 'blocked_dates', label: 'Blocked Dates', icon: <Lock size={24} className="text-[#C8A45D]" /> },
    { id: 'blogs', label: 'Blogs', icon: <BookOpen size={24} className="text-[#C8A45D]" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={24} className="text-[#C8A45D]" /> },
    { id: 'leads', label: 'Leads', icon: <Users size={24} className="text-[#C8A45D]" /> },
    { id: 'users', label: 'User Accounts', icon: <Shield size={24} className="text-[#C8A45D]" /> }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-2 mb-12">
        <h2 className="text-3xl font-serif font-bold text-luxury-dark">Data Migration Tool</h2>
        <p className="text-luxury-dark/60 text-lg">
          Import or export your application data as JSON files. This is useful for backups or moving data between environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((col) => (
          <div key={col.id} className="bg-white p-8 rounded-[2rem] border border-luxury-dark/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-8">
              {col.icon}
              <h3 className="text-2xl font-serif font-bold text-luxury-dark">{col.label} Data</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-luxury-dark/40 font-bold mb-4">
                  IMPORT {col.label.toUpperCase()} (JSON)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFiles(prev => ({ ...prev, [col.id]: file.name }));
                        importData(col.id, file);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                    id={`import-${col.id}`}
                  />
                  <label
                    htmlFor={`import-${col.id}`}
                    className={`px-8 py-3 bg-[#C8A45D] text-white rounded-full text-sm font-bold transition-all cursor-pointer hover:bg-luxury-dark shadow-sm ${importing === col.id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {importing === col.id ? 'Importing...' : 'Choose File'}
                  </label>
                  <span className="text-sm text-luxury-dark/60">
                    {selectedFiles[col.id] || 'No file chosen'}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-luxury-dark/5">
                <button
                  onClick={() => exportData(col.id)}
                  disabled={exporting === col.id}
                  className="w-full py-4 bg-white border border-luxury-dark/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  {exporting === col.id ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>EXPORT {col.label.toUpperCase()} TO JSON</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PasswordUpdateModal = ({ onClose, showToast }: { onClose: () => void; showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) => {
  useEscapeKey(onClose);
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
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

const SettingsSubNav = ({ activeFilter, setActiveFilter, setSettingsFilter, counts, userRole, userPermissions }: any) => {
  const tabs = [
    { id: 'settings', filter: 'general', label: 'General' },
    { id: 'reviews', filter: 'reviews', label: 'Reviews', count: counts.reviews, permission: 'viewSettings' },
    { id: 'gallery', filter: 'gallery', label: 'Gallery', count: counts.gallery, permission: 'viewSettings' },
    { id: 'logs', filter: 'logs', label: 'Logs', count: counts.logs, permission: 'viewSettings' },
    { id: 'notifications', filter: 'notifications', label: 'Notifications', count: counts.notifications, permission: 'viewSettings' },
    { id: 'sync', filter: 'sync', label: 'Calendar Sync', labelShort: 'iCal', permission: 'leadsSettings' },
    // Only show User Management for Admins
    ...(userRole === 'admin' ? [{ id: 'users', filter: 'users', label: 'User Management', labelShort: 'Users' }] : []),
    { id: 'migration', filter: 'migration', label: 'Import/Export', labelShort: 'Tool', permission: 'leadsSettings' },
    { id: 'coupons', filter: 'coupons', label: 'Discount Coupons', labelShort: 'Coupons', permission: 'editSettings' }
  ];

  const filteredTabs = tabs.filter(tab => {
    if (userRole === 'admin') return true;
    if (userRole === 'agent') {
      if (!tab.permission) return true;
      return userPermissions?.[tab.permission] === true;
    }
    return false;
  });

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
      {filteredTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveFilter(tab.id as any);
            setSettingsFilter(tab.filter as any);
          }}
          className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeFilter === tab.id 
              ? 'bg-white text-luxury-dark shadow-sm' 
              : 'text-luxury-dark/40 hover:text-luxury-dark'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-2 opacity-50">({tab.count})</span>}
          {!tab.count && tab.labelShort && <span className="ml-2 opacity-50">({tab.labelShort})</span>}
        </button>
      ))}
    </div>
  );
};

const LeadDashboard = ({ leads, showToast, userRole, userPermissions }: { 
  leads: any[], 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void, 
  userRole: string | null,
  userPermissions: any 
}) => {
  const [filter, setFilter] = useState('new');
  const [selectedTag, setSelectedTag] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const syncAttempted = useRef(false);
  
  // Permission helpers
  const canDelete = userRole === 'admin' || (userRole === 'agent' && userPermissions?.deleteLeads);
  const canExport = userRole === 'admin' || (userRole === 'agent' && userPermissions?.leadsSettings);
  const canAdd = userRole === 'admin' || (userRole === 'agent' && userPermissions?.addLeads);
  const canEdit = userRole === 'admin' || (userRole === 'agent' && userPermissions?.editLeads);
  const canManageUsers = userRole === 'admin'; // Only full admins manage users
  const canEditSettings = userRole === 'admin' || (userRole === 'agent' && userPermissions?.leadsSettings);
  
  // Google Sheets Sync State
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [csvUrl, setCsvUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Meta Sync State
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [metaPageId, setMetaPageId] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [isMetaSyncing, setIsMetaSyncing] = useState(false);

  // Gmail State
  const [gmailModalOpen, setGmailModalOpen] = useState(false);
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');
  const [workerUrl, setWorkerUrl] = useState('');
  const [workerSecret, setWorkerSecret] = useState('');
  const [gmailSaving, setGmailSaving] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');

  // Load Gmail settings
  useEffect(() => {
    const loadGmailSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'gmail');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGmailUser(data.user || '');
          setGmailPass(data.pass || '');
          setWorkerUrl(data.workerUrl || '');
          setWorkerSecret(data.workerSecret || '');
          // Only update recipient if it's currently empty
          setTestEmailRecipient(prev => prev || data.user || '');
        }
      } catch (error) {
        console.error("Error loading Gmail settings:", error);
      }
    };
    loadGmailSettings();
  }, []);

  const handleSaveGmailSettings = async () => {
    if (!gmailUser || !gmailPass) {
      showToast('Please enter both Gmail address and App Password', 'error');
      return;
    }
    
    setGmailSaving(true);
    try {
      const u = gmailUser.trim();
      const p = gmailPass.trim();
      const w = workerUrl.trim();
      const s = workerSecret.trim();

      await setDoc(doc(db, 'settings', 'gmail'), {
        user: u,
        pass: p,
        workerUrl: w,
        workerSecret: s,
        updatedAt: serverTimestamp()
      });
      setGmailUser(u);
      setGmailPass(p);
      setWorkerUrl(w);
      setWorkerSecret(s);
      showToast('Gmail settings saved successfully', 'success');
    } catch (error: any) {
      console.error("Error saving Gmail settings:", error);
      showToast('Failed to save settings: ' + error.message, 'error');
    } finally {
      setGmailSaving(false);
    }
  };

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const handleTestGmailConnection = async () => {
    if (!gmailUser || !gmailPass) {
      showToast('Enter Gmail and Password first', 'error');
      return;
    }
    setIsTestingConnection(true);
    try {
      let response;
      let wUrl = workerUrl.trim();
      
      if (wUrl && !wUrl.startsWith('http')) {
        wUrl = 'https://' + wUrl;
      }
      
      if (wUrl) {
        // Direct browser fetch to Cloudflare Worker
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (workerSecret.trim()) {
          headers['X-Relay-Secret'] = workerSecret.trim();
          headers['Authorization'] = `Bearer ${workerSecret.trim()}`;
        }
        
        try {
          response = await fetch(wUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: testEmailRecipient || gmailUser, // Send to self
              subject: 'Unique Farmhouse - Relay Test',
              text: 'This is a test email sent directly from your browser via Cloudflare Worker relay.',
              html: '<p>This is a test email sent directly from your browser via <strong>Cloudflare Worker</strong> relay.</p>'
            })
          });
        } catch (fetchErr: any) {
          if (fetchErr.message === 'Failed to fetch') {
            throw new Error(`Failed to fetch from Worker. Verify your Worker URL (${wUrl}) is correct, public, and has CORS enabled.`);
          }
          throw fetchErr;
        }
      } else {
        // Fallback to Express backend (fails on Cloudflare Pages)
        try {
          response = await fetch(BACKEND_URL + '/api/communications/test-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user: gmailUser.trim(), 
              pass: gmailPass.trim(),
              workerUrl: wUrl,
              workerSecret: workerSecret.trim()
            })
          });
        } catch (fetchErr: any) {
          if (fetchErr.message === 'Failed to fetch') {
            throw new Error(`Failed to fetch from local API. Your network might be offline or the API server is unreachable.`);
          }
          throw fetchErr;
        }
      }

      let data: any = {};
      let text = '';
      try {
        text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (e: any) {
        if (response.status === 405 && !wUrl) {
           throw new Error(`Cloudflare Pages Error (405). You deployed this app to a static host which doesn't support the Express backend. You MUST use the Cloudflare Worker Relay instead of direct SMTP!`);
        }
        if (response.status === 401) {
            if (text.includes('nginx') || text.includes('ais-dev') || text.includes('ais-pre')) {
              throw new Error(`Relay URL error (Local Proxy 401). You provided this app's URL instead of your Cloudflare Worker URL. Ensure the URL is correctly formatted and is a public workers.dev URL.`);
            } else if (text.toLowerCase().includes('<html')) {
              throw new Error(`Relay 401 Error: The URL returned an HTML page instead of a JSON response. Ensure you copied the exact public worker URL and not a private URL protected by Cloudflare Access. Snippet: ${text.substring(0, 80)}...`);
            }
        }
        throw new Error(`Server returned non-JSON response (Status ${response.status}). Snippet: ${text.substring(0, 80)}...`);
      }
      
      if (response.ok) {
        showToast('Success! Mail relay is working.', 'success');
      } else {
        if (data.debug) {
          console.warn('[Gmail Debug Info]:', data.debug);
        }
        let errorMsg = data.error || data.details || `HTTP ${response.status}: Connection failed`;
        if (response.status === 405 && !wUrl) {
           errorMsg = `Cloudflare Pages Error (405). Direct SMTP requires the Node backend. Use the Cloudflare Worker configuration above!`;
        } else if (response.status === 401 && data.error?.includes('Invalid Relay Secret')) {
           errorMsg = `Relay Secret Error (401): The secret was rejected by the Worker. Check the AUTH_SECRET in Cloudflare!`;
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('SMTP Test Error:', err);
      showToast(`Test failed: ${err.message}`, 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Quick Reply State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyType, setReplyType] = useState<'email' | 'whatsapp'>('email');
  const [replyTo, setReplyTo] = useState('');
  const [replyLeadId, setReplyLeadId] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLeadName, setReplyLeadName] = useState('');

  // Manual Lead State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualLead, setManualLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'direct',
    remarks: '',
    status: 'new',
    tag: '',
    budget: '',
    guests: '',
    city: '',
    bookingDate: '',
    bookingTime: ''
  });
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [viewType, setViewType] = useState<'kanban' | 'table'>('kanban');
  const [selectedLeadForExpand, setSelectedLeadForExpand] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openReplyModal = (type: 'email' | 'whatsapp', contact: string, name: string, leadId?: string) => {
    setReplyType(type);
    setReplyTo(contact);
    setReplyLeadName(name);
    if (leadId) setReplyLeadId(leadId);
    
    // We need to fetch the templates from Firestore directly here since we are outside the main component
    const fetchAndSetTemplate = async () => {
      let template = '';
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'replyTemplates'));
        const templates = docSnap.exists() ? docSnap.data() : null;
        
        if (type === 'email') {
          template = templates?.email || "Hi {name},\n\nThank you for reaching out to Unique Farm House Noida. We have received your inquiry and would love to help you plan your stay or event.\n\nPlease let us know your preferred dates and any specific requirements you might have.\n\nBest regards,\nUnique Farm House Team";
        } else {
          template = templates?.whatsapp || "Hi {name}! 🌟 Thank you for contacting Unique Farm House Noida. How can we help you plan your perfect stay or event today?";
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback
        if (type === 'email') {
          template = "Hi {name},\n\nThank you for reaching out to Unique Farm House Noida. We have received your inquiry and would love to help you plan your stay or event.\n\nPlease let us know your preferred dates and any specific requirements you might have.\n\nBest regards,\nUnique Farm House Team";
        } else {
          template = "Hi {name}! 🌟 Thank you for contacting Unique Farm House Noida. How can we help you plan your perfect stay or event today?";
        }
      }
      
      setReplyMessage(template.replace(/{name}/g, name));
      setReplyModalOpen(true);
    };
    
    fetchAndSetTemplate();
  };

  const handleManualLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLead.name) {
      showToast('Name is required', 'error');
      return;
    }
    
    setIsAddingLead(true);
    try {
      const sourceTag = manualLead.source.charAt(0).toUpperCase() + manualLead.source.slice(1);
      const leadData = {
        name: manualLead.name,
        email: manualLead.email,
        phone: manualLead.phone,
        source: manualLead.source,
        remarks: manualLead.remarks,
        status: manualLead.status,
        budget: manualLead.budget,
        guests: manualLead.guests,
        city: manualLead.city,
        bookingDate: manualLead.bookingDate || '',
        bookingTime: manualLead.bookingTime || '',
        createdAt: serverTimestamp(),
        tags: manualLead.tag ? [sourceTag, manualLead.tag] : [sourceTag]
      };
      
      await addDoc(collection(db, 'leads'), leadData);
      await logAdminAction('create_manual_lead', 'leads', `Created manual lead for ${manualLead.name} from ${manualLead.source}`);
      
      showToast('Manual lead added successfully', 'success');
      setManualModalOpen(false);
      setManualLead({
        name: '',
        email: '',
        phone: '',
        source: 'direct',
        remarks: '',
        status: 'new',
        tag: '',
        budget: '',
        guests: '',
        city: '',
        bookingDate: '',
        bookingTime: ''
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to add manual lead', 'error');
    } finally {
      setIsAddingLead(false);
    }
  };

  const handleExportLeads = () => {
    const dataToExport = leads.filter(l => filter === 'all' || l.status === filter);
    const csv = Papa.unparse(dataToExport.map(lead => ({
      Date: lead.createdAt ? formatDate(lead.createdAt) : '',
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone,
      Budget: lead.budget || '',
      Guests: lead.guests ? lead.guests.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()).replace('Then', 'Than') : '',
      City: lead.city || '',
      'Expected Date': lead.bookingDate || '',
      'Expected Time': lead.bookingTime || '',
      Source: lead.source || (lead.metaLeadId ? 'Facebook/Meta' : 'Website'),
      Tags: (lead.tags || []).join(', '),
      Remarks: lead.remarks,
      Status: lead.status
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads exported successfully', 'success');
  };

  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleSendReply = async () => {
    if (replyType === 'email') {
      if (!replyTo || !replyTo.includes('@')) {
        showToast('Invalid recipient email address', 'error');
        return;
      }

      setIsSendingReply(true);
      try {
        const response = await fetch(BACKEND_URL + '/api/communications/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: replyTo,
            subject: 'Re: Your inquiry at Unique Farm House Noida',
            text: replyMessage,
            config: {
              user: gmailUser,
              pass: gmailPass
            },
            html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <p>Dear ${replyLeadName},</p>
                    <p>${replyMessage.replace(/\n/g, '<br>')}</p>
                    <br>
                    <p>Regards,<br><strong>Unique Farm House</strong></p>
                  </div>`
          }),
        });

        if (!response.ok) {
          let errorData: any = {};
          try {
            const errText = await response.text();
            errorData = JSON.parse(errText);
          } catch (e) {
            errorData = { error: `Server error (${response.status})` };
          }
          let msg = errorData.error || `Error (${response.status})`;
          if (msg.includes('534-5.7.9') || (errorData.details && errorData.details.toLowerCase().includes('application-specific password required'))) {
            msg = "CRITICAL: You are using your regular Gmail password. Google requires a 16-character 'App Password'. Please check settings.";
          }
          throw new Error(msg);
        }

        if (replyLeadId) {
          await updateDoc(doc(db, 'leads', replyLeadId), { emailSent: true });
        }
        showToast('Email sent via Gmail!', 'success');
        setReplyModalOpen(false);
      } catch (error) {
        console.error('Gmail Send Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Show the actual error so user knows what to fix
        showToast(`Send Failed: ${errorMessage}`, 'error');
        
        // Only fallback if specifically a config issue or user wants to
        // For now, let's keep the fallback but make it explicit
        if (confirm(`Gmail API failed: ${errorMessage}\n\nWould you like to open your local email app instead?`)) {
          const subject = encodeURIComponent('Re: Your inquiry at Unique Farm House Noida');
          const body = encodeURIComponent(replyMessage);
          window.location.href = `mailto:${replyTo}?subject=${subject}&body=${body}`;
          setReplyModalOpen(false);
        }
      } finally {
        setIsSendingReply(false);
      }
    } else {
      const cleanPhone = replyTo.replace(/\D/g, '');
      const text = encodeURIComponent(replyMessage);
      
      if (replyLeadId) {
        updateDoc(doc(db, 'leads', replyLeadId), { whatsappSent: true }).catch(console.error);
      }
      
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
      setReplyModalOpen(false);
      showToast('Opening WhatsApp...', 'success');
    }
  };

  useEffect(() => {
    if (syncAttempted.current) return;
    syncAttempted.current = true;

    const fetchSyncSettings = async () => {
      try {
        // Try getting from leadSync document first
        let url = '';
        try {
          const docSnap = await getDoc(doc(db, 'settings', 'leadSync'));
          if (docSnap.exists()) {
            url = docSnap.data().csvUrl || '';
          }
        } catch (e) {
          console.warn("Failed to get leadSync from cache, trying server...", e);
          const serverSnap = await getDocFromServer(doc(db, 'settings', 'leadSync')).catch(() => null);
          if (serverSnap?.exists()) {
            url = serverSnap.data().csvUrl || '';
          }
        }

        if (url) {
          setCsvUrl(url);
          performSync(url, true);
        } else {
          // Auto-set the user's requested sheet as default if not found
          const defaultUrl = 'https://docs.google.com/spreadsheets/d/1LCCoy0A8YkI3wcKBeEYOxkDxEEkRtfnfXGOvuepFSC0/export?format=csv';
          setCsvUrl(defaultUrl);
          performSync(defaultUrl, true);
        }

        // Try getting metaSync
        try {
          const metaSnap = await getDoc(doc(db, 'settings', 'metaSync')).catch(() => 
            getDocFromServer(doc(db, 'settings', 'metaSync'))
          );
          
          if (metaSnap.exists()) {
            const data = metaSnap.data();
            setMetaPageId(data.pageId || '');
            setMetaToken(data.accessToken || '');
            if (data.pageId && data.accessToken) {
              performMetaSync(data.pageId, data.accessToken, true);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch meta settings", e);
        }
      } catch (err) {
        console.error("Critical error in fetchSyncSettings", err);
      }
    };
    fetchSyncSettings();
  }, []);

  const performMetaSync = async (pageId: string, token: string, silent: boolean = false) => {
    if (!pageId || !token) return;
    setIsMetaSyncing(true);
    try {
      // Fetch leads from Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/leads?access_token=${token}&fields=created_time,id,field_data`);
      
      let data;
      const textResponse = await response.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(`Invalid response from Meta API (Status: ${response.status})`);
      }

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch from Meta');
      }

      const fbLeads = data.data || [];
      let addedCount = 0;
      
      // Fetch existing leads directly from Firestore to ensure we have the latest data
      const leadsSnapshot = await getDocs(collection(db, 'leads'));
      const currentLeads = leadsSnapshot.docs.map(doc => doc.data());
      
      const existingMetaIds = new Set(currentLeads.map(l => l.metaLeadId).filter(Boolean));

      for (const fbLead of fbLeads) {
        const metaLeadId = fbLead.id;
        
        // Deduplicate using Meta Lead ID
        if (existingMetaIds.has(metaLeadId)) continue;

        let email = '';
        let phone = '';
        let name = 'Unknown';
        let guests = '';
        let bookingDate = '';
        let bookingTime = '';
        let city = '';

        // Parse field_data array
        if (Array.isArray(fbLead.field_data)) {
          for (const field of fbLead.field_data) {
            const fieldName = (field.name || '').toLowerCase();
            const val = field.values && field.values.length > 0 ? field.values[0] : '';
            
            if (fieldName.includes('email')) email = val;
            else if (fieldName.includes('phone')) phone = val;
            else if (fieldName.includes('name')) name = val;
            else if (fieldName.includes('guest')) guests = val;
            else if (fieldName.includes('date')) bookingDate = val;
            else if (fieldName.includes('time')) bookingTime = val;
            else if (fieldName.includes('city') || fieldName.includes('location')) city = val;
          }
        }

        await addDoc(collection(db, 'leads'), {
          name,
          email,
          phone,
          guests,
          bookingDate,
          bookingTime,
          city,
          status: 'new',
          createdAt: fbLead.created_time ? new Date(fbLead.created_time) : serverTimestamp(),
          source: 'meta',
          metaLeadId
        });
        existingMetaIds.add(metaLeadId);
        addedCount++;
      }

      setIsMetaSyncing(false);
      if (!silent || addedCount > 0) {
        showToast(`Synced ${addedCount} new leads from Meta`, 'success');
      }
      if (!silent) setMetaModalOpen(false);
    } catch (err: any) {
      console.error("Meta Sync Error:", err);
      if (!silent) showToast(err.message || 'Failed to sync with Meta', 'error');
      setIsMetaSyncing(false);
    }
  };

  const handleSaveMetaSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'metaSync'), { pageId: metaPageId, accessToken: metaToken });
      showToast('Meta sync settings saved', 'success');
      performMetaSync(metaPageId, metaToken, false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save Meta settings', 'error');
    }
  };

  const performSync = async (url: string, silent: boolean = false) => {
    if (!url) return;
    setIsSyncing(true);
    try {
      let fetchUrl = url.trim();
      
      // Auto-convert standard Google Sheets URLs to CSV export URLs
      if (fetchUrl.includes('docs.google.com/spreadsheets')) {
        let sheetId = "";
        let isPublished = false;

        // Pattern 1: Published to web links (/d/e/...)
        if (fetchUrl.includes("/d/e/")) {
          const eMatch = fetchUrl.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
          if (eMatch && eMatch[1]) {
            sheetId = eMatch[1];
            isPublished = true;
          }
        } 
        // Pattern 2: Standard sharing/editor links (/d/...)
        else if (fetchUrl.includes("/d/")) {
          const dMatch = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (dMatch && dMatch[1]) {
            sheetId = dMatch[1];
          }
        }

        if (sheetId) {
          // If it's not already a CSV link, convert it to the clean export format
          const hasCsvParam = fetchUrl.includes('format=csv') || fetchUrl.includes('output=csv');
          
          if (!hasCsvParam) {
            if (isPublished) {
              fetchUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
            } else {
              fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            }
          }
        }
        console.log(`[Sync] Requesting URL: ${fetchUrl}`);
      }

      let response;
      try {
        console.log(`[Sync] Attempting direct fetch: ${fetchUrl}`);
        // Try direct fetch first (works for most Google Sheets CSV exports due to CORS)
        response = await fetch(fetchUrl);
      } catch (directErr) {
        console.warn("[Sync] Direct fetch failed (likely CORS), falling back to proxy:", directErr);
        // Fallback to proxy if direct fetch fails (e.g. due to CORS or network issues)
        response = await fetch(BACKEND_URL + '/api/proxy/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: fetchUrl })
        });
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMsg = errorJson.error || errorJson.message || errorMsg;
          } else {
            const errorText = await response.text();
            if (errorText.length > 200) {
              errorMsg = errorText.substring(0, 200) + '...';
            } else {
              errorMsg = errorText || errorMsg;
            }
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        console.error(`Sync Error (${response.status}):`, errorMsg);
        throw new Error(`Failed to fetch Sheet (Status ${response.status}). Ensure it is "Published to web" as CSV.`);
      }
      const csvText = await response.text();
      
      if (csvText.trim().toLowerCase().startsWith('<!doctype') || csvText.trim().toLowerCase().startsWith('<html')) {
        throw new Error('Invalid Link');
      }
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: async (results) => {
          const newLeads = results.data as any[];
          let addedCount = 0;
          
          if (newLeads.length === 0) {
            if (!silent) showToast('No data found in the CSV', 'info');
            setIsSyncing(false);
            return;
          }
          
          // Fetch existing leads directly from Firestore to ensure we have the latest data
          const leadsSnapshot = await getDocs(collection(db, 'leads'));
          const currentLeads = leadsSnapshot.docs.map(doc => doc.data());
          
          const existingEmails = new Set(currentLeads.map(l => l.email).filter(Boolean));
          const existingPhones = new Set(currentLeads.map(l => l.phone).filter(Boolean));
          
          for (const row of newLeads) {
            const email = String(row.email || row['email address'] || '').trim();
            const phone = String(row.phone_number || row['phone number'] || row.phone || row['contact number'] || '').trim();
            const name = String(row.full_name || row['full name'] || row.form_name || row['form name'] || row.name || 'Unknown').trim();
            const budget = String(row.budget || row.est_budget || row['est budget'] || row.max_budget || row['max budget'] || '').trim();
            const guests = String(row.guests || row.no_of_guests || row['no. of guests'] || row['no._of_guests'] || row['number of guests'] || row.number_of_guests || row.guest_count || row['guest count'] || '').trim();
            const city = String(row.city || row.location || row.area || '').trim();
            const bookingDate = String(row.booking_date || row['booking date'] || row.event_date || row['event date'] || row.date || '').trim();
            const bookingTime = String(row.booking_time || row['booking time'] || row.event_time || row['event time'] || row.time || '').trim();
            const createdTimeStr = String(row.created_time || row['created time'] || row.timestamp || '').trim();
            
            let createdAt: any = serverTimestamp();
            if (createdTimeStr) {
              const parsedDate = new Date(createdTimeStr);
              if (!isNaN(parsedDate.getTime())) {
                createdAt = parsedDate;
              }
            }
            
            // Basic deduplication: check if lead with same email or phone already exists
            const emailExists = email && existingEmails.has(email);
            const phoneExists = phone && existingPhones.has(phone);
            
            if (!emailExists && !phoneExists && (email || phone || name !== 'Unknown')) {
              await addDoc(collection(db, 'leads'), {
                name,
                email,
                phone,
                budget,
                guests,
                city,
                bookingDate,
                bookingTime,
                status: 'new',
                createdAt,
                source: 'google_sheets'
              });
              if (email) existingEmails.add(email);
              if (phone) existingPhones.add(phone);
              addedCount++;
            }
          }
          
          setIsSyncing(false);
          if (!silent || addedCount > 0) {
            showToast(`Synced ${addedCount} new leads from Google Sheets`, 'success');
          }
          if (!silent) setSyncModalOpen(false);
        },
        error: (error: any) => {
          console.error("CSV Parse Error:", error);
          if (!silent) showToast('Failed to parse CSV', 'error');
          setIsSyncing(false);
        }
      });
    } catch (err: any) {
      console.error("Sync Error:", err);
      if (!silent) showToast(err.message || 'Failed to fetch Google Sheet', 'error');
      setIsSyncing(false);
    }
  };

  const handleSaveSyncSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'leadSync'), { csvUrl });
      showToast('Sync settings saved', 'success');
      performSync(csvUrl, false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save sync settings', 'error');
    }
  };

  // Auto-sync Google Sheets leads every 30 minutes
  useEffect(() => {
    if (!csvUrl) return;
    const intervalId = setInterval(() => {
      performSync(csvUrl, true);
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvUrl]);

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { 
        status,
        statusUpdatedAt: serverTimestamp()
      });
      showToast('Lead status updated', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  // handleUpdateStatus is already defined and server handles stale leads now.

  const handleUpdateRemarks = async (leadId: string, remarks: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { remarks });
      showToast('Remarks updated', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update remarks', 'error');
    }
  };

  const handleUpdateRelevancy = async (leadId: string, value: string, currentTags: string[]) => {
    const relevancyOptions = ['Relevent', 'Non Relevent'];
    // Keep other tags (like source tags) and only update the relevancy one
    const otherTags = (currentTags || []).filter(t => !relevancyOptions.includes(t));
    const newTags = value ? [...otherTags, value] : otherTags;

    try {
      await updateDoc(doc(db, 'leads', leadId), { tags: newTags });
      showToast(value ? `Lead marked as ${value}` : 'Tag cleared', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update tag', 'error');
    }
  };

  const handleAddCustomTag = async (leadId: string, tag: string, currentTags: string[]) => {
    if (!tag.trim()) return;
    const cleanTag = tag.trim();
    if ((currentTags || []).includes(cleanTag)) {
      showToast('Tag already exists', 'info');
      return;
    }
    
    const newTags = [...(currentTags || []), cleanTag];
    try {
      await updateDoc(doc(db, 'leads', leadId), { tags: newTags });
      showToast('Tag added', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add tag', 'error');
    }
  };

  const handleRemoveTag = async (leadId: string, tagToRemove: string, currentTags: string[]) => {
    const newTags = (currentTags || []).filter(t => t !== tagToRemove);
    try {
      await updateDoc(doc(db, 'leads', leadId), { tags: newTags });
      showToast('Tag removed', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove tag', 'error');
    }
  };

  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({});

  const handleAddTag = async (leadId: string, currentTags: string[] = []) => {
    const tag = tagInput[leadId]?.trim();
    if (!tag) return;
    
    if (currentTags.includes(tag)) {
      showToast('Tag already exists', 'info');
      return;
    }

    try {
      await updateDoc(doc(db, 'leads', leadId), {
        tags: [...currentTags, tag]
      });
      setTagInput(prev => ({ ...prev, [leadId]: '' }));
      showToast('Tag added', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add tag', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await deleteDoc(doc(db, 'leads', leadToDelete));
      showToast('Lead deleted', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete lead', 'error');
    } finally {
      setLeadToDelete(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${hours}:${minutes}`;
  };

  const uniqueTags = Array.from(new Set(leads.flatMap(l => (l.tags || []).filter((t: string) => !['Relevent', 'Non Relevent'].includes(t))))).sort();

  const filteredLeads = leads
    .filter(l => {
      const matchesStatus = filter === 'all' || l.status === filter;
      const matchesScore = (filter === 'hot' && l.score === 'HOT') || (filter === 'warm' && l.score === 'WARM');
      return matchesStatus || matchesScore;
    })
    .filter(l => !selectedTag || (l.tags || []).includes(selectedTag))
    .filter(l => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        l.name?.toLowerCase().includes(term) ||
        l.phone?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.city?.toLowerCase().includes(term) ||
        l.remarks?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

  const getWhatsAppLink = (lead: any) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const message = `New Lead 🚨\nName: ${lead.name}\nDate: ${lead.bookingDate || 'N/A'}\nGuests: ${lead.guests || 'N/A'}\n\nHi ${lead.name}, thank you for your inquiry at Unique Farm House Noida! How can we help you today?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-8 relative font-modern">
      <ElegantLeadsDashboard 
        leads={leads}
        showToast={showToast}
        userRole={userRole}
        userPermissions={userPermissions}
        onAddLead={() => setManualModalOpen(true)}
        onExport={handleExportLeads}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenMetaSync={() => setMetaModalOpen(true)}
        onOpenGmailSettings={() => setGmailModalOpen(true)}
        onDeleteLead={(id) => setLeadToDelete(id)}
        onReply={openReplyModal}
      />

      {leadToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-serif mb-4">Delete Lead?</h3>
            <p className="text-luxury-dark/60 mb-8">This action cannot be undone. Are you sure you want to permanently delete this lead?</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-4 border border-luxury-dark/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-dark/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {gmailModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] max-w-xl w-full max-h-[95vh] overflow-hidden relative shadow-2xl flex flex-col mx-auto"
          >
            {/* Header */}
            <div className="p-5 sm:p-8 flex justify-between items-center border-b border-luxury-dark/5 bg-white shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="text-[#DB4437] w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-serif text-luxury-dark leading-tight">Gmail Connectivity</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${workerUrl ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {workerUrl ? 'Cloudflare Relay' : 'Direct SMTP'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setGmailModalOpen(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl hover:bg-luxury-dark/5 text-luxury-dark/40 transition-colors"
                id="close-gmail-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar bg-[#FDFDFD]">
              
              <div className="p-4 sm:p-6 bg-blue-50/40 border border-blue-100 rounded-[1.2rem] sm:rounded-[2rem] space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Cloud size={16} />
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-blue-700">Cloudflare Worker Required</h4>
                </div>
                <p className="text-[10px] sm:text-xs text-blue-800/70 font-medium leading-relaxed">
                  Most hosting providers block direct SMTP (Port 465). To send emails reliably, you <b>must</b> deploy a simple relay worker on Cloudflare. 
                  <br /><br />
                  <span className="text-red-600 bg-red-50 p-2 rounded-lg block border border-red-100 font-bold">
                    ⚠️ CRITICAL: Use your *.workers.dev URL. <br />
                    DO NOT use "ais-dev-ykn7bj..." as the Relay URL.
                  </span>
                </p>
                <button 
                  onClick={() => {
                    const code = `/** Cloudflare Relay to AI Studio Backend v2.0 **/
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        }
      });
    }

    // 1. Get Params from GET (URL) or POST (JSON body)
    let to, subject, body;
    const url = new URL(request.url);

    if (request.method === "GET") {
      to = url.searchParams.get("to");
      subject = url.searchParams.get("subject") || "No Subject";
      body = url.searchParams.get("body") || "No Content";
    } else if (request.method === "POST") {
      try {
        const bodyData = await request.json();
        to = bodyData.to;
        subject = bodyData.subject || "No Subject";
        body = bodyData.body || bodyData.html || bodyData.text || "No Content";
      } catch (e) {
        return new Response("Invalid JSON body", { status: 400 });
      }
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!to) {
      return new Response("Missing 'to' parameter", { status: 400 });
    }

    // 2. Setup AI Studio Backend URL and Secret
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
    
    // Ensure you add MY_SECRET_KEY to your Worker environment variables!
    const secretKey = env.MY_SECRET_KEY || "";

    // 3. Send Request to AI Studio Backend
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": secretKey
        },
        body: JSON.stringify({ to, subject, body })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        return new Response("Email failed ❌ - Backend returned non-JSON response (Status " + response.status + ")", { status: 502 });
      }

      if (response.ok && data.success) {
        return new Response("Email sent successfully ✅", { status: 200 });
      } else {
        return new Response("Email failed ❌ - " + (data.error || "Backend Error"), { status: response.status });
      }
    } catch (e) {
      return new Response("Email failed ❌ - Fetch to Backend Failed: " + e.message, { status: 500 });
    }
  }
};`;
                    navigator.clipboard.writeText(code);
                    showToast('Relay Code Copied! Paste this into Cloudflare Worker editor.', 'success');
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Copy Worker Code
                </button>
              </div>

              {/* Credentials Section */}
              <div className="p-4 sm:p-6 bg-white border border-luxury-dark/5 rounded-[1.2rem] sm:rounded-[2rem] shadow-sm space-y-5">
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="space-y-1.5 flex-1">
                        <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 ml-2">Gmail Address</label>
                        <input 
                          type="email" 
                          value={gmailUser}
                          onChange={(e) => setGmailUser(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full bg-[#FAFAFA] border border-luxury-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all"
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={handleTestGmailConnection}
                          disabled={isTestingConnection}
                          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-red-50 text-[#DB4437] rounded-xl hover:bg-[#DB4437] hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-red-100 shadow-sm shrink-0 active:scale-95"
                          id="test-gmail-sync"
                        >
                          {isTestingConnection ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Zap size={14} />
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-widest">Test Sync</span>
                        </button>
                      </div>
                    </div>
                      
                    <div className="space-y-1.5">
                      <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 ml-2">Google App Password</label>
                      <input 
                        type="password" 
                        value={gmailPass}
                        onChange={(e) => setGmailPass(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
                        className="w-full bg-[#FAFAFA] border border-luxury-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold transition-all font-mono"
                      />
                    </div>

                    <div className="pt-4 border-t border-luxury-dark/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                          <Cloud size={12} />
                          Worker Relay Settings
                        </h4>
                        {workerUrl && (
                          <button 
                            onClick={() => { setWorkerUrl(''); setWorkerSecret(''); }}
                            className="text-[8px] font-bold text-red-500 uppercase hover:underline"
                          >
                            Disable Relay
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-luxury-dark/60 ml-1">Worker URL</label>
                          <input 
                            type="url" 
                            value={workerUrl}
                            onChange={(e) => setWorkerUrl(e.target.value)}
                            placeholder="https://relays.dev..."
                            className={`w-full bg-[#FAFAFA] border rounded-xl px-3 py-3 text-[11px] outline-none transition-all font-mono ${
                              workerUrl.includes(window.location.hostname) 
                                ? 'border-red-500 ring-2 ring-red-100' 
                                : 'border-luxury-dark/10 focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400'
                            }`}
                          />
                          {workerUrl.includes(window.location.hostname) && (
                            <p className="text-[8px] text-red-600 font-bold uppercase tracking-wider px-1">
                              ⚠️ Error: This is the App's own URL. Provide the *.workers.dev URL.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-luxury-dark/60 ml-1">Relay Secret (AUTH_SECRET)</label>
                          <input 
                            type="password" 
                            value={workerSecret}
                            onChange={(e) => setWorkerSecret(e.target.value)}
                            placeholder="Token..."
                            className="w-full bg-[#FAFAFA] border border-luxury-dark/10 rounded-xl px-3 py-3 text-[11px] outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-mono"
                          />
                        </div>
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 font-medium leading-relaxed italic mt-3 px-1">
                        <b>Are you using a @gmail.com address?</b> You likely <b>do not</b> need a Cloudflare Worker relay. Leave the URLs blank above to connect directly via standard SMTP.
                        <br/><br/>
                        <b>Using a custom domain?</b> You can deploy a Cloudflare Worker with the code above. Add a Variable <code>AUTH_SECRET</code> to your Worker matching the field above.
                        <br/><br/>
                        <span className="text-red-500 font-bold">⚠️ MailChannels does NOT permit sending from @gmail.com addresses. If you have a @gmail.com address, clear out the Worker fields and try testing directly!</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Section - Compact */}
              <div className="p-4 sm:p-6 bg-blue-50/40 border border-blue-100/50 rounded-[1.2rem] sm:rounded-[2rem]">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-700 mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Setup Steps
                </h4>
                <div className="space-y-3">
                  {[
                    "Enable 2-Step Verification in Google Account.",
                    "Search for 'App Passwords' in Settings.",
                    "Select 'Other', name it 'Dashboard', and Copy Code.",
                    "Paste the 16-character code in App Password field above."
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center shrink-0 font-bold">{idx + 1}</span>
                      <p className="text-[10px] sm:text-xs text-luxury-dark/70 font-medium leading-tight pt-0.5">{step}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-white/60 border border-blue-100 rounded-xl flex items-center gap-3">
                    <Cloud className="text-blue-500 shrink-0" size={16} />
                    <p className="text-[9px] sm:text-[10px] text-blue-700 font-bold leading-tight">
                      Hosting error (405)? Deploy the Relay code provided by the AI assistant to your Cloudflare Worker.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 pt-2 pb-8 px-8 bg-white border-t border-luxury-dark/5">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleSaveGmailSettings}
                    disabled={gmailSaving}
                    className="py-4 bg-luxury-dark text-white rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    id="save-gmail-settings"
                  >
                    <Save size={16} />
                    {gmailSaving ? 'Saving...' : 'Sync Config'}
                  </button>

                  <button 
                    onClick={() => setGmailModalOpen(false)}
                    className="py-4 bg-white text-luxury-dark border border-luxury-dark/10 rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-luxury-dark/5 transition-all active:scale-95 shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {replyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif flex items-center gap-2">
                {replyType === 'email' ? <Mail className="text-blue-600" /> : <Phone className="text-green-600" />}
                Quick Reply to {replyLeadName}
              </h3>
              <button onClick={() => setReplyModalOpen(false)} className="text-luxury-dark/40 hover:text-luxury-dark">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">
                  {replyType === 'email' ? 'To Email' : 'To WhatsApp Number'}
                </label>
                <input
                  type="text"
                  value={replyTo}
                  disabled
                  className="w-full px-4 py-3 bg-luxury-dark/5 border border-luxury-dark/10 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">
                  Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-luxury-dark/10 rounded-xl text-sm focus:outline-none focus:border-luxury-gold resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setReplyModalOpen(false)}
                  className="flex-1 py-4 border border-luxury-dark/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-dark/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendReply}
                  disabled={isSendingReply}
                  className={`flex-1 py-4 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 ${
                    replyType === 'email' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSendingReply ? 'Sending...' : `Send via ${replyType === 'email' ? 'Email' : 'WhatsApp'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {syncModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif">Sync Google Sheets</h3>
              <button onClick={() => setSyncModalOpen(false)} className="text-luxury-dark/40 hover:text-luxury-dark">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-luxury-dark/5 p-4 rounded-xl text-sm text-luxury-dark/80 space-y-2">
                <p className="font-bold">How to setup auto-sync:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open your Google Sheet containing leads.</li>
                  <li>Go to <strong>File &gt; Share &gt; Publish to web</strong>.</li>
                  <li>Select the specific sheet and choose <strong>Comma-separated values (.csv)</strong>.</li>
                  <li>Click Publish and copy the generated link.</li>
                  <li>Paste the link below.</li>
                </ol>
                <p className="text-xs mt-2 italic opacity-80">
                  * Expected column headers: Name, Email, Phone, Message.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">
                  Published CSV Link
                </label>
                <input
                  type="url"
                  value={csvUrl}
                  onChange={(e) => setCsvUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                  className="w-full px-4 py-3 bg-white border border-luxury-dark/10 rounded-xl text-sm focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setSyncModalOpen(false)}
                  className="flex-1 py-4 border border-luxury-dark/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-dark/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSyncSettings}
                  disabled={isSyncing || !csvUrl}
                  className="flex-1 py-4 bg-luxury-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  {isSyncing ? 'Syncing...' : 'Save & Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {metaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-[#1877F2]">Sync Meta Leads</h3>
              <button onClick={() => setMetaModalOpen(false)} className="text-luxury-dark/40 hover:text-luxury-dark">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#1877F2]/5 p-4 rounded-xl text-sm text-luxury-dark/80 space-y-2">
                <p className="font-bold">How to setup Meta auto-sync:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to <strong>Meta for Developers</strong> and create an app.</li>
                  <li>Generate a <strong>Page Access Token</strong> with `leads_retrieval` permission.</li>
                  <li>Find your Facebook <strong>Page ID</strong>.</li>
                  <li>Paste both below.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    value={metaPageId}
                    onChange={(e) => setMetaPageId(e.target.value)}
                    placeholder="e.g. 101234567890"
                    className="w-full px-4 py-3 bg-white border border-luxury-dark/10 rounded-xl text-sm focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">
                    Page Access Token
                  </label>
                  <input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    placeholder="EAA..."
                    className="w-full px-4 py-3 bg-white border border-luxury-dark/10 rounded-xl text-sm focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setMetaModalOpen(false)}
                  className="flex-1 py-4 border border-luxury-dark/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-luxury-dark/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMetaSettings}
                  disabled={isMetaSyncing || !metaPageId || !metaToken}
                  className="flex-1 py-4 bg-[#1877F2] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#1877F2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isMetaSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                  {isMetaSyncing ? 'Syncing...' : 'Save & Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {manualModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setManualModalOpen(false)} 
              className="absolute top-8 right-8 text-luxury-dark/20 hover:text-luxury-dark transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h3 className="text-3xl font-serif font-bold text-luxury-dark mb-2">Add Manual Lead</h3>
              <p className="text-luxury-dark/60 text-sm">Enter details for leads received via Phone or WhatsApp.</p>
            </div>
            
            <form onSubmit={handleManualLeadSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={manualLead.name}
                    onChange={(e) => setManualLead({...manualLead, name: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={manualLead.phone}
                    onChange={(e) => setManualLead({...manualLead, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={manualLead.email}
                    onChange={(e) => setManualLead({...manualLead, email: e.target.value})}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">City / Location</label>
                  <input
                    type="text"
                    value={manualLead.city}
                    onChange={(e) => setManualLead({...manualLead, city: e.target.value})}
                    placeholder="e.g. Noida, Sector 150"
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Budget (Approx)</label>
                  <input
                    type="text"
                    value={manualLead.budget}
                    onChange={(e) => setManualLead({...manualLead, budget: e.target.value})}
                    placeholder="e.g. 50000"
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">No. of Guests</label>
                  <select
                    value={manualLead.guests}
                    onChange={(e) => setManualLead({...manualLead, guests: e.target.value})}
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all appearance-none"
                  >
                    <option value="">Select Guests</option>
                    <option value="Less than 10">Less than 10</option>
                    <option value="10 to 15">10 to 15</option>
                    <option value="15 to 20">15 to 20</option>
                    <option value="Above 20">Above 20</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Expected Booking Date</label>
                  <input
                    type="date"
                    value={manualLead.bookingDate}
                    onChange={(e) => setManualLead({...manualLead, bookingDate: e.target.value})}
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Expected Booking Time</label>
                  <input
                    type="time"
                    value={manualLead.bookingTime}
                    onChange={(e) => setManualLead({...manualLead, bookingTime: e.target.value})}
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Source</label>
                  <select
                    value={manualLead.source}
                    onChange={(e) => setManualLead({...manualLead, source: e.target.value})}
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all appearance-none"
                  >
                    <option value="direct">Direct Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="walkin">Walk-in</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Relevancy Tag</label>
                  <select
                    value={manualLead.tag}
                    onChange={(e) => setManualLead({...manualLead, tag: e.target.value})}
                    className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all appearance-none"
                  >
                    <option value="">No Tag</option>
                    <option value="Relevent">Relevent</option>
                    <option value="Non Relevent">Non Relevent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 ml-1">Remarks / Notes</label>
                <textarea
                  value={manualLead.remarks}
                  onChange={(e) => setManualLead({...manualLead, remarks: e.target.value})}
                  placeholder="Any specific requirements or notes..."
                  rows={3}
                  className="w-full px-5 py-4 bg-luxury-dark/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-4 bg-luxury-cream text-luxury-dark rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-dark hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isAddingLead}
                  className="flex-1 py-4 bg-luxury-dark text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-luxury-gold hover:text-luxury-dark transition-all duration-300 shadow-xl shadow-luxury-gold/10 disabled:opacity-50"
                >
                  {isAddingLead ? 'Adding...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {selectedLeadForExpand && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] sm:rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-8 pb-4 flex justify-between items-start border-b border-luxury-dark/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-serif font-bold text-luxury-dark">{selectedLeadForExpand.name}</h2>
                  {selectedLeadForExpand.score && (
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                      selectedLeadForExpand.score === 'HOT' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {selectedLeadForExpand.score === 'HOT' && '🔥 '}{selectedLeadForExpand.score} LEAD
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-luxury-dark/40">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-luxury-gold" />
                    Inquired: {formatDate(selectedLeadForExpand.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-luxury-gold" />
                    Source: <span className="uppercase font-bold text-luxury-dark/60">{selectedLeadForExpand.source}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLeadForExpand(null)}
                className="p-3 bg-luxury-dark/5 text-luxury-dark hover:bg-luxury-dark hover:text-white rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => openReplyModal('email', selectedLeadForExpand.email, selectedLeadForExpand.name, selectedLeadForExpand.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 ${selectedLeadForExpand.emailSent ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                >
                  <Mail size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">Send Email</span>
                  <span className="text-[9px] mt-1 opacity-60">{selectedLeadForExpand.email || 'No Email'}</span>
                </button>
                <button 
                  onClick={() => openReplyModal('whatsapp', selectedLeadForExpand.phone, selectedLeadForExpand.name, selectedLeadForExpand.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 ${selectedLeadForExpand.whatsappSent ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-600 hover:text-white'}`}
                >
                  <Phone size={24} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
                  <span className="text-[9px] mt-1 opacity-60">{selectedLeadForExpand.phone || 'No Phone'}</span>
                </button>
              </div>

              {/* Inquiry Details */}
              <div className="bg-luxury-cream p-8 rounded-[2.5rem] border border-luxury-gold/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-dark/20 mb-6 flex items-center gap-2">
                  <Target size={14} className="text-luxury-gold" />
                  Inquiry Specifications
                </h4>
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30">Budget</p>
                    <p className="text-lg font-bold text-luxury-dark flex items-center gap-2">
                      <IndianRupee size={16} className="text-emerald-500" />
                      {selectedLeadForExpand.budget || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30">Guests</p>
                    <p className="text-lg font-bold text-luxury-dark flex items-center gap-2">
                      <Users size={16} className="text-blue-500" />
                      {selectedLeadForExpand.guests?.replace(/_/g, ' ') || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30">Booking Date</p>
                    <p className="text-lg font-bold text-luxury-dark flex items-center gap-2">
                      <Calendar size={16} className="text-purple-500" />
                      {selectedLeadForExpand.bookingDate || 'N/A'} {selectedLeadForExpand.bookingTime && `@ ${selectedLeadForExpand.bookingTime}`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-luxury-dark/30">Location</p>
                    <p className="text-lg font-bold text-luxury-dark flex items-center gap-2">
                      <MapPin size={16} className="text-luxury-gold" />
                      {selectedLeadForExpand.city || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Intelligence & Remarks */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-dark/20 flex items-center gap-2">
                  <Sparkles size={14} className="text-luxury-gold" />
                  Lead Intelligence (AI Analysis)
                </h4>
                <div className="bg-white border-2 border-luxury-dark/5 p-6 rounded-[2rem] shadow-sm italic text-luxury-dark/70 text-sm leading-relaxed relative">
                   <div className="absolute top-0 right-8 -mt-2 bg-luxury-gold text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase">Active Analysis</div>
                   {selectedLeadForExpand.remarks || "No intelligence gathered for this lead yet. AI will update this based on cross-channel interactions."}
                </div>
              </div>

              {/* Categorization */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-dark/20 flex items-center gap-2">
                  <LayoutGrid size={14} className="text-luxury-gold" />
                  Tags & Categorization
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedLeadForExpand.tags || []).map((tag: string) => (
                    <span key={tag} className="px-4 py-1.5 bg-luxury-gold/10 text-luxury-dark/60 rounded-xl text-xs font-bold uppercase tracking-widest border border-luxury-gold/10">
                      {tag}
                    </span>
                  ))}
                  {(!selectedLeadForExpand.tags || selectedLeadForExpand.tags.length === 0) && (
                    <p className="text-xs text-luxury-dark/30 italic">No tags associated with this lead.</p>
                  )}
                </div>
              </div>

              {/* Lifecycle Controller */}
              <div className="p-8 bg-luxury-dark text-white rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-luxury-dark/10">
                <div>
                  <h4 className="text-xl font-serif font-bold mb-1">Lead Lifecycle</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Manage sales pipeline status</p>
                </div>
                <div className="flex gap-2">
                  {['new', 'contacted', 'converted', 'lost'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        handleUpdateStatus(selectedLeadForExpand.id, status);
                        setSelectedLeadForExpand({...selectedLeadForExpand, status});
                      }}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        selectedLeadForExpand.status === status 
                          ? 'bg-luxury-gold text-white shadow-lg' 
                          : 'bg-white/10 text-white/40 hover:bg-white/20'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-8 pt-0 flex gap-4">
               <button 
                  onClick={() => setSelectedLeadForExpand(null)}
                  className="flex-1 py-5 bg-luxury-cream text-luxury-dark rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-luxury-dark hover:text-white transition-all shadow-sm active:scale-95"
               >
                 Close
               </button>
               {canDelete && (
                 <button 
                   onClick={() => {
                     setLeadToDelete(selectedLeadForExpand.id);
                     setSelectedLeadForExpand(null);
                   }}
                   className="w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100"
                 >
                   <Trash2 size={20} />
                 </button>
               )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const FinanceDashboard = ({ bookings, expenseCategories, globalExpenses = [], onAssignExpense, showToast, userRole }: { 
  bookings: any[], 
  expenseCategories: any[], 
  globalExpenses?: any[],
  onAssignExpense: (b: any) => void,
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  userRole?: string | null
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Global Expense State
  const [isAddingGlobalExpense, setIsAddingGlobalExpense] = useState(false);
  const [newGlobalExpense, setNewGlobalExpense] = useState({
    amount: '',
    category: expenseCategories.length > 0 ? expenseCategories[0].name : 'Other',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleAddGlobalExpense = async () => {
    if (!newGlobalExpense.amount || !newGlobalExpense.category || !newGlobalExpense.date) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    try {
      await addDoc(collection(db, 'global_expenses'), {
        amount: Number(newGlobalExpense.amount),
        category: newGlobalExpense.category,
        note: newGlobalExpense.note,
        date: newGlobalExpense.date,
        createdAt: serverTimestamp()
      });
      showToast('Global expense added', 'success');
      setNewGlobalExpense({
        amount: '',
        category: expenseCategories.length > 0 ? expenseCategories[0].name : 'Other',
        note: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      setIsAddingGlobalExpense(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'global_expenses');
    }
  };

  const handleDeleteGlobalExpense = async (id: string) => {
    // window.confirm removed
    try {
      await deleteDoc(doc(db, 'global_expenses', id));
      showToast('Global expense deleted', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `global_expenses/${id}`);
    }
  };

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
    // window.confirm removed
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
            monthsData[monthKey].expenses += (Number(exp.amount) || 0);
          });
        }
      }
    });

    globalExpenses.forEach(exp => {
      const expDate = parse(exp.date, 'yyyy-MM-dd', new Date());
      if (!isValid(expDate)) return;
      
      const monthKey = format(expDate, 'MMM yyyy');
      if (monthsData[monthKey]) {
        monthsData[monthKey].expenses += (Number(exp.amount) || 0);
      }
    });

    return Object.entries(monthsData)
      .map(([name, data]) => ({ name, ...data }));
  }, [bookings, selectedYear]);

  const stats = useMemo(() => {
    const totalIncome = filteredBookings.reduce((sum, b) => sum + (b.bookingAmount || 0), 0);
    
    // Booking-specific expenses
    const bookingExpenses = filteredBookings.reduce((sum, b) => {
      const expSum = (b.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
      return sum + expSum;
    }, 0);

    // Global expenses (filtered by selected month/year)
    const filteredGlobalExpenses = globalExpenses.filter(e => {
      const d = parse(e.date, 'yyyy-MM-dd', new Date());
      if (!isValid(d)) return false;
      const yearMatch = d.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.getMonth().toString() === selectedMonth;
      return yearMatch && monthMatch;
    });

    const totalGlobalExp = filteredGlobalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenses = bookingExpenses + totalGlobalExp;
    
    const totalBookings = filteredBookings.length;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';
    
    return { totalIncome, totalExpenses, totalBookings, netProfit, profitMargin, bookingExpenses, totalGlobalExp };
  }, [filteredBookings, globalExpenses, selectedMonth, selectedYear]);

  const expenseByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    // Booking expanses
    filteredBookings.forEach(booking => {
      if (booking.expenses && Array.isArray(booking.expenses)) {
        booking.expenses.forEach((exp: any) => {
          categories[exp.category] = (categories[exp.category] || 0) + (Number(exp.amount) || 0);
        });
      }
    });

    // Global expenses
    globalExpenses.forEach(exp => {
      const d = parse(exp.date, 'yyyy-MM-dd', new Date());
      if (!isValid(d)) return;
      const yearMatch = d.getFullYear().toString() === selectedYear;
      const monthMatch = selectedMonth === 'all' || d.getMonth().toString() === selectedMonth;
      
      if (yearMatch && monthMatch) {
        categories[exp.category] = (categories[exp.category] || 0) + (Number(exp.amount) || 0);
      }
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [filteredBookings, globalExpenses, selectedMonth, selectedYear]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Income', value: stats.totalIncome, icon: IndianRupee, color: 'emerald', info: 'Gross Revenue' },
          { label: 'Total Expenses', value: stats.totalExpenses, icon: TrendingDown, color: 'red', info: 'OpEx Costs' },
          { label: 'Net Profit', value: stats.netProfit, icon: TrendingUp, color: 'luxury-gold', info: 'Post-Expense' },
          { label: 'Efficiency', value: `${stats.profitMargin}%`, icon: PieChart, color: 'blue', info: 'Profit Margin' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-40 h-40 -mr-20 -mt-20 bg-${stat.color === 'luxury-gold' ? 'luxury-gold' : stat.color}-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${
                  stat.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                  stat.color === 'red' ? 'bg-red-500 text-white shadow-red-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                  'bg-luxury-gold text-white shadow-luxury-gold/20'
                }`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-luxury-dark/20 uppercase tracking-[0.2em]">{stat.info}</p>
                  <p className={`text-[9px] font-black uppercase mt-1 ${
                    stat.color === 'red' ? 'text-red-500' : 'text-emerald-500'
                  }`}>+12.5% vs Prev</p>
                </div>
              </div>
              
              <p className="text-[11px] font-bold text-luxury-dark/40 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-serif font-black text-luxury-dark tracking-tight">
                {typeof stat.value === 'number' ? `₹${stat.value.toLocaleString()}` : stat.value}
              </h3>
              
              <div className="mt-6 flex items-center gap-2">
                <div className="flex-1 h-1 bg-luxury-dark/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className={`h-full ${
                      stat.color === 'emerald' ? 'bg-emerald-500' :
                      stat.color === 'red' ? 'bg-red-500' :
                      stat.color === 'blue' ? 'bg-blue-500' :
                      'bg-luxury-gold'
                    }`}
                  />
                </div>
                <span className="text-[9px] font-bold text-luxury-dark/30">Target: 85%</span>
              </div>
            </div>
          </motion.div>
        ))}
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

      {userRole === 'admin' && (
        <>
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

          {/* Global Expenses Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-luxury-dark">Global Property Expenses</h3>
                <p className="text-[10px] font-bold text-luxury-dark/40 uppercase tracking-widest mt-1">Marketing, Maintenance, Salaries</p>
          </div>
          <button 
            onClick={() => setIsAddingGlobalExpense(!isAddingGlobalExpense)}
            className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-luxury-dark text-[10px] font-bold rounded-xl hover:bg-luxury-dark hover:text-white transition-all uppercase tracking-widest"
          >
            {isAddingGlobalExpense ? <X size={14} /> : <Plus size={14} />}
            {isAddingGlobalExpense ? 'Cancel' : 'Add Expense'}
          </button>
        </div>

        <AnimatePresence>
          {isAddingGlobalExpense && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-luxury-cream p-6 rounded-2xl border border-black/5 flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={newGlobalExpense.amount}
                    onChange={(e) => setNewGlobalExpense({ ...newGlobalExpense, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-black/5 rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-luxury-gold"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">Category</label>
                  <select
                    value={newGlobalExpense.category}
                    onChange={(e) => setNewGlobalExpense({ ...newGlobalExpense, category: e.target.value })}
                    className="w-full px-4 py-3 border border-black/5 rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-luxury-gold"
                  >
                    {expenseCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1 md:flex-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">Note (Optional)</label>
                  <input
                    type="text"
                    value={newGlobalExpense.note}
                    onChange={(e) => setNewGlobalExpense({ ...newGlobalExpense, note: e.target.value })}
                    className="w-full px-4 py-3 border border-black/5 rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-luxury-gold"
                    placeholder="e.g. FB Ads / Repair"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-luxury-dark/60 mb-2">Date</label>
                  <input
                    type="date"
                    value={newGlobalExpense.date}
                    onChange={(e) => setNewGlobalExpense({ ...newGlobalExpense, date: e.target.value })}
                    className="w-full px-4 py-3 border border-black/5 rounded-xl font-bold text-sm bg-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddGlobalExpense}
                    className="w-full px-6 py-3 bg-luxury-dark text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-luxury-gold transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-luxury-dark/5">
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Date</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Category</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Amount</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40">Note</th>
                <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-dark/5">
              {globalExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-luxury-cream/30 transition-colors group">
                  <td className="px-4 py-4 text-xs font-medium text-luxury-dark/60">{format(parse(expense.date, 'yyyy-MM-dd', new Date()), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-4 text-xs font-bold text-luxury-dark">{expense.category}</td>
                  <td className="px-4 py-4 text-xs font-bold text-red-500">₹{(expense.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-xs text-luxury-dark/60">{expense.note || '-'}</td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteGlobalExpense(expense.id)}
                      className="p-2 bg-luxury-dark/5 text-luxury-dark/40 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {globalExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-luxury-dark/40 italic">
                    No global expenses recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

const AssignExpenseModal = ({ booking, expenseCategories, onClose, showToast }: {
  booking: any;
  expenseCategories: any[];
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) => {
  useEscapeKey(onClose);
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

const MyBookings = ({ 
  user, 
  userRole, 
  userPermissions, 
  onClose, 
  onLogin, 
  allBookings, 
  showToast, 
  onLogout, 
  galleryImages, 
  heroSettings, 
  replyTemplates, 
  pricingSettings,
  onClearCache,
  notifications,
  unreadCount,
  showNotifPanel,
  setShowNotifPanel,
  setNotifications,
  setUnreadCount,
  soundEnabled,
  setSoundEnabled,
  onNotify
}: { 
  user: FirebaseUser; 
  userRole: string | null; 
  userPermissions: any;
  onClose: () => void; 
  onLogin: () => void; 
  allBookings: any[]; 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void; 
  onLogout: () => void;
  galleryImages: any[];
  heroSettings: any;
  replyTemplates: any;
  pricingSettings: any;
  onClearCache?: () => void;
  notifications: any[];
  unreadCount: number;
  showNotifPanel: boolean;
  setShowNotifPanel: (show: boolean) => void;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'bookings' | 'upcoming' | 'completed' | 'pending' | 'cancelled' | 'reviews' | 'logs' | 'sync' | 'gallery' | 'settings' | 'finance' | 'blogs' | 'leads' | 'migration' | 'chatbot_settings' | 'users' | 'notifications' | 'loyalty' | 'coupons'>('all');
  const [bookingFilter, setBookingFilter] = useState<'upcoming' | 'pending' | 'completed' | 'all'>('upcoming');
  const [settingsFilter, setSettingsFilter] = useState<'general' | 'reviews' | 'gallery' | 'logs' | 'sync' | 'migration' | 'chatbot_settings' | 'users'>('general');

  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [syncingReviews, setSyncingReviews] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [globalExpenses, setGlobalExpenses] = useState<any[]>([]);
  const [assigningExpenseBooking, setAssigningExpenseBooking] = useState<any | null>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [appUsers, setAppUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [userLoyalty, setUserLoyalty] = useState<{ points: number; tier: string; referralCode: string }>({ points: 0, tier: 'Silver', referralCode: '' });

  // Gallery Management State
  const [newGalleryImage, setNewGalleryImage] = useState({ src: '', title: '', category: 'Villa' });
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isFetchingCloudinary, setIsFetchingCloudinary] = useState(false);
  const [isAnalyzingGallery, setIsAnalyzingGallery] = useState(false);
  const [isAnalyzeConfirmOpen, setIsAnalyzeConfirmOpen] = useState(false);
  const [galleryImageToDelete, setGalleryImageToDelete] = useState<any | null>(null);
  const [isGalleryDeleteConfirmOpen, setIsGalleryDeleteConfirmOpen] = useState(false);
  const [isClearCacheConfirmOpen, setIsClearCacheConfirmOpen] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState<{ current: number; total: number } | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<any | null>(null);
  const [seedProgress, setSeedProgress] = useState<{ current: number; total: number } | null>(null);
  const canAddSettingsAdmin = userRole === 'admin' || (userRole === 'agent' && userPermissions?.addSettings);
  const canEditSettingsAdmin = userRole === 'admin' || (userRole === 'agent' && userPermissions?.editSettings);
  const canDeleteSettingsAdmin = userRole === 'admin' || (userRole === 'agent' && userPermissions?.deleteSettings);

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

  // Pricing Settings State
  const [editingPricing, setEditingPricing] = useState<any>(null);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  // Reply Templates State
  const [editingReplyTemplates, setEditingReplyTemplates] = useState<any>(null);
  const [isSavingReplyTemplates, setIsSavingReplyTemplates] = useState(false);

  useEffect(() => {
    if (replyTemplates) {
      setEditingReplyTemplates(replyTemplates);
    } else {
      setEditingReplyTemplates({
        email: "Hi {name},\n\nThank you for reaching out to Unique Farm House Noida. We have received your inquiry and would love to help you plan your stay or event.\n\nPlease let us know your preferred dates and any specific requirements you might have.\n\nBest regards,\nUnique Farm House Team",
        whatsapp: "Hi {name}! 🌟 Thank you for contacting Unique Farm House Noida. How can we help you plan your perfect stay or event today?"
      });
    }
  }, [replyTemplates]);

  useEffect(() => {
    if (pricingSettings) {
      setEditingPricing(pricingSettings);
    } else {
      setEditingPricing({
        weekday: 22000,
        weekend: 25000,
        security: 5000
      });
    }
  }, [pricingSettings]);

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

  const handleDeleteGalleryImage = (image: any) => {
    setGalleryImageToDelete(image);
    setIsGalleryDeleteConfirmOpen(true);
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
    const lastQuotaError = localStorage.getItem('last_google_quota_error');
    const now = new Date().getTime();
    
    if (lastQuotaError && now - parseInt(lastQuotaError) < 60 * 60 * 1000) {
      showToast('AI analysis is on cooldown due to recent quota limits. Please try again in an hour.', 'info');
      return;
    }

    setIsAnalyzeConfirmOpen(false);
    setIsAnalyzingGallery(true);
    setAnalyzeProgress({ current: 0, total: galleryImages.length });
    console.log('Starting AI analysis of gallery images...');

    const ai: any = getAI();

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

      // Rate limiting: 4 second delay between requests to avoid free tier limits
      await new Promise(resolve => setTimeout(resolve, 4000));

      let retryCount = 0;
      const maxRetries = 2;
      let analyzed = false;

      while (retryCount <= maxRetries && !analyzed) {
        try {
          const imageData = await getBase64FromUrl(img.src);
          if (!imageData) {
            console.warn('Skipping image due to fetch failure:', img.src);
            failCount++;
            analyzed = true;
            continue;
          }

          const resultData = await safeAiCall(() => ai.models.generateContent({
            model: "models/gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    data: imageData.data,
                    mimeType: imageData.mimeType
                  }
                },
                {
                  text: `Analyze this luxury farmhouse image. Provide:
1. Elegant title (max 5 words).
2. Category from: [${galleryCategories.join(', ')}].
Return JSON: {"title": "...", "category": "..."}. No markdown.`
                }
              ]
            },
            config: {
              responseMimeType: "application/json"
            }
          }));

          const responseText = resultData.text || '';
          const result = JSON.parse(responseText.replace(/```json|```/g, '').trim() || '{}');
          
          if (result.title && result.category) {
            await updateDoc(doc(db, 'gallery', img.id), {
              title: result.title,
              category: result.category,
              updatedAt: serverTimestamp()
            });
            successCount++;
          } else {
            failCount++;
          }
          analyzed = true;
        } catch (err: any) {
          const errorStr = JSON.stringify(err).toLowerCase() + String(err?.message || '').toLowerCase();
          const isQuotaError = errorStr.includes('quota') || 
                               errorStr.includes('429') || 
                               errorStr.includes('resource_exhausted');

          if (isQuotaError && retryCount < maxRetries) {
            retryCount++;
            const backoff = retryCount * 8000;
            console.warn(`Quota hit. Retrying (${retryCount}/${maxRetries}) in ${backoff/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            continue;
          }

          if (isQuotaError) {
            localStorage.setItem('last_google_quota_error', new Date().getTime().toString());
            showToast('Gemini API quota exceeded. Pausing remaining analysis.', 'error');
            failCount += (galleryImages.length - i);
            i = galleryImages.length; 
            break;
          }
          
          console.error('Analysis error:', img.id, err);
          failCount++;
          analyzed = true; 
        }
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
      const response = await fetch(BACKEND_URL + '/api/cloudinary/images');
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
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599341/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn1_sizw31.jpg", title: "Unique Farmhouse Cottage with Swimming Pool and Lush Lawn", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599343/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn6_q2gqyu.jpg", title: "Scenic Lawn View of Unique Farmhouse Property", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599338/Unique_Farm_House_Cottage_And_Swimming_Pool10_nbuyma.jpg", title: "Luxury Poolside Area at Unique Farmhouse", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599336/Unique_Farm_House_Cottage_And_Swimming_Pool8_ls2pzs.jpg", title: "Modern Villa Exterior and Pool View", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599323/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn8_z0yfvu.jpg", title: "Beautiful Garden Area and Landscaping", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599319/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn7_edain1.jpg", title: "Unique Farmhouse Villa Night View with Lighting", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599317/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn4_j0n7zt.jpg", title: "Spacious Pool Deck for Relaxation", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599315/Unique_Farm_House_Cottage_And_Swimming_Pool_And_Lawn3_mtstvj.jpg", title: "Grand Villa Entrance at Unique Farmhouse", category: "Villa" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599275/Unique_Farm_House_Swimming_Pool12_lo1abs.jpg", title: "Large Private Swimming Pool at Unique Farmhouse", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599271/Unique_Farm_House_Swimming_Pool15_khet3t.jpg", title: "Comfortable Pool Lounge and Seating", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599265/Unique_Farm_House_Swimming_Pool11_wzrzyv.jpg", title: "Crystal Clear Water in the Private Pool", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599261/Unique_Farm_House_Swimming_Pool8_acccpc.jpg", title: "Evening Poolside Ambiance at Unique Farmhouse", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774599260/Unique_Farm_House_Swimming_Pool7_e5jxkv.jpg", title: "Relaxing Poolside View with Sunbeds", category: "Pool" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774596185/Unique_Farm_House_High_Tea3_pp6cha.jpg", title: "Elegant High Tea Setup at Unique Farmhouse", category: "Dining" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586829/Unique_Farm_House_Bonfire2_ublmjv.jpg", title: "Bonfire Night Experience for Guests", category: "Activities" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586828/Unique_Farm_House_Bonfire4_bnrw9y.jpg", title: "Cozy Bonfire Setup in the Garden", category: "Activities" },
      { src: "https://res.cloudinary.com/dxxd8os4d/image/upload/q_auto/f_auto/v1774586827/Unique_Farm_House_Bonfire3_rt2hoy.jpg", title: "Evening Bonfire Gathering Area", category: "Activities" },
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

  const handleSavePricingSettings = async () => {
    setIsSavingPricing(true);
    try {
      await setDoc(doc(db, 'settings', 'pricing'), {
        ...editingPricing,
        updatedAt: serverTimestamp()
      });
      await logAdminAction('update_pricing_settings', 'settings', 'Updated pricing settings');
      showToast('Pricing settings saved successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/pricing');
      showToast('Failed to save pricing settings', 'error');
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleSaveReplyTemplates = async () => {
    setIsSavingReplyTemplates(true);
    try {
      await setDoc(doc(db, 'settings', 'replyTemplates'), {
        ...editingReplyTemplates,
        updatedAt: serverTimestamp()
      });
      await logAdminAction('update_reply_templates', 'settings', 'Updated quick reply templates');
      showToast('Reply templates saved successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/replyTemplates');
      showToast('Failed to save templates', 'error');
    } finally {
      setIsSavingReplyTemplates(false);
    }
  };

  const syncGoogleReviews = async (silent = false) => {
    if (userRole !== 'admin') return;
    if (!silent) setSyncingReviews(true);
    
    const lastSync = localStorage.getItem('last_google_review_sync');
    const now = new Date().getTime();
    
    // Check last sync time to avoid redundant calls (every 24 hours for auto-sync)
    if (silent && lastSync && now - parseInt(lastSync) < 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      const response = await fetch(BACKEND_URL + '/api/reviews/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errText = await response.text();
          try {
            const errData = JSON.parse(errText);
            errorDetails = errData.details || errData.error || '';
          } catch(e) {
            errorDetails = `Server returned an invalid format (Status ${response.status})`;
          }
        } catch (e) {}
        throw new Error(`Failed to sync reviews via server${errorDetails ? ': ' + errorDetails : ''}`);
      }

      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (e) {
        throw new Error(`Invalid response from server. Response may be HTML or malformed.`);
      }
      
      if (result.success) {
        localStorage.setItem('last_google_review_sync', now.toString());
        if (!silent) {
          if (result.newCount > 0) {
            showToast(`Successfully synced ${result.newCount} new reviews from Google.`, 'success');
            await logAdminAction('sync_google_reviews', 'all', `Synced ${result.newCount} new reviews`);
          } else {
            showToast(result.message || 'Successfully connected to Google. No new reviews found.', 'info');
          }
        }
      } else {
        throw new Error(result.message || 'Sync failed');
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
    if (userRole && userPermissions && !hasSetDefaultFilter) {
      if (userRole === 'admin') {
         setActiveFilter('bookings');
      } else if (userRole === 'agent') {
         if (userPermissions?.viewBookings) setActiveFilter('bookings');
         else if (userPermissions?.viewLeads) setActiveFilter('leads');
         else if (userPermissions?.viewFinance) setActiveFilter('finance');
         else if (userPermissions?.viewBlogs) setActiveFilter('blogs');
         else if (userPermissions?.viewSettings) setActiveFilter('settings');
         else setActiveFilter('all');
      } else {
         setActiveFilter('all');
      }
      setHasSetDefaultFilter(true);
    }
  }, [userRole, userPermissions, hasSetDefaultFilter]);

  const handleChangePassword = async () => {
    setIsUpdateModalOpen(true);
  };

  useEffect(() => {
    if (!user || userRole === null || (userRole !== 'admin' && userRole !== 'agent')) return;
    
    if (activeFilter === 'reviews' && (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewSettings))) {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'reviews'));
      return () => unsubscribe();
    }
    if (activeFilter === 'logs' && (userRole === 'admin' || userRole === 'agent')) {
      const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAdminLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'logs'));
      return () => unsubscribe();
    }
    if (activeFilter === 'finance' && (userRole === 'admin' || userRole === 'agent')) {
      const qCat = query(collection(db, 'expense_categories'), orderBy('createdAt', 'asc'));
      const unCat = onSnapshot(qCat, (snapshot) => {
        setExpenseCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'expense_categories'));

      const qExp = query(collection(db, 'global_expenses'), orderBy('createdAt', 'desc'));
      const unExp = onSnapshot(qExp, (snapshot) => {
        setGlobalExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'global_expenses'));
      return () => { unCat(); unExp(); };
    }
    if (activeFilter === 'leads' && (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewLeads))) {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'leads'));
      return () => unsubscribe();
    }
    if (activeFilter === 'users' && (userRole === 'admin' || userRole === 'agent')) {
      if (!user) return;
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAppUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));
      return () => unsubscribe();
    }
    if (activeFilter === 'coupons' && (userRole === 'admin' || userRole === 'agent')) {
      const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'coupons'));
      return () => unsubscribe();
    }
  }, [userRole, activeFilter, user?.uid]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter(r => r.status === reviewFilter);
  }, [reviews, reviewFilter]);

  const settingsCounts = {
    reviews: reviews.length,
    gallery: galleryImages.length + 17 - galleryImages.filter(img => [
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
    ].includes(img.src)).length,
    logs: adminLogs.length,
    notifications: notifications.length,
    isAdmin: userRole === 'admin'
  };

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

  const handleUpdateUser = async (userId: string, data: { displayName?: string, email?: string }) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      showToast('User profile updated', 'success');
      await logAdminAction('update_user_profile', userId, `Updated: ${Object.keys(data).join(', ')}`);
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user profile', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      showToast('User deleted from system', 'success');
      await logAdminAction('delete_user', userId, 'User accounts/permissions removed');
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const updateData: any = {
        role,
        updatedAt: serverTimestamp()
      };

      // Set default permissions for agents if they don't have any
      if (role === 'agent') {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && (!userSnap.data().permissions || Object.keys(userSnap.data().permissions).length === 0)) {
          updateData.permissions = {
            viewBookings: true,
            viewLeads: true,
            editLeads: true,
            addLeads: true,
            viewBlogs: true,
            viewSettings: false // Default off for settings
          };
        }
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      showToast(`User role updated to ${role}`, 'success');
      await logAdminAction('update_user_role', userId, `Role changed to ${role}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        permissions,
        updatedAt: serverTimestamp()
      });
      showToast('User permissions updated', 'success');
      await logAdminAction('update_user_permissions', userId, 'Permissions updated');
    } catch (error) {
      console.error('Error updating user permissions:', error);
      showToast('Failed to update user permissions', 'error');
    }
  };

  const handleAddFieldAgent = async (email: string, name: string) => {
    try {
      const existingUser = appUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        throw new Error('User already exists in system.');
      }
      
      await addDoc(collection(db, 'users'), {
        email: email.toLowerCase(),
        displayName: name,
        role: 'agent',
        permissions: {
          viewLeads: true,
          manageBookings: true,
          deleteLead: false,
          exportData: false,
          editSettings: false
        },
        createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
      });
      showToast(`Agent ${name} authorized. Since this is a new account, they must "Sign Up" first with this email to create their password.`, 'success');
      await logAdminAction('authorize_agent', email, `Pre-authorized agent by email: ${name}. Instructed to sign up.`);
    } catch (error) {
      console.error('Error adding user:', error);
      showToast(error instanceof Error ? error.message : 'Failed to add agent', 'error');
      throw error;
    }
  };

  useEffect(() => {
    if (!user || userRole === null) return;
    let unsubscribe: () => void = () => {};
    
    try {
      let unsubscribeUid: () => void = () => {};
      let unsubscribeEmail: () => void = () => {};

      if (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewBookings)) {
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
          // Only log if they are strictly a client, as admins/agents use the unfiltered query above
          if (userRole === 'client') {
            console.error("Error fetching UID bookings:", error);
          }
        });

        if (user.email) {
          const emailQuery = query(collection(db, 'bookings'), where('email', '==', user.email.toLowerCase()));
          unsubscribeEmail = onSnapshot(emailQuery, (snapshot) => {
            emailBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            combineAndSetBookings();
          }, (error) => {
            // Only log if they are strictly a client, as admins/agents use the unfiltered query above
            if (userRole === 'client') {
              console.error("Error fetching Email bookings:", error);
            }
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
  }, [user?.uid, user?.email, userRole]);

  useEffect(() => {
    if (!userRole) return;
    if (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewBlogs)) {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'blogs'));
      return () => unsubscribe();
    }
  }, [userRole, userPermissions]);

  const filteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filterToUse = activeFilter === 'bookings' ? bookingFilter : activeFilter;

    return bookings.filter(booking => {
      if (filterToUse === 'all') return true;
      if (filterToUse === 'pending') return booking.status === 'pending';
      if (filterToUse === 'cancelled') return booking.status === 'cancelled';
      
      if (!booking.checkIn || !booking.checkOut) return false;
      
      const checkInDate = parse(booking.checkIn, 'dd/MM/yyyy', new Date());
      const checkOutDate = parse(booking.checkOut, 'dd/MM/yyyy', new Date());
      
      if (!isValid(checkInDate) || !isValid(checkOutDate)) return false;
      
      if (filterToUse === 'upcoming') {
        return (booking.status === 'confirmed' || booking.status === 'pending') && checkInDate >= new Date(today.getTime() - 86400000);
      }
      if (filterToUse === 'completed') {
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
  }, [bookings, activeFilter, bookingFilter]);

  // Generate and save ICS calendar for external platforms
  useEffect(() => {
    if (userRole === 'admin') {
      const generateIcs = () => {
        // Correct RFC 5545 format with CRLF (\r\n) line breaks
        let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';
        
        bookings.filter(b => b.status === 'confirmed').forEach(b => {
          if (b.checkIn && b.checkOut) {
            const checkInDate = parse(b.checkIn, 'dd/MM/yyyy', new Date());
            const checkOutDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
            
            if (isValid(checkInDate) && isValid(checkOutDate)) {
              // Ensure proper UTC format YYYYMMDDTHHMMSSZ
              // Standard Check-in 14:00, Check-out 11:00
              const startDateTime = new Date(checkInDate);
              startDateTime.setUTCHours(14, 0, 0, 0);
              const endDateTime = new Date(checkOutDate);
              endDateTime.setUTCHours(11, 0, 0, 0);

              const formatUTC = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              const dtstamp = formatUTC(new Date());
              const dtstart = formatUTC(startDateTime);
              const dtend = formatUTC(endDateTime);
              
              ics += 'BEGIN:VEVENT\r\n';
              ics += `UID:${b.id}@uniquefarmhouse.com\r\n`;
              ics += `DTSTAMP:${dtstamp}\r\n`;
              ics += `DTSTART:${dtstart}\r\n`;
              ics += `DTEND:${dtend}\r\n`;
              ics += `SUMMARY:Booked - Unique Farmhouse\r\n`;
              ics += 'END:VEVENT\r\n';
            }
          }
        });
        ics += 'END:VCALENDAR\r\n';
        return ics;
      };

      const icsData = generateIcs();
      setDoc(doc(db, 'public', 'calendar'), { icsData, updatedAt: new Date().toUTCString() }, { merge: true })
        .catch(err => console.error('Failed to update public calendar:', err));
    }
  }, [bookings, userRole]);

  // Group bookings by check-in date for admin view
  const groupedBookings = useMemo(() => {
    if (userRole !== 'admin' && userRole !== 'agent') return null;
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

  const handleUpdatePayment = async (bookingId: string, booking: any) => {
    const amount = parseFloat(paymentInputs[bookingId]);
    const note = paymentNotes[bookingId] || '';
    if (isNaN(amount) || amount <= 0) return;

    const newPayment = {
      amount,
      note: note || 'Payment Received',
      date: new Date().toISOString(),
      method: 'manual'
    };

    const updatedPayments = [...(booking.payments || []), newPayment];
    const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = booking.totalAmount || 0;

    let status: 'unpaid' | 'part-paid' | 'paid' = 'unpaid';
    if (totalPaid >= totalAmount) status = 'paid';
    else if (totalPaid > 0) status = 'part-paid';

    try {
      await setDoc(doc(db, 'bookings', bookingId), { 
        payments: updatedPayments,
        amountPaid: totalPaid,
        paymentStatus: status
      }, { merge: true });
      await logAdminAction('update_payment', bookingId, `Added payment of ₹${amount}. Total: ₹${totalPaid}`);
      
      setPaymentInputs(prev => {
        const next = {...prev};
        delete next[bookingId];
        return next;
      });
      setPaymentNotes(prev => {
        const next = {...prev};
        delete next[bookingId];
        return next;
      });
      showToast('Payment added successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const [paymentNotes, setPaymentNotes] = useState<{[key: string]: string}>({});

  const handleExportBookings = () => {
    const csv = Papa.unparse(filteredBookings.map(b => ({
      'Booking ID': b.id,
      'Status': b.status,
      'Guest Name': b.name || 'N/A',
      'Email': b.email || 'N/A',
      'Mobile': b.mobile || 'N/A',
      'Check-In': b.checkIn,
      'Check-Out': b.checkOut,
      'Total Amount': b.totalAmount || 0,
      'Amount Paid': b.amountPaid || 0,
      'Balance': (b.totalAmount || 0) - (b.amountPaid || 0),
      'Booking Amount': b.bookingAmount || 0,
      'Security Deposit': b.securityDeposit || 0,
      'Payment Status': b.paymentStatus || 'unpaid',
      'Day Guests': `${b.dayGuestAdults || 0} Adults, ${b.dayGuestChildren?.length || 0} Children`,
      'Night Guests': `${b.nightGuestAdults || 0} Adults, ${b.nightGuestChildren?.length || 0} Children`,
      'Special Requests': b.specialRequests || 'None',
      'Booking Date': b.createdAt ? (b.createdAt.toDate ? format(b.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : b.createdAt) : 'N/A'
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `bookings_export_${bookingFilter}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Bookings exported successfully', 'success');
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
              <BookingForm user={user} userRole={userRole} editBooking={editingBooking} onClose={() => setEditingBooking(null)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} onNotify={onNotify} pricingSettings={pricingSettings} />
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
            <h2 className="text-3xl font-serif font-bold text-luxury-dark mb-8">{(userRole === 'admin' || userRole === 'agent') ? 'Create Manual Booking' : 'Book Your Stay'}</h2>
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-xl">
              <BookingForm user={user} userRole={userRole} onClose={() => setIsAdminCreating(false)} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} onNotify={onNotify} pricingSettings={pricingSettings} />
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
                      {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'agent' ? 'Agent Dashboard' : 'My Bookings'}
                    </h1>
                    <p className="text-luxury-dark/40 text-base sm:text-lg font-medium">
                      {(userRole === 'admin' || userRole === 'agent') ? 'Oversee all property operations, bookings and guest inquiries' : 'Manage all luxury stays and celebration details'}
                    </p>
                  </div>
                {(userRole === 'admin' || userRole === 'client' || (userRole === 'agent' && userPermissions?.addBookings)) && (
                <button
                  onClick={() => setIsAdminCreating(true)}
                  className="px-8 py-4 bg-[#141414] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-luxury-dark transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 shrink-0 w-full sm:w-auto"
                >
                  <Calendar size={16} />
                  {(userRole === 'admin' || userRole === 'agent') ? 'CREATE BOOKING' : 'BOOK NOW'}
                </button>
                )}
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
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button 
                            onClick={() => {
                              setShowNotifPanel(!showNotifPanel);
                              setUnreadCount(0);
                            }}
                            className={`p-2 rounded-xl transition-all ${showNotifPanel ? 'bg-luxury-gold text-luxury-dark' : 'bg-luxury-dark/5 text-luxury-dark/40 hover:bg-luxury-dark/10'}`}
                            title="Notifications"
                          >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                          <AnimatePresence>
                            {showNotifPanel && (
                              <NotificationPanel 
                                notifications={notifications} 
                                onClose={() => setShowNotifPanel(false)} 
                                onClear={() => {
                                  setNotifications([]);
                                  setUnreadCount(0);
                                }} 
                              />
                            )}
                          </AnimatePresence>
                        </div>
                        <button 
                          onClick={onLogout}
                          title="Logout"
                          className="p-2 bg-luxury-dark/5 rounded-xl text-luxury-dark/30 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
                        >
                          <LogOut size={18} />
                        </button>
                      </div>
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
            {(userRole === 'admin' || userRole === 'agent') && (
              <div className="flex flex-wrap gap-2 mb-8 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
                {[
                  { id: 'bookings', label: 'Bookings', icon: Calendar, colorClass: 'bg-blue-600 shadow-blue-500/20', hoverIconClass: 'text-blue-500 group-hover:text-blue-600', permission: 'viewBookings' },
                  { id: 'leads', label: 'Leads', icon: Users, colorClass: 'bg-purple-600 shadow-purple-500/20', hoverIconClass: 'text-purple-500 group-hover:text-purple-600', permission: 'viewLeads' },
                  { id: 'finance', label: 'Finance', icon: BarChart3, colorClass: 'bg-emerald-600 shadow-emerald-500/20', hoverIconClass: 'text-emerald-500 group-hover:text-emerald-600', permission: 'viewFinance' },
                  { id: 'blogs', label: 'Blogs', icon: BookOpen, colorClass: 'bg-rose-500 shadow-rose-500/20', hoverIconClass: 'text-rose-500 group-hover:text-rose-600', permission: 'viewBlogs' },
                  { id: 'settings', label: 'Settings', icon: Settings, colorClass: 'bg-[#C8A45D] shadow-[#C8A45D]/20', hoverIconClass: 'text-[#C8A45D] group-hover:text-luxury-gold', permission: 'viewSettings' }
                ].filter(tab => {
                  if (userRole === 'admin') return true;
                  if (userRole === 'agent') {
                    if (!tab.permission) return true;
                    return userPermissions?.[tab.permission] === true;
                  }
                  return false;
                }).map((tab) => {
               const isSettingsTab = ['settings', 'reviews', 'gallery', 'logs', 'sync', 'migration', 'notifications', 'coupons'].includes(activeFilter);
               const isActive = tab.id === 'settings' ? isSettingsTab : activeFilter === tab.id;
               
               return (
               <button
                 key={tab.id}
                 onClick={() => {
                   if (tab.id === 'settings') {
                     setActiveFilter('settings');
                     setSettingsFilter('general');
                   } else {
                     setActiveFilter(tab.id as any);
                   }
                 }}
                 className={`group flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                   isActive 
                     ? `${tab.colorClass} text-white shadow-lg scale-[1.02]` 
                     : 'text-luxury-dark/50 hover:bg-white hover:text-luxury-dark shadow-sm hover:shadow-md border border-transparent hover:border-luxury-dark/5'
                 }`}
               >
                 <tab.icon size={16} className={`transition-colors ${isActive ? 'text-white/90' : tab.hoverIconClass}`} />
                 {tab.label}
                 <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-luxury-dark/5 text-luxury-dark/40 group-hover:bg-luxury-dark/10'}`}>
                   {tab.id === 'leads' ? leads.length :
                     tab.id === 'blogs' ? blogs.length :
                     tab.id === 'bookings' ? bookings.length :
                     tab.id === 'finance' ? 'Stats' : 'Tool'}
                 </span>
               </button>
               );
             })}
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
        ) : (activeFilter === 'reviews' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-luxury-dark">Guest Reviews</h3>
                <p className="text-sm text-luxury-dark/60">Manage and approve guest testimonials</p>
              </div>
              {(userRole === 'admin' || userPermissions?.editSettings) && (
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
              )}
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
                    <p className="text-[10px] text-luxury-dark/40">
                        {(() => {
                          if (!review.createdAt) return 'N/A';
                          const dStr = typeof review.createdAt === 'string' ? review.createdAt : (review.createdAt.toDate ? review.createdAt.toDate().toISOString() : (review.createdAt.seconds ? new Date(review.createdAt.seconds * 1000).toISOString() : String(review.createdAt)));
                          return dStr.includes(',') ? dStr.split(',')[0] : dStr.split('T')[0];
                        })()}
                      </p>
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
        ) : (activeFilter === 'leads' && (userRole === 'admin' || userRole === 'agent')) ? (
          <LeadDashboard leads={leads} showToast={showToast} userRole={userRole} userPermissions={userPermissions} />
        ) : (activeFilter === 'users' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <UserManagement 
              users={appUsers} 
              onUpdateRole={handleUpdateUserRole} 
              onUpdatePermissions={handleUpdateUserPermissions}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddUser={handleAddFieldAgent}
              showToast={showToast}
              currentUserEmail={user?.email}
            />
          </div>
        ) : (activeFilter === 'finance' && (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewFinance))) ? (
          <FinanceDashboard 
            bookings={bookings} 
            expenseCategories={expenseCategories}
            globalExpenses={globalExpenses}
            onAssignExpense={setAssigningExpenseBooking}
            showToast={showToast}
            userRole={userRole}
          />
        ) : activeFilter === 'coupons' && (userRole === 'admin' || userRole === 'agent') ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <CouponManagement coupons={coupons} showToast={showToast} />
          </div>
        ) : activeFilter === 'loyalty' ? (
          <LoyaltyDashboard user={user} loyalty={userLoyalty} referrals={referrals} appUsers={userRole === 'admin' ? appUsers : []} isAdmin={userRole === 'admin'} showToast={showToast} />
        ) : (activeFilter === 'logs' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
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
        </div>
        ) : (activeFilter === 'gallery' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
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
              {canAddSettingsAdmin && (
                <>
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
                </>
              )}

              {canDeleteSettingsAdmin && (
                <button 
                  onClick={handleRemoveDuplicates}
                  className="mt-6 ml-4 px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  Remove Duplicates
                </button>
              )}

              {canEditSettingsAdmin && (
                <button 
                  onClick={handleAutoAnalyzeGallery}
                  disabled={isAnalyzingGallery}
                  className="mt-6 ml-4 px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {isAnalyzingGallery ? 'Analyzing...' : 'Auto-Analyze All Images'}
                </button>
              )}
              
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
                    {canAddSettingsAdmin && (
                      <button 
                        onClick={handleSeedGallery}
                        disabled={isAddingImage}
                        className="px-8 py-3 bg-luxury-gold/10 text-luxury-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50 w-fit"
                      >
                        {isAddingImage ? 'Importing...' : 'Import Missing Default Images'}
                      </button>
                    )}
                    
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
                          {canEditSettingsAdmin && (
                            <button 
                              onClick={() => setEditingGalleryImage(img)}
                              className="flex-1 py-2 bg-luxury-dark/5 text-luxury-dark text-[10px] font-bold rounded-lg hover:bg-luxury-dark hover:text-white transition-all"
                            >
                              Edit
                            </button>
                          )}
                          {canDeleteSettingsAdmin && (
                            <button 
                              onClick={() => handleDeleteGalleryImage(img)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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
        ) : (activeFilter === 'settings' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Pricing & Security Settings</h3>
                {canEditSettingsAdmin && (
                  <button 
                    onClick={handleSavePricingSettings}
                    disabled={isSavingPricing}
                    className="px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20"
                  >
                    {isSavingPricing ? 'Saving...' : 'Save Pricing'}
                  </button>
                )}
              </div>

              <div className="space-y-6 opacity-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Weekday Charge (₹)</label>
                    <input 
                      type="number" 
                      value={editingPricing?.weekday || ''}
                      onChange={(e) => setEditingPricing({...editingPricing, weekday: Number(e.target.value)})}
                      disabled={!canEditSettingsAdmin}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Weekend Charge (₹)</label>
                    <input 
                      type="number" 
                      value={editingPricing?.weekend || ''}
                      onChange={(e) => setEditingPricing({...editingPricing, weekend: Number(e.target.value)})}
                      disabled={!canEditSettingsAdmin}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Security Deposit (₹)</label>
                    <input 
                      type="number" 
                      value={editingPricing?.security || ''}
                      onChange={(e) => setEditingPricing({...editingPricing, security: Number(e.target.value)})}
                      disabled={!canEditSettingsAdmin}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                  <div className="space-y-4 col-span-1 md:col-span-3 mt-6">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Booking Add-ons</label>
                    <div className="bg-luxury-dark/5 p-4 rounded-xl space-y-4">
                      {editingPricing?.addons?.map((addon, idx) => (
                        <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm flex-wrap sm:flex-nowrap">
                          <input 
                            type="text" 
                            placeholder="Addon Name (e.g., DJ Setup, Bonfire)" 
                            value={addon.name} 
                            onChange={(e) => {
                              const newAddons = [...(editingPricing.addons || [])];
                              newAddons[idx].name = e.target.value;
                              setEditingPricing({...editingPricing, addons: newAddons});
                            }}
                            className="flex-1 min-w-[150px] px-4 py-2 border-none bg-luxury-dark/5 rounded-lg text-sm outline-none"
                          />
                          <input 
                            type="number" 
                            placeholder="Price (₹)" 
                            value={addon.price} 
                            onChange={(e) => {
                              const newAddons = [...(editingPricing.addons || [])];
                              newAddons[idx].price = Number(e.target.value);
                              setEditingPricing({...editingPricing, addons: newAddons});
                            }}
                            className="w-24 px-4 py-2 border-none bg-luxury-dark/5 rounded-lg text-sm outline-none"
                          />
                          <select
                            value={addon.type || 'flat'}
                            onChange={(e) => {
                              const newAddons = [...(editingPricing.addons || [])];
                              newAddons[idx].type = e.target.value;
                              setEditingPricing({...editingPricing, addons: newAddons});
                            }}
                            className="px-3 py-2 border-none bg-luxury-dark/5 rounded-lg text-xs outline-none"
                          >
                            <option value="flat">Fixed / Flat</option>
                            <option value="per_night">Per Night</option>
                            <option value="per_unit">Per Unit</option>
                            <option value="per_unit_per_night">Unit + Night</option>
                          </select>
                          <button 
                            onClick={() => {
                              const newAddons = [...(editingPricing.addons || [])];
                              newAddons.splice(idx, 1);
                              setEditingPricing({...editingPricing, addons: newAddons});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Remove Addon"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const currentAddons = editingPricing?.addons || [];
                          setEditingPricing({...editingPricing, addons: [...currentAddons, { name: '', price: 0 }]});
                        }}
                        className="px-4 py-2 bg-luxury-dark text-white rounded-lg text-xs font-bold uppercase tracking-widest"
                      >
                        + Add New Addon
                      </button>
                    </div>
                  </div>

              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Hero Section Settings</h3>
                {canEditSettingsAdmin && (
                  <button 
                    onClick={handleSaveHeroSettings}
                    disabled={isSavingHero}
                    className="px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20"
                  >
                    {isSavingHero ? 'Saving...' : 'Save Settings'}
                  </button>
                )}
              </div>

              <div className="space-y-6 opacity-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Background Image URL</label>
                    <input 
                      type="text" 
                      value={editingHero?.backgroundImage || ''}
                      onChange={(e) => setEditingHero({...editingHero, backgroundImage: e.target.value})}
                      disabled={!canEditSettingsAdmin}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Subtitle</label>
                    <input 
                      type="text" 
                      value={editingHero?.subtitle || ''}
                      onChange={(e) => setEditingHero({...editingHero, subtitle: e.target.value})}
                      disabled={!canEditSettingsAdmin}
                      className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Main Title</label>
                  <input 
                    type="text" 
                    value={editingHero?.title || ''}
                    onChange={(e) => setEditingHero({...editingHero, title: e.target.value})}
                    disabled={!canEditSettingsAdmin}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Title Highlight (Italic Gold)</label>
                  <input 
                    type="text" 
                    value={editingHero?.highlight || ''}
                    onChange={(e) => setEditingHero({...editingHero, highlight: e.target.value})}
                    disabled={!canEditSettingsAdmin}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1">Hero Description</label>
                  <textarea 
                    value={editingHero?.description || ''}
                    onChange={(e) => setEditingHero({...editingHero, description: e.target.value})}
                    disabled={!canEditSettingsAdmin}
                    rows={4}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold text-luxury-dark">Quick Reply Templates</h3>
                {canEditSettingsAdmin && (
                  <button 
                    onClick={handleSaveReplyTemplates}
                    disabled={isSavingReplyTemplates}
                    className="px-8 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-dark hover:text-white transition-all disabled:opacity-50 shadow-lg shadow-luxury-gold/20"
                  >
                    {isSavingReplyTemplates ? 'Saving...' : 'Save Templates'}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1 flex items-center gap-2">
                    <Mail size={12} /> Email Template
                  </label>
                  <p className="text-xs text-luxury-dark/40 ml-1 mb-2">Use <code className="bg-luxury-dark/5 px-1 rounded">{'{name}'}</code> to insert the lead's name.</p>
                  <textarea 
                    value={editingReplyTemplates?.email || ''}
                    onChange={(e) => setEditingReplyTemplates({...editingReplyTemplates, email: e.target.value})}
                    disabled={!canEditSettingsAdmin}
                    rows={6}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold ml-1 flex items-center gap-2">
                    <Phone size={12} /> WhatsApp Template
                  </label>
                  <p className="text-xs text-luxury-dark/40 ml-1 mb-2">Use <code className="bg-luxury-dark/5 px-1 rounded">{'{name}'}</code> to insert the lead's name.</p>
                  <textarea 
                    value={editingReplyTemplates?.whatsapp || ''}
                    onChange={(e) => setEditingReplyTemplates({...editingReplyTemplates, whatsapp: e.target.value})}
                    disabled={!canEditSettingsAdmin}
                    rows={4}
                    className="w-full px-4 py-3 bg-luxury-dark/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-luxury-gold outline-none transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-luxury-dark mb-4">App Maintenance</h3>
              <p className="text-sm text-luxury-dark/60 mb-8">
                If you are experiencing issues with outdated content or login problems, you can force clear the application cache and cookies.
              </p>
              <button 
                onClick={() => setIsClearCacheConfirmOpen(true)}
                className="px-8 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
              >
                Clear Cache & Refresh App
              </button>
            </div>
          </div>
        ) : (activeFilter === 'sync' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <CalendarSync showToast={showToast} canEditSettingsAdmin={canEditSettingsAdmin} />
          </div>
        ) : (activeFilter === 'blogs' && (userRole === 'admin' || (userRole === 'agent' && userPermissions?.viewBlogs))) ? (
          <BlogAdmin showToast={showToast} galleryImages={galleryImages} userRole={userRole} userPermissions={userPermissions} />
        ) : (activeFilter === 'migration' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <DataMigration showToast={showToast} />
          </div>
        ) : (activeFilter === 'notifications' && (userRole === 'admin' || userRole === 'agent')) ? (
          <div className="space-y-8 mt-12 animate-fade-in">
            <SettingsSubNav activeFilter={activeFilter} setActiveFilter={setActiveFilter} setSettingsFilter={setSettingsFilter} counts={settingsCounts} userRole={userRole} userPermissions={userPermissions} />
            <div className="bg-white p-8 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-luxury-gold/10 rounded-xl flex items-center justify-center text-luxury-gold">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-luxury-dark">Real-time Notifications</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-luxury-dark/40 mt-1">Manage SSE alerts and sound preferences for multiple users</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-luxury-dark/5">
                  <span className="text-xs font-bold text-luxury-dark uppercase tracking-widest flex items-center gap-2">
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Sound Feedback
                  </span>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-luxury-gold' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-luxury-cream/30 rounded-2xl border border-luxury-dark/5">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-luxury-dark">
                    <Zap size={16} className="text-luxury-gold" /> Cloudflare SSE Architecture
                  </h4>
                  <p className="text-xs text-luxury-dark/60 leading-relaxed">
                    Uses Server-Sent Events (SSE) for low-latency, real-time updates. This system is optimized for Cloudflare Workers' execution model and limits.
                  </p>
                </div>
                <div className="p-6 bg-luxury-cream/30 rounded-2xl border border-luxury-dark/5 text-luxury-dark">
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <BellRing size={16} className="text-luxury-gold" /> Broadcast Notifications
                  </h4>
                  <p className="text-xs text-luxury-dark/60 leading-relaxed">
                    All connected agents and owners receive instant alerts for new bookings and leads. No manual page refresh required.
                  </p>
                </div>
              </div>

              <div className="bg-luxury-dark p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/5 text-white rounded-xl flex items-center justify-center border border-white/10">
                    <Cloud size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xl text-white">Cloudflare Worker Script</h4>
                    <p className="text-sm text-white/40 italic">Deploy this specialized script to manage your notification stream</p>
                  </div>
                </div>

                <div className="relative group">
                  <pre className="p-6 bg-black/40 text-emerald-400 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto h-[450px] border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`/**
 * CLOUDFLARE WORKER: Real-time SSE Notification Hub
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    if (url.pathname === "/api/notifications/stream") {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const response = new Response(readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
      const interval = setInterval(() => {
        writer.write(encoder.encode(": heartbeat\\n\\n"));
      }, 30000);
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        writer.close();
      });
      return response;
    }

    if (request.method === "POST" && url.pathname === "/api/notify") {
      const payload = await request.json();
      return new Response(JSON.stringify({ status: "success" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response("Unique Farmhouse API", { status: 200, headers: corsHeaders });
  }
};`}
                  </pre>
                  <button 
                    onClick={() => {
                      const scriptText = "// Cloudflare Worker: SSE Notification Hub ...";
                      navigator.clipboard.writeText(scriptText);
                      showToast('Worker script copied!', 'success');
                    }}
                    className="absolute top-4 right-4 px-6 py-2.5 bg-luxury-gold text-luxury-dark text-[10px] font-black rounded-xl hover:bg-white transition-all shadow-2xl flex items-center gap-2"
                  >
                    <Copy size={14} /> COPY WORKER SCRIPT
                  </button>
                </div>
                
                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-4 text-luxury-gold">
                    <Info size={18} />
                    <h5 className="font-bold text-xs uppercase tracking-widest">Configuration Note</h5>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Once you deploy the worker, map your domain to the worker route. The frontend is pre-configured to listen on <code className="bg-white/10 px-1 rounded text-white">/api/notifications/stream</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (userRole === 'admin' || userRole === 'agent') ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-luxury-dark/5 shadow-sm">
              <div className="flex flex-wrap gap-2 p-1 bg-luxury-dark/5 rounded-2xl w-fit">
                {[
                  { id: 'upcoming', label: 'Upcoming', activeClass: 'bg-blue-600' },
                  { id: 'pending', label: 'Pending', activeClass: 'bg-amber-500' },
                  { id: 'completed', label: 'Completed', activeClass: 'bg-emerald-600' },
                  { id: 'all', label: 'All Bookings', activeClass: 'bg-luxury-dark' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBookingFilter(tab.id as any)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      bookingFilter === tab.id 
                        ? `${tab.activeClass} text-white shadow-md scale-[1.02]` 
                        : 'text-luxury-dark/50 hover:bg-white hover:text-luxury-dark'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-2 py-0.5 rounded-full ${bookingFilter === tab.id ? 'bg-white/20' : 'bg-luxury-dark/10'}`}>
                      {bookings.filter(b => {
                        if (tab.id === 'all') return true;
                        if (tab.id === 'pending') return b.status === 'pending';
                        if (!b.checkIn || !b.checkOut) return false;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const checkInDate = parse(b.checkIn, 'dd/MM/yyyy', new Date());
                        const checkOutDate = parse(b.checkOut, 'dd/MM/yyyy', new Date());
                        if (!isValid(checkInDate) || !isValid(checkOutDate)) return false;
                        if (tab.id === 'upcoming') return (b.status === 'confirmed' || b.status === 'pending') && checkInDate >= new Date(today.getTime() - 86400000);
                        if (tab.id === 'completed') return b.status === 'confirmed' && checkOutDate < today;
                        return true;
                      }).length}
                    </span>
                  </button>
                ))}
              </div>
              {(userRole === 'admin' || (userRole === 'agent' && userPermissions?.deleteBookings)) && (
                <button 
                  onClick={handleExportBookings}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 min-w-fit"
                >
                  <Download size={14} />
                  Export Bookings
                </button>
              )}
            </div>
            {Object.entries(groupedBookings || {}).map(([date, dateBookings]: [string, any]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-luxury-dark/10" />
                  <div className="px-5 py-2 min-w-[120px] text-center bg-[linear-gradient(110deg,#3b82f6,45%,#60a5fa,55%,#3b82f6)] bg-[length:250%_100%] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 animate-shimmer whitespace-nowrap">
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
                              {(userRole === 'admin' || (userRole === 'agent' && userPermissions?.editBookings) || booking.status === 'pending' || (booking.status === 'confirmed' && parse(booking.checkIn, 'dd/MM/yyyy', new Date()) > new Date())) && (
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
                            <p className="font-bold text-luxury-dark">
                              {(() => {
                                if (!booking.createdAt) return 'N/A';
                                const dStr = typeof booking.createdAt === 'string' ? booking.createdAt : (booking.createdAt.toDate ? booking.createdAt.toDate().toISOString() : (booking.createdAt.seconds ? new Date(booking.createdAt.seconds * 1000).toISOString() : String(booking.createdAt)));
                                return dStr.includes(',') ? dStr.split(',')[0] : dStr.split('T')[0];
                              })()}
                            </p>
                          </div>
                          {(userRole === 'admin' || userRole === 'agent') && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booked By</p>
                              <p className="font-bold text-luxury-dark">{booking.bookedBy || 'client'}</p>
                            </div>
                          )}
                        </div>

                        {(userRole === 'admin' || (userRole === 'agent' && userPermissions?.editBookings)) && (
                          <div className="mt-8 pt-8 border-t border-luxury-dark/5">
                            <div className="flex flex-col lg:flex-row gap-8">
                              {/* New Payment Ledger Section */}
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold flex items-center gap-2">
                                    <History size={12} className="text-luxury-gold" />
                                    Payment Ledger
                                  </p>
                                  <p className="text-[10px] font-bold text-luxury-dark/20 uppercase tracking-widest">
                                    {booking.payments?.length || 0} Entries
                                  </p>
                                </div>
                                
                                <div className="bg-luxury-dark/[0.02] rounded-2xl border border-luxury-dark/5 overflow-hidden">
                                  {booking.payments && booking.payments.length > 0 ? (
                                    <div className="divide-y divide-luxury-dark/5">
                                      {booking.payments.map((p: any, idx: number) => (
                                        <div key={idx} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                              <IndianRupee size={12} />
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-luxury-dark">₹{p.amount.toLocaleString()}</p>
                                              <p className="text-[9px] text-luxury-dark/40 font-medium uppercase tracking-wider">{p.note}</p>
                                            </div>
                                          </div>
                                          <p className="text-[9px] text-luxury-dark/30 font-mono">
                                            {format(new Date(p.date), 'dd MMM, HH:mm')}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-8 text-center">
                                      <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest italic">No payment entries found</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Add Payment Form */}
                              <div className="w-full lg:w-[320px] space-y-4">
                                <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold">Record Installment</p>
                                <div className="bg-white p-5 rounded-2xl border border-luxury-gold/20 shadow-sm space-y-4">
                                  <div className="space-y-2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-dark/40 text-xs font-bold">₹</span>
                                      <input 
                                        type="number"
                                        placeholder="Amount"
                                        value={paymentInputs[booking.id] || ''}
                                        onChange={(e) => setPaymentInputs(prev => ({...prev, [booking.id]: e.target.value}))}
                                        className="w-full pl-7 pr-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold text-sm font-bold shadow-inner"
                                      />
                                    </div>
                                    <input 
                                      type="text"
                                      placeholder="Installment Detail (e.g. Advance)"
                                      value={paymentNotes[booking.id] || ''}
                                      onChange={(e) => setPaymentNotes(prev => ({...prev, [booking.id]: e.target.value}))}
                                      className="w-full px-4 py-2 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold text-[10px] font-bold tracking-wider"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => handleUpdatePayment(booking.id, booking)}
                                    disabled={!paymentInputs[booking.id]}
                                    className="w-full py-3 bg-luxury-dark text-white text-[10px] font-bold rounded-xl hover:bg-luxury-gold hover:text-luxury-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-[0.2em]"
                                  >
                                    Add Payment
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Status and Danger Zone */}
                            <div className="mt-8 pt-8 border-t border-luxury-dark/5">
                              <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold mb-4">Operational Status</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 uppercase tracking-widest"
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
                                    className="flex-1 px-3 py-2 bg-red-600 text-white text-[10px] font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 uppercase tracking-widest"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <button 
                                  onClick={() => {
                                    setBookingToDelete(booking);
                                    setIsConfirmModalOpen(true);
                                  }}
                                  disabled={userRole === 'agent' && !userPermissions?.deleteBookings}
                                  className="w-full px-3 py-2 border border-red-200 text-red-600 text-[10px] font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                                >
                                  <Trash2 size={12} /> Delete Booking
                                </button>
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
                        {(userRole === 'admin' || (userRole === 'agent' && userPermissions?.editBookings) || booking.status === 'pending' || (booking.status === 'confirmed' && parse(booking.checkIn, 'dd/MM/yyyy', new Date()) > new Date())) && (
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
                      <p className="font-bold text-luxury-dark">
                        {(() => {
                          if (!booking.createdAt) return 'N/A';
                          const dStr = typeof booking.createdAt === 'string' ? booking.createdAt : (booking.createdAt.toDate ? booking.createdAt.toDate().toISOString() : (booking.createdAt.seconds ? new Date(booking.createdAt.seconds * 1000).toISOString() : String(booking.createdAt)));
                          return dStr.includes(',') ? dStr.split(',')[0] : dStr.split('T')[0];
                        })()}
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest">Booked By</p>
                        <p className="font-bold text-luxury-dark">{booking.bookedBy || 'client'}</p>
                      </div>
                    )}
                  </div>

                  {/* Client View Payment History */}
                  <div className="mt-8 pt-8 border-t border-luxury-dark/5 space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-luxury-dark/40 font-bold flex items-center gap-2">
                      <History size={12} className="text-luxury-gold" />
                      Payment History
                    </p>
                    <div className="bg-luxury-dark/[0.02] rounded-2xl border border-luxury-dark/5 overflow-hidden">
                      {booking.payments && booking.payments.length > 0 ? (
                        <div className="divide-y divide-luxury-dark/5">
                          {booking.payments.map((p: any, idx: number) => (
                            <div key={idx} className="p-3 flex items-center justify-between hover:bg-white transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <IndianRupee size={12} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-luxury-dark">₹{p.amount.toLocaleString()}</p>
                                  <p className="text-[9px] text-luxury-dark/40 font-medium uppercase tracking-wider">{p.note}</p>
                                </div>
                              </div>
                              <p className="text-[9px] text-luxury-dark/30 font-mono">
                                {format(new Date(p.date), 'dd MMM, yyyy')}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest italic">No payment history available yet</p>
                        </div>
                      )}
                    </div>
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
      {isUpdateModalOpen &&  (
        <PasswordUpdateModal 
          onClose={() => setIsUpdateModalOpen(false)}
          showToast={showToast}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isGalleryDeleteConfirmOpen && (
        <ConfirmationModal 
          isOpen={isGalleryDeleteConfirmOpen}
          onClose={() => {
            setIsGalleryDeleteConfirmOpen(false);
            setGalleryImageToDelete(null);
          }}
          onConfirm={async () => {
            if (!galleryImageToDelete) return;
            try {
              await deleteDoc(doc(db, 'gallery', galleryImageToDelete.id));
              await logAdminAction('delete_gallery_image', galleryImageToDelete.id, `Deleted gallery image: ${galleryImageToDelete.title}`);
              showToast('Image removed from gallery', 'success');
              setIsGalleryDeleteConfirmOpen(false);
              setGalleryImageToDelete(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.DELETE, `gallery/${galleryImageToDelete.id}`);
              showToast('Failed to delete image', 'error');
            }
          }}
          title="Delete Gallery Image"
          message={`Are you sure you want to delete "${galleryImageToDelete?.title}" from the gallery?`}
          confirmText="Delete"
          type="danger"
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isClearCacheConfirmOpen && (
        <ConfirmationModal 
          isOpen={isClearCacheConfirmOpen}
          onClose={() => setIsClearCacheConfirmOpen(false)}
          onConfirm={() => clearAppCache(true)}
          title="Clear App Cache & Cookies"
          message="This will clear all local data, cookies, and your current session. The app will reload and you will need to log in again. Continue?"
          confirmText="Clear & Refresh"
          type="danger"
        />
      )}
    </AnimatePresence>
  </div>
</motion.div>
);
};
const Navbar = ({ 
  onBookNow, 
  onLogin, 
  user, 
  userRole, 
  onMyBookings,
  unreadCount,
  notifications,
  onNotificationClick,
  soundEnabled,
  onToggleSound
}: { 
  onBookNow: () => void; 
  onLogin: () => void;
  user: any;
  userRole: string | null;
  onMyBookings: () => void;
  unreadCount: number;
  notifications: any[];
  onNotificationClick: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Amenities', href: '/amenities' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Location', href: '/location' },
    { name: 'Blog', href: '/blog' },
  ];

  const handleSignOut = () => {
    // Delay sign out to allow restricted components to unmount
    setTimeout(() => signOut(auth), 100);
  };

  const isNavSolid = isScrolled || !isHomePage;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isNavSolid ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img 
            src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
            alt="Unique Farmhouse Logo" 
            className="h-10 sm:h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className={`text-xl sm:text-2xl font-serif font-bold tracking-tighter leading-none ${isNavSolid ? 'text-luxury-dark' : 'text-white'}`}>UNIQUE</span>
            <span className={`text-[8px] sm:text-[10px] tracking-[0.4em] uppercase -mt-0.5 ${isNavSolid ? 'text-luxury-gold' : 'text-white/80'}`}>Farmhouse</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href} 
              className={`text-sm font-medium tracking-wide hover:text-luxury-gold transition-colors ${isNavSolid ? 'text-luxury-dark' : 'text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-white/20" />

          {user ? (
            <div className="flex items-center gap-4">
              {(userRole === 'admin' || userRole === 'agent') && (
                <div className="flex items-center gap-2 mr-2">
                  <button 
                    onClick={onToggleSound}
                    className={`p-2 rounded-xl transition-all ${isNavSolid ? 'hover:bg-luxury-dark/5 text-luxury-dark/60' : 'hover:bg-white/10 text-white/60'}`}
                    title={soundEnabled ? "Disable Notification Sound" : "Enable Notification Sound"}
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifPanel(!showNotifPanel)}
                      className={`p-2 rounded-xl transition-all relative ${isNavSolid ? 'hover:bg-luxury-dark/5 text-luxury-dark/60' : 'hover:bg-white/10 text-white/60'}`}
                    >
                      {unreadCount > 0 ? (
                        <BellRing size={18} className="text-luxury-gold animate-bounce" />
                      ) : (
                        <Bell size={18} />
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {showNotifPanel && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNotifPanel(false)}
                            className="fixed inset-0 z-40"
                          />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-luxury-dark/5 overflow-hidden z-50"
                          >
                            <div className="p-5 border-b border-luxury-dark/5 flex justify-between items-center bg-luxury-dark text-white">
                              <h5 className="text-xs font-bold uppercase tracking-widest">Notifications</h5>
                              <button 
                                onClick={() => {
                                  // In a real app, clear all notifications in Firestore
                                  // setNotifications([]);
                                }}
                                className="text-[9px] font-bold opacity-60 hover:opacity-100"
                              >
                                Mark all as read
                              </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                              {notifications.length > 0 ? (
                                notifications.map((notif: any) => (
                                  <div 
                                    key={notif.id} 
                                    className={`p-4 border-b border-luxury-dark/5 hover:bg-luxury-cream/30 transition-colors cursor-pointer ${!notif.read ? 'bg-luxury-gold/5' : ''}`}
                                  >
                                    <div className="flex gap-3">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                        notif.type === 'lead' ? 'bg-red-100 text-red-600' : 
                                        notif.type === 'booking' ? 'bg-emerald-100 text-emerald-600' : 
                                        'bg-blue-100 text-blue-600'
                                      }`}>
                                        {notif.type === 'lead' ? <Zap size={14} /> : <Calendar size={14} />}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-luxury-dark">{notif.title}</p>
                                        <p className="text-[10px] text-luxury-dark/60 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-[9px] text-luxury-dark/30 mt-2 font-medium">
                                          {format(new Date(notif.createdAt), 'hh:mm a, MMM dd')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-10 text-center">
                                  <Bell className="mx-auto text-luxury-dark/10 mb-3" size={24} />
                                  <p className="text-xs text-luxury-dark/30 italic">No new notifications</p>
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                onMyBookings();
                                setShowNotifPanel(false);
                              }}
                              className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-luxury-dark bg-luxury-cream/50 hover:bg-luxury-gold transition-colors"
                            >
                              View All Updates
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              <button 
                onClick={onMyBookings}
                className={`flex items-center gap-2 text-sm font-medium hover:text-luxury-gold transition-colors ${isNavSolid ? 'text-luxury-dark' : 'text-white'}`}
              >
                {userRole === 'admin' ? <LayoutDashboard size={18} /> : userRole === 'agent' ? <LayoutDashboard size={18} /> : <History size={18} />}
                {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'agent' ? 'Agent Dashboard' : 'My Bookings'}
              </button>
              {(userRole === 'admin' || userRole === 'agent') && (
                <span className="px-2 py-0.5 bg-luxury-gold text-luxury-dark text-[10px] font-bold rounded uppercase tracking-widest">{userRole}</span>
              )}
              <button 
                onClick={handleSignOut}
                className={`flex items-center gap-2 text-sm font-medium hover:text-red-500 transition-colors ${isNavSolid ? 'text-luxury-dark' : 'text-white'}`}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className={`flex items-center gap-2 text-sm font-medium hover:text-luxury-gold transition-colors ${isNavSolid ? 'text-luxury-dark' : 'text-white'}`}
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
          {isMobileMenuOpen ? <X className={isNavSolid ? 'text-luxury-dark' : 'text-white'} /> : <Menu className={isNavSolid ? 'text-luxury-dark' : 'text-white'} />}
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
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-lg font-serif text-luxury-dark hover:text-luxury-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
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
                    {userRole === 'admin' ? <LayoutDashboard size={20} /> : userRole === 'agent' ? <LayoutDashboard size={20} /> : <History size={20} />}
                    {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'agent' ? 'Agent Dashboard' : 'My Bookings'}
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
  const subtitle = settings?.subtitle || "Welcome to Noida's Finest Retreat in Sector 135";
  const description = settings?.description || "Premium Private Villa / Farmhouse Stay in Noida Sector 135. Also known as Unique Farm House or Unique Farms, we offer a clean environment for celebrations, staycations, and unforgettable moments.";
  const highlight = settings?.highlight || "Unique Farmhouse Noida";

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

const GalleryItem = ({ img, index, onClick }: { img: any; index: number; onClick: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.8, 
        delay: (index % 3) * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      onClick={onClick}
      className="group cursor-zoom-in break-inside-avoid mb-10"
    >
      <div className="relative overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-luxury-gold/20 transition-all duration-700">
        {/* Loading Placeholder */}
        <div className={`absolute inset-0 bg-luxury-cream/50 backdrop-blur-sm transition-opacity duration-1000 z-0 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>

        <div className="absolute inset-0 bg-luxury-dark/20 group-hover:bg-transparent transition-colors duration-700 z-10" />
        
        <img 
          src={img.src} 
          alt={img.title} 
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto object-cover transition-all duration-1000 group-hover:scale-110 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'}`}
          referrerPolicy="no-referrer"
        />

        {/* Hover Overlay Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md text-luxury-dark flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
            <Maximize size={24} />
          </div>
        </div>
      </div>

      {/* Permanent Caption Below */}
      <div className="mt-5 px-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold font-bold">
            {img.category}
          </span>
          <div className="h-px flex-1 bg-luxury-gold/20" />
        </div>
        <h3 className="text-xl font-serif text-luxury-dark group-hover:text-luxury-gold transition-colors duration-500 leading-tight">
          {img.title}
        </h3>
      </div>
    </motion.div>
  );
};

const Gallery = ({ onImageClick, images: firestoreImages, activeCategory, onCategoryChange }: { onImageClick: (img: any) => void; images?: any[]; activeCategory: string; onCategoryChange: (cat: string) => void }) => {
  // Combine Firestore images with fallback images, avoiding duplicates by src
  const firestoreSrcs = new Set((firestoreImages || []).map(img => img.src));
  const uniqueFallbackImages = GALLERY_FALLBACK_IMAGES.filter(img => !firestoreSrcs.has(img.src));
  
  const allImages = [...(firestoreImages || []), ...uniqueFallbackImages];
  const categories = ['All', 'Villa', 'Pool', 'Interiors', 'Dining', 'Activities', 'Amenities'];
  
  const filteredImages = activeCategory === 'All' 
    ? allImages 
    : allImages.filter(img => img.category === activeCategory);

  return (
    <section id="gallery" className="py-24 px-6 bg-luxury-cream/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Visual Journey</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-luxury-dark leading-tight">
                Peek Inside Our <span className="italic text-luxury-gold">Sanctuary</span>
              </h2>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`relative px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 overflow-hidden group ${
                  activeCategory === cat 
                    ? 'text-white shadow-xl shadow-luxury-dark/10' 
                    : 'text-luxury-dark/60 hover:text-luxury-dark bg-white border border-luxury-dark/5 hover:border-luxury-dark/20'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-luxury-dark"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, index) => (
              <GalleryItem 
                key={img.id || img.src}
                img={img}
                index={index}
                onClick={() => onImageClick(img)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredImages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center bg-white rounded-[3rem] border border-luxury-dark/5 shadow-sm mt-8"
          >
            <Images size={48} className="mx-auto text-luxury-dark/20 mb-6" />
            <p className="text-luxury-dark/40 font-serif text-2xl">No images found in this category.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const GalleryModal = ({ image, onClose, onNext, onPrev }: { image: any, onClose: () => void, onNext?: () => void, onPrev?: () => void }) => {
  useEscapeKey(onClose, !!image);
  return (
    <AnimatePresence>
      {image && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-luxury-dark/95 backdrop-blur-2xl"
          />
          
          {/* Background blurred image for atmosphere */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <img src={image.src} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-50" />
          </motion.div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-full transition-all z-50"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 z-10">
            <div className="relative group w-full max-w-6xl flex-1 flex items-center justify-center">
              {onPrev && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrev(); }}
                  className="absolute left-0 md:-left-12 p-4 md:p-6 bg-white/5 hover:bg-white/20 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 transform -translate-x-4 group-hover:translate-x-0"
                >
                  <ChevronLeft size={32} />
                </button>
              )}
              
              <motion.div
                key={image.src}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img 
                  src={image.src} 
                  alt={image.title} 
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {onNext && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="absolute right-0 md:-right-12 p-4 md:p-6 bg-white/5 hover:bg-white/20 backdrop-blur-xl rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 transform translate-x-4 group-hover:translate-x-0"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-center text-white max-w-3xl px-6"
            >
              <span className="inline-block px-4 py-2 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-4">
                {image.category}
              </span>
              <h3 className="text-3xl sm:text-5xl font-serif mb-4 tracking-tight">{image.title}</h3>
              {image.description && <p className="text-white/60 text-base sm:text-lg leading-relaxed font-light">{image.description}</p>}
            </motion.div>
          </div>
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
  allBookings = [],
  pricingSettings
}: any) => {
  const renderDayContents = (day: number, date: Date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const price = isWeekend ? (pricingSettings?.weekend || 25000) : (pricingSettings?.weekday || 22000);
    
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
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Weekday: ₹{(pricingSettings?.weekday || 22000) / 1000}k</span>
            <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Weekend: ₹{(pricingSettings?.weekend || 25000) / 1000}k</span>
          </div>
        </div>
      </DatePicker>
    </div>
  );
};

const BookingForm = ({ isModal = false, onClose, user, editBooking, userRole, onLogin, allBookings = [], showToast, expenseCategories = [], onNotify, pricingSettings }: { 
  isModal?: boolean, 
  onClose?: () => void,
  user: FirebaseUser | null,
  editBooking?: any,
  userRole?: string | null,
  onLogin?: () => void,
  allBookings?: any[],
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  expenseCategories?: any[],
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void,
  pricingSettings?: any
}) => {
  const [name, setName] = useState(editBooking?.name || ((userRole === 'admin' || userRole === 'agent') && !editBooking ? '' : user?.displayName || ''));
  const [mobile, setMobile] = useState(editBooking?.mobile || '');
  const [email, setEmail] = useState(editBooking?.email || ((userRole === 'admin' || userRole === 'agent') && !editBooking ? '' : user?.email || ''));
  const [dayGuestAdults, setDayGuestAdults] = useState(editBooking?.dayGuestAdults || 0);
  const [dayGuestChildren, setDayGuestChildren] = useState<number[]>(editBooking?.dayGuestChildren || []);
  const [nightGuestAdults, setNightGuestAdults] = useState(editBooking?.nightGuestAdults || 0);
  const [nightGuestChildren, setNightGuestChildren] = useState<number[]>(editBooking?.nightGuestChildren || []);
  const [occasion, setOccasion] = useState(editBooking?.occasion || '');
  const [bookedBy, setBookedBy] = useState(editBooking?.bookedBy && !['admin_for_client', 'admin_personal', 'client', 'agent_for_client'].includes(editBooking.bookedBy) ? editBooking.bookedBy : '');
  const [checkIn, setCheckIn] = useState<Date | null>(editBooking?.checkIn ? parse(editBooking.checkIn, 'dd/MM/yyyy', new Date()) : null);
  const [checkOut, setCheckOut] = useState<Date | null>(editBooking?.checkOut ? parse(editBooking.checkOut, 'dd/MM/yyyy', new Date()) : null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdminBooking, setIsAdminBooking] = useState((userRole === 'admin' || userRole === 'agent') && !editBooking);
  const [hasSetDefaultBookingMode, setHasSetDefaultBookingMode] = useState(false);
  const [bookingAmount, setBookingAmount] = useState<number>(editBooking?.bookingAmount || (editBooking ? (editBooking.totalAmount - (editBooking.securityDeposit || pricingSettings?.security || 5000)) : 0));
  const [securityAmount, setSecurityAmount] = useState<number>(editBooking?.securityDeposit || pricingSettings?.security || 5000);
  const [selectedAddons, setSelectedAddons] = useState<any[]>(editBooking?.addons || []);

  useEffect(() => {
    if ((userRole === 'admin' || userRole === 'agent') && !editBooking && !hasSetDefaultBookingMode) {
      setIsAdminBooking(true);
      setHasSetDefaultBookingMode(true);
    }
  }, [userRole, editBooking, hasSetDefaultBookingMode]);

  const [amountPaid, setAmountPaid] = useState<number>(editBooking?.amountPaid || 0);
  const [payments, setPayments] = useState<any[]>(editBooking?.payments || []);
  const [expenses, setExpenses] = useState<any[]>(editBooking?.expenses || []);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const isPowerUser = userRole === 'admin' || userRole === 'agent' || isAdminBooking;

  useEffect(() => {
    if ((userRole === 'admin' || userRole === 'agent') && isAdminBooking) {
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
      
      let totalNights = 0;
      while (current < end) {
        totalNights++;
        const day = current.getDay(); 
        if (day === 5 || day === 6) { 
          total += (pricingSettings?.weekend || 25000);
        } else {
          total += (pricingSettings?.weekday || 22000);
        }
        current.setDate(current.getDate() + 1);
      }
      if (totalNights === 0) totalNights = 1;
      
      const addonsTotal = selectedAddons.reduce((sum, addon) => {
        const price = Number(addon.price) || 0;
        const qty = addon.quantity || 1;
        const type = addon.type || 'flat';
        
        if (type === 'flat') return sum + price;
        if (type === 'per_night') return sum + (price * totalNights);
        if (type === 'per_unit') return sum + (price * qty);
        if (type === 'per_unit_per_night') return sum + (price * qty * totalNights);
        return sum + price;
      }, 0);
      
      setBookingAmount(total + addonsTotal);
    }
  }, [checkIn, checkOut, editBooking, pricingSettings, selectedAddons]);

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
    const isWeekend = ['Friday', 'Saturday'].includes(format(date, 'EEEE'));
    const booking = allBookings.find(b => {
      if (b.status === 'cancelled') return false;
      const start = parse(b.checkIn, 'dd/MM/yyyy', new Date());
      const end = parse(b.checkOut, 'dd/MM/yyyy', new Date());
      return date >= start && date < end;
    });
    
    let classes = [];
    if (isWeekend) classes.push('weekend');
    if (booking) classes.push(`sold-out booking-${booking.status}`);
    
    return classes.length > 0 ? classes.join(' ') : undefined;
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

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        showToast('Invalid coupon code', 'error');
      } else {
        const couponData = snap.docs[0].data();
        if (couponData.isActive === false) {
           showToast('This coupon is currently inactive', 'error');
           return;
        }
        if (couponData.expiryDate && new Date(couponData.expiryDate) < new Date()) {
           showToast('This coupon has expired', 'error');
           return;
        }
        setAppliedCoupon(couponData);
        showToast('Coupon applied successfully!', 'success');
      }
    } catch (e) {
      showToast('Error validating coupon', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const discountedBookingAmount = useMemo(() => {
    if (!appliedCoupon) return bookingAmount;
    if (appliedCoupon.type === 'percent') {
      return bookingAmount - (bookingAmount * (appliedCoupon.discount / 100));
    } else {
      return Math.max(0, bookingAmount - appliedCoupon.discount);
    }
  }, [bookingAmount, appliedCoupon]);

  const totalAmount = discountedBookingAmount + securityAmount;

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleBookNow triggered');
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
      
      if (checkInDate < today && !editBooking && (userRole !== 'admin' && userRole !== 'agent')) {
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
      
      if (hasConflict && (userRole !== 'admin' && userRole !== 'agent')) {
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
    
    if (dayGuestAdults + dayGuestChildren.length + nightGuestAdults + nightGuestChildren.length < 1) {
      newErrors.guests = "At least 1 guest (day or night) is required";
    } else if (dayGuestAdults + dayGuestChildren.length > 25) {
      newErrors.dayGuests = "Maximum 25 day guests allowed";
    }
    
    if (nightGuestAdults + nightGuestChildren.length > 12) {
      newErrors.nightGuests = "Maximum 12 night guests allowed";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      const errorMsg = Object.values(newErrors)[0];
      showToast(`Validation: ${errorMsg}`, 'error');
      return;
    }
    
    setErrors({});

    // If client is booking, use Razorpay
    const pendingAmountDue = editBooking ? (totalAmount - (editBooking.amountPaid || 0)) : totalAmount;
    if (!isAdminBooking && (userRole === 'client' || !userRole) && pendingAmountDue > 0) {
      try {
        setLoading(true);
        console.log("Creating order");
        showToast('Initializing secure payment...', 'info');
        
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: pendingAmountDue,
            receipt: `rcpt_${Date.now()}`
          })
        });

        if (!response.ok) {
          let errorMsg = 'Failed to create payment order';
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json().catch(() => ({}));
            errorMsg = errorData.error || errorData.details || errorMsg;
          } else {
            const textContent = await response.text().catch(() => '');
            console.error('Non-JSON response from create-order:', textContent.substring(0, 200));
            errorMsg = `Cloudflare Functions Missing (Status: {response.status}). To fix this, connect Cloudflare Pages to your GitHub repository instead of uploading the dist folder manually, so it deploys the functions directory.`;
          }
          throw new Error(errorMsg);
        }

        const order = await response.json();
        
        const options = {
          key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: order.amount,
          currency: order.currency,
          name: "Unique Farmhouse",
          description: `Stay from ${format(checkIn!, 'dd-MM-yyyy')} to ${format(checkOut!, 'dd-MM-yyyy')}`,
          image: "https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif",
          order_id: order.id,
          handler: async function (response: any) {
            console.log('Razorpay payment response:', response);
            try {
              setLoading(true);
              console.log("Verifying payment");
              showToast('Verifying payment...', 'info');
              
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              if (!verifyRes.ok) {
                let errorMsg = 'Payment verification failed';
                const contentType = verifyRes.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  const errorData = await verifyRes.json().catch(() => ({}));
                  errorMsg = errorData.error || errorMsg;
                } else {
                  errorMsg = `Backend Verification Failed (Status: ${verifyRes.status}). Ensure functions/ backend is running.`;
                }
                throw new Error(errorMsg);
              }

              console.log("Payment verified");
              await handleFinalConfirm(response.razorpay_payment_id);
            } catch (err: any) {
              console.error('Payment verification error:', err);
              showToast(`Error: ${err.message}`, 'error');
              setLoading(false);
            }
          },
          prefill: {
            name: name,
            email: email,
            contact: mobile
          },
          notes: {
            address: "Noida Sector 135"
          },
          theme: {
            color: "#D4AF37"
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              showToast('Payment cancelled', 'info');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error('Payment initialization error:', err);
        const errMsg = err.message || '';
        if (errMsg.includes('Failed to fetch') || errMsg.includes('Unexpected token')) {
          showToast('CORS Error: AI Studio URL cannot be used directly from your domain. Deploy the backend (functions folder) to Cloudflare or a real server.', 'error');
        } else {
          showToast(`Error: ${errMsg || 'Could not initialize payment. Please try again.'}`, 'error');
        }
        setLoading(false);
      }
    } else {
      await handleFinalConfirm();
    }
  };

  const handleFinalConfirm = async (razorpayPaymentId?: string) => {
    setLoading(true);
    showToast('Processing your booking...', 'info');
    
    const pendingAmountDue = editBooking ? (totalAmount - (editBooking.amountPaid || 0)) : totalAmount;
    const securityDeposit = securityAmount;

    try {
      let finalUid = editBooking ? editBooking.uid : (isAdminBooking ? 'admin_manual' : (user?.uid || 'guest'));
      
      if (isAdminBooking && !editBooking && email) {
        try {
          const userQuery = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            finalUid = userSnapshot.docs[0].id;
          }
        } catch (e) {
          console.error('Error finding user by email:', e);
        }
      }

      const totalPaidAmount = (payments ? payments.reduce((sum, p) => sum + p.amount, 0) : 0) + (razorpayPaymentId ? pendingAmountDue : 0);
      const updatedPayments = payments || [];
      if (razorpayPaymentId) {
        updatedPayments.push({
          amount: pendingAmountDue,
          note: 'Razorpay Online Payment',
          date: format(new Date(), 'yyyy-MM-dd'),
          paymentId: razorpayPaymentId
        });
      }

      const bookingData = {
        uid: finalUid,
        checkIn: checkIn && isValid(checkIn) ? format(checkIn, 'dd/MM/yyyy') : '',
        checkOut: checkOut && isValid(checkOut) ? format(checkOut, 'dd/MM/yyyy') : '',
        dayGuestAdults: Number(dayGuestAdults) || 0,
        dayGuestChildren: dayGuestChildren || [],
        nightGuestAdults: Number(nightGuestAdults) || 0,
        nightGuestChildren: nightGuestChildren || [],
        status: editBooking ? editBooking.status : (isAdminBooking ? 'confirmed' : 'pending'),
        originalBookingAmount: Number(bookingAmount) || 0,
        bookingAmount: Number(discountedBookingAmount) || 0,
        totalAmount: Number(discountedBookingAmount + securityAmount) || 0,
        appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discount: appliedCoupon.discount, type: appliedCoupon.type } : null,
        addons: selectedAddons,
        amountPaid: Number(totalPaidAmount) || 0,
        securityDeposit: Number(securityAmount) || 0,
        expenses: expenses || [],
        paymentStatus: totalPaidAmount >= (discountedBookingAmount + securityAmount) ? 'paid' : (totalPaidAmount > 0 ? 'part-paid' : 'unpaid'),
        createdAt: editBooking ? editBooking.createdAt : serverTimestamp(),
        name: name || '',
        mobile: mobile || '',
        email: (email || '').toLowerCase(),
        occasion: occasion || '',
        payments: updatedPayments,
        bookedBy: (userRole === 'admin' || userRole === 'agent') ? (bookedBy || (isAdminBooking ? (userRole === 'admin' ? 'admin_for_client' : 'agent_for_client') : 'admin_personal')) : 'client',
        paymentMethod: razorpayPaymentId ? 'card' : (paymentMethod || 'upi')
      };

      console.log('Submitting booking data:', bookingData);

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
        if (onNotify) {
          onNotify('Booking Updated', `Booking for ${name} has been updated.`, 'info');
        }
      } else {
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        console.log('Booking created with ID:', docRef.id);
        
        await setDoc(doc(db, 'availability', docRef.id), {
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          status: bookingData.status
        });
        
        if (userRole === 'admin') {
          await logAdminAction('create_booking', docRef.id, `Created manual booking for ${name}`);
        }
        if (onNotify) {
          onNotify('New Booking', `A new booking has been created for ${name}.`, 'success');
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
      
      setSuccess(true);
      
      try {
        window.open(`https://wa.me/919313501001?text=${message}`, '_blank');
      } catch (popupErr) {
        console.warn('Popup blocked or failed to open WhatsApp:', popupErr);
      }
      
      showToast('Booking successful!', 'success');
    } catch (err) {
      console.error('Final confirm error:', err);
      // Detailed error toast
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast(`Booking failed: ${errorMsg}`, 'error');
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
              
              {selectedAddons.length > 0 && (
                <div className="pt-4 border-t border-luxury-dark/5">
                  <p className="text-[10px] text-luxury-dark/30 uppercase tracking-widest mb-2">Selected Add-ons</p>
                  <div className="space-y-1.5">
                    {selectedAddons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <p className="text-sm text-luxury-dark/70">{addon.name}</p>
                        <p className="font-bold text-luxury-dark text-sm">₹{Number(addon.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
              <p className="text-xs text-luxury-dark/40 font-black uppercase tracking-widest text-emerald-600">Pay via UPI (No processing fees)</p>
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
              required={!isAdminBooking}
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
              required={!isAdminBooking}
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

      <div className={`grid grid-cols-1 ${(userRole === 'admin' || userRole === 'agent') ? 'md:grid-cols-2' : ''} gap-5`}>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Email Address</label>
          <div className="relative">
            <input 
              type="email" 
              required={!isAdminBooking}
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


<div className="space-y-2 pt-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Available Add-ons</label>
          {pricingSettings?.addons && pricingSettings.addons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pricingSettings.addons.map((addon, idx) => {
              const selectedItem = selectedAddons.find(a => a.name === addon.name);
              const isSelected = !!selectedItem;
              return (
                <div 
                  key={idx}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest && (e.target as HTMLElement).closest('.addon-qty-btn')) return;
                    if (isSelected) {
                      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                    } else {
                      setSelectedAddons([...selectedAddons, { ...addon, quantity: 1 }]);
                    }
                  }}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected ? 'border-luxury-gold bg-luxury-gold/5 shadow-sm' : 'border-black/5 bg-luxury-cream hover:border-luxury-gold/50'
                  }`}
                >
                  <div className="flex flex-col gap-1 w-full overflow-hidden mr-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-luxury-gold border-luxury-gold' : 'border-luxury-dark/20'
                      }`}>
                        {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span className="text-sm font-medium text-luxury-dark truncate" style={{wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2'}}>{addon.name}</span>
                    </div>
                    {isSelected && (addon.type === 'per_unit' || addon.type === 'per_unit_per_night') && (
                      <div className="pl-7 flex items-center gap-2 mt-1">
                        <button 
                          type="button"
                          className="addon-qty-btn w-5 h-5 rounded border border-luxury-dark/10 flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-colors text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedItem && selectedItem.quantity > 1) {
                              setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: a.quantity - 1 } : a));
                            } else {
                              setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                            }
                          }}
                        >-</button>
                        <span className="text-[10px] font-bold w-4 text-center">{selectedItem?.quantity || 1}</span>
                        <button 
                          type="button"
                          className="addon-qty-btn w-5 h-5 rounded border border-luxury-dark/10 flex items-center justify-center text-luxury-dark hover:bg-luxury-gold hover:text-white hover:border-luxury-gold transition-colors text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: (a.quantity || 1) + 1 } : a));
                          }}
                        >+</button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                     <span className="text-[11px] font-bold text-luxury-gold">+₹{Number(addon.price).toLocaleString()}</span>
                     {addon.type === 'per_night' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ night</span>}
                     {addon.type === 'per_unit' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ unit</span>}
                     {addon.type === 'per_unit_per_night' && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">/ unit / nt</span>}
                     {(!addon.type || addon.type === 'flat') && <span className="text-[8px] uppercase tracking-widest text-luxury-dark/40">flat</span>}
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
             <div className="text-xs text-luxury-dark/40 italic px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl">No add-ons available. (Admin hasn't configured any yet)</div>
          )}
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
              pricingSettings={pricingSettings}
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
              minDate={userRole === 'admin' ? undefined : new Date()}
              filterDate={(date: Date) => userRole === 'admin' ? true : !excludeCheckInDates.some(d => d.toDateString() === date.toDateString())}
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
              pricingSettings={pricingSettings}
              selected={checkOut}
              onChange={(date: Date) => {
                setCheckOut(date);
                if (errors.checkOut) setErrors(prev => {
                  const next = {...prev};
                  delete next.checkOut;
                  return next;
                });
              }}
              minDate={userRole === 'admin' ? undefined : (checkIn ? addDays(checkIn, 1) : new Date())}
              filterDate={(date: Date) => userRole === 'admin' ? true : !excludeCheckOutDates.some(d => d.toDateString() === date.toDateString())}
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
              required={!isPowerUser}
              value={bookingAmount}
              onChange={(e) => setBookingAmount(parseInt(e.target.value) || 0)}
              readOnly={userRole !== 'admin' && userRole !== 'agent'}
              className={`w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm font-bold ${userRole !== 'admin' && userRole !== 'agent' ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
            <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
          <div className="flex gap-4 px-1">
            <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-luxury-gold" />
              Weekday: ₹{(pricingSettings?.weekday || 22000).toLocaleString()}
            </p>
            <p className="text-[9px] text-luxury-dark/40 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-luxury-gold" />
              Weekend: ₹{(pricingSettings?.weekend || 25000).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Security Deposit (₹)</label>
          <div className="relative">
            <input 
              type="number" 
              required={!isPowerUser}
              value={securityAmount}
              onChange={(e) => setSecurityAmount(parseInt(e.target.value) || 0)}
              readOnly={userRole !== 'admin' && userRole !== 'agent'}
              className={`w-full px-4 py-3 bg-luxury-cream border border-black/5 rounded-xl focus:outline-none focus:border-luxury-gold transition-colors text-sm font-bold ${userRole !== 'admin' && userRole !== 'agent' ? 'opacity-70 cursor-not-allowed' : ''}`} 
            />
            <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-dark/20" size={16} />
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="space-y-4 pt-4 border-t border-luxury-dark/5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Payment History</label>
            <button 
              type="button"
              onClick={() => setPayments([...payments, { amount: 0, note: '', date: format(new Date(), 'yyyy-MM-dd') }])}
              className="text-[9px] font-bold text-luxury-gold hover:text-luxury-dark uppercase tracking-widest flex items-center gap-1"
            >
              <Plus size={12} /> Add Payment
            </button>
          </div>
          
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div key={index} className="p-4 bg-luxury-cream rounded-2xl border border-black/5 space-y-3 relative group">
                <button 
                  type="button"
                  onClick={() => setPayments(payments.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1 text-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      value={payment.amount}
                      onChange={(e) => {
                        const newPayments = [...payments];
                        newPayments[index].amount = parseInt(e.target.value) || 0;
                        setPayments(newPayments);
                      }}
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Date</label>
                    <input 
                      type="date"
                      required
                      value={payment.date}
                      onChange={(e) => {
                        const newPayments = [...payments];
                        newPayments[index].date = e.target.value;
                        setPayments(newPayments);
                      }}
                      className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase tracking-widest font-bold text-luxury-dark/30">Note</label>
                  <input 
                    type="text"
                    placeholder="Advance, Partial, Security..."
                    value={payment.note}
                    onChange={(e) => {
                      const newPayments = [...payments];
                      newPayments[index].note = e.target.value;
                      setPayments(newPayments);
                    }}
                    className="w-full px-3 py-2 bg-white border border-black/5 rounded-lg text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>
            ))}
            
            {payments.length === 0 && (
              <p className="text-[10px] text-center text-luxury-dark/20 italic py-2">No payments recorded yet.</p>
            )}

            <div className="flex justify-between items-center px-1 pt-2 border-t border-luxury-dark/5">
              <span className="text-[9px] font-bold text-luxury-dark/40 uppercase tracking-widest">Total Paid</span>
              <span className="text-sm font-bold text-green-600">₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-bold text-luxury-dark/40 uppercase tracking-widest">Outstanding</span>
              <span className="text-sm font-bold text-luxury-dark">₹{(bookingAmount + securityAmount - payments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}</span>
            </div>
          </div>
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

      
      {selectedAddons.length > 0 && (
        <div className="space-y-1.5 px-1 pb-2 border-b border-black/5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">Add-ons Included</span>
          {selectedAddons.map((addon, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10px] text-luxury-dark/60">
              <span>{addon.name}</span>
              <span>₹{Number(addon.price).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 px-1">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">
            <span>Booking Amount</span>
            <span>₹{bookingAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-luxury-dark/40">
            <span>Security Deposit</span>
            <span>₹{securityAmount.toLocaleString()}</span>
          </div>
        </div>

        {!editBooking && (
          <div className="pt-4 border-t border-luxury-dark/5">
            <div className="flex gap-2 mb-1">
              <input 
                type="text" 
                placeholder="DISCOUNT CODE" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                disabled={!!appliedCoupon}
                className="flex-grow px-3 py-2 bg-luxury-cream/50 border border-luxury-dark/5 rounded-xl text-[10px] font-bold focus:outline-none uppercase disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button 
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                    showToast('Coupon removed', 'info');
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  Clear
                </button>
              ) : (
                <button 
                  type="button"
                  disabled={isApplyingCoupon}
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-luxury-dark text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {appliedCoupon && (
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">
                Discount Applied: -₹{(bookingAmount - discountedBookingAmount).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="p-4 bg-luxury-dark/5 rounded-xl flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-luxury-dark/60 uppercase tracking-widest">Total Amount</span>
          <span className="text-xl font-serif font-bold text-luxury-dark">₹{totalAmount.toLocaleString()}</span>
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

const BookingModal = ({ isOpen, onClose, user, userRole, onLogin, allBookings, showToast, expenseCategories = [], onNotify, pricingSettings }: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: FirebaseUser | null, 
  userRole: string | null, 
  onLogin: () => void, 
  allBookings: any[], 
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void,
  expenseCategories?: any[],
  onNotify?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void,
  pricingSettings?: any
}) => {
  useEscapeKey(onClose, isOpen);
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
              <BookingForm isModal onClose={onClose} user={user} userRole={userRole} onLogin={onLogin} allBookings={allBookings} showToast={showToast} expenseCategories={expenseCategories} onNotify={onNotify} pricingSettings={pricingSettings} />
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
            <h2 className="section-title text-left text-3xl sm:text-4xl md:text-5xl">Book Your Farmhouse Experience</h2>
            <p className="text-luxury-dark/60 mb-8 text-base sm:text-lg">
              Ready for an unforgettable stay? Our premium 4BHK <strong>farmhouse in Noida Sector 135 for party</strong> and staycations is waiting for you. Experience the pinnacle of luxury, privacy, and a <strong>clean environment</strong> in Noida.
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

const SEOContent = () => {
  return (
    <section className="py-16 sm:py-24 px-6 bg-luxury-cream/30">
      <div className="max-w-4xl mx-auto prose prose-luxury prose-sm sm:prose-base lg:prose-lg">
        <h2 className="section-title text-left text-3xl sm:text-4xl mb-8">Ultimate Guide to Booking the Best Farmhouse in Noida for Parties and Stays</h2>
        
        <div className="space-y-12 text-luxury-dark/80 leading-relaxed">
          <div id="about-detailed">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">About Unique Farmhouse Noida (Unique Farms)</h3>
            <p>
              Welcome to <strong>Unique Farmhouse Noida</strong>, your premier destination for luxury farm stays and private celebrations in the heart of Uttar Pradesh. Also known as <strong>Unique Farm House</strong> or simply <strong>Unique Farms</strong>, we provide an unparalleled experience that combines the serenity of nature with the comforts of a high-end villa. Whether you are looking for a <strong>Farmhouse in Noida</strong> for a quiet weekend getaway or a <strong>Farm house in Noida</strong> to host a grand birthday party, we have the perfect space for you.
            </p>
            <p>
              Our property is strategically located in <strong>Sector 135, Noida</strong>, making it easily accessible for residents of Noida, Greater Noida, and Delhi. We pride ourselves on being one of the most sought-after <strong>Farmhouse in Delhi NCR</strong> and <strong>Farm house in Delhi NCR</strong> options, offering a sanctuary away from the city's hustle while remaining close to major urban hubs.
            </p>
          </div>

          <div id="amenities-detailed">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">World-Class Amenities & Clean Environment</h3>
            <p>
              At Unique Farmhouse, we believe that luxury lies in the details and a <strong>clean environment</strong>. Our <strong>Luxury villa in Noida</strong> is equipped with state-of-the-art facilities designed to cater to your every need. 
            </p>
            <ul>
              <li><strong>Private Swimming Pool:</strong> If you are searching for a <strong>swimming pool near me</strong> in Noida, look no further. Dive into our crystal-clear pool, perfect for summer pool parties. We are a top-rated <strong>Farmhouse with pool in Noida</strong>.</li>
              <li><strong>Lush Green Gardens:</strong> Our expansive party lawn is perfect for those looking for a <strong>farmhouse in Noida Sector 135 for party</strong>.</li>
              <li><strong>Hygienic Stay:</strong> We maintain a strictly <strong>clean environment</strong> with regular sanitization, ensuring a safe stay for families and groups.</li>
              <li><strong>Spacious Bedrooms:</strong> Experience comfort in our well-appointed rooms featuring premium bedding for a perfect <strong>Weekend getaway near Delhi</strong>.</li>
              <li><strong>Fully Equipped Kitchen:</strong> Cook your favorite meals or hire our professional catering services for your events.</li>
              <li><strong>High-Speed Wi-Fi & Entertainment:</strong> Stay connected and entertained with our high-speed internet and sound systems.</li>
              <li><strong>Unique Farms Photos:</strong> Browse our gallery to see high-resolution <strong>Unique Farms photos</strong> showcasing our premium interiors and lush outdoors.</li>
            </ul>
          </div>

          <div id="pricing-detailed">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Transparent Pricing for Farm house booking Noida</h3>
            <p>
              Finding an affordable yet luxurious <strong>Farm house for party in Noida</strong> can be challenging. At Unique Farmhouse, we offer competitive and transparent pricing models. Our rates vary based on the day of the week, the number of guests, and the type of event. 
            </p>
            <p>
              Whether you are searching for a <strong>Party farmhouse in Delhi NCR</strong>, a <strong>Party farmhouse in Noida</strong>, or a <strong>Private villa rental Noida</strong>, we provide customized packages. Contact us today for a detailed quote and discover why we are the top choice for <strong>Farm house booking Noida</strong>.
            </p>
          </div>

          <div id="why-choose-us">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Why Choose Unique Farmhouse for Your Next Event?</h3>
            <p>
              Choosing the right venue is crucial for the success of any event. Here is why Unique Farmhouse stands out among the <strong>best farmhouses in Noida</strong>:
            </p>
            <ol>
              <li><strong>Privacy & Security:</strong> Enjoy your private moments without any external interference in our gated property.</li>
              <li><strong>Versatility:</strong> From corporate retreats to intimate family gatherings and high-energy parties, our space adapts to your vision.</li>
              <li><strong>Location:</strong> Located in Sector 135, we are just a short drive from the Noida-Greater Noida Expressway.</li>
              <li><strong>Exceptional Service:</strong> Our dedicated staff is always on hand to ensure your stay is seamless and memorable.</li>
            </ol>
          </div>

          <div id="popular-searches">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Perfect For Every Occasion</h3>
            <p>
              Are you looking for the <strong>Best farmhouse in Noida for birthday party</strong> or a <strong>Safe farmhouse for girls party in Noida</strong>? Unique Farmhouse is your ideal choice. We offer a <strong>Luxury farm stay near Delhi NCR for families</strong> and an intimate <strong>Private pool villa in Noida for couples</strong> (also known as a <strong>Private pool farmhouse in Noida for couples</strong> or <strong>Private pool farm house in Noida for couples</strong>).
            </p>
            <p>
              Conveniently located, our <strong>Farmhouse in Sector 135 Noida for events</strong> is a top-rated <strong>Farmhouse near Noida Expressway for party</strong> and the perfect <strong>Farmhouse for pool party in Noida Sector 135</strong>. Whether you need a <strong>Budget friendly farmhouse in Noida for stay</strong> or want to know the <strong>Unique farm house Noida booking price</strong>, we offer excellent value.
            </p>
            <p>
              Our property is a <strong>Pet friendly farmhouse in Noida</strong> and a spacious <strong>Farmhouse with 4 bedrooms in Noida</strong>, making it a fantastic <strong>Overnight stay farmhouse in Noida with pool</strong>. Planning a corporate event? Book our <strong>Farmhouse for corporate outing in Noida</strong>. Need a cozier space? We are a great <strong>Small farmhouse for party in Noida</strong>.
            </p>
            <p>
              Capture beautiful memories at our <strong>Farmhouse for pre-wedding shoot in Noida</strong>, or host a grand celebration at our <strong>Farmhouse with lawn for wedding in Noida</strong>. Enjoy a <strong>Luxury farm house in Delhi NCR for weekend</strong> getaways or a romantic <strong>Farmhouse for anniversary celebration in Noida</strong>. If you are searching for the <strong>Best farm house in Noida for 20 people</strong> or simply a <strong>Farmhouse near me for party booking</strong>, look no further!
            </p>
          </div>

          <div id="faqs">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Frequently Asked Questions (FAQs)</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-luxury-dark">1. What is the capacity of the farmhouse for parties?</h4>
                <p>Our lawn can accommodate up to 100+ guests, while the villa itself is perfect for overnight stays for up to 15-20 people.</p>
              </div>
              <div>
                <h4 className="font-bold text-luxury-dark">2. Is the swimming pool private?</h4>
                <p>Yes, the pool is exclusively for the use of the guests who book the property. We ensure complete privacy.</p>
              </div>
              <div>
                <h4 className="font-bold text-luxury-dark">3. Do you allow outside catering?</h4>
                <p>Yes, we allow outside catering. We also have an in-house kitchen if you prefer to cook or bring your own chef.</p>
              </div>
              <div>
                <h4 className="font-bold text-luxury-dark">4. How do I book the farmhouse?</h4>
                <p>You can book directly through our website using the "Book Now" button or call us at +91 9313501001 for availability.</p>
              </div>
            </div>
          </div>

          <div id="local-seo-content">
            <h3 className="text-2xl font-serif text-luxury-dark mb-4">Serving Noida, Delhi NCR, and Beyond</h3>
            <p>
              If you are looking for a <strong>farmhouse in Delhi NCR</strong> or a <strong>farm house near me</strong> in the Noida region, Unique Farmhouse is your go-to destination. We serve clients from all over the National Capital Region, providing a premium alternative to crowded hotels and generic banquet halls. Our <strong>party farmhouse in Noida</strong> is specifically designed to host vibrant celebrations while maintaining a sophisticated atmosphere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const VisitorCounter = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const incrementVisitor = async () => {
      const isNewVisitor = !localStorage.getItem('hasVisited_uniquefarms');
      const counterRef = doc(db, 'settings', 'visitorCount');
      
      try {
        const docSnap = await getDoc(counterRef);
        if (!docSnap.exists()) {
          if (isNewVisitor) {
            await setDoc(counterRef, { count: 1 });
            setCount(1);
            localStorage.setItem('hasVisited_uniquefarms', 'true');
          } else {
            setCount(0); // Fallback
          }
        } else {
          if (isNewVisitor) {
            await updateDoc(counterRef, { count: increment(1) });
            setCount(docSnap.data().count + 1);
            localStorage.setItem('hasVisited_uniquefarms', 'true');
          } else {
            setCount(docSnap.data().count);
          }
        }
      } catch (err) {
        console.error("Counter error:", err);
      }
    };
    
    incrementVisitor();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2 text-white/50 text-sm mt-8 border border-white/10 rounded-full px-4 py-2 w-fit">
      <Users size={16} className="text-luxury-gold" />
      <span><strong className="text-white">{count.toLocaleString()}</strong> Unique Visitors</span>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-luxury-dark text-white py-12 sm:py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
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
            </Link>
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
            
            <VisitorCounter />
          </div>

          <div>
            <h4 className="text-lg font-serif mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/about" className="hover:text-luxury-gold transition-colors">About Us</Link></li>
              <li><Link to="/amenities" className="hover:text-luxury-gold transition-colors">Amenities</Link></li>
              <li><Link to="/gallery" className="hover:text-luxury-gold transition-colors">Gallery</Link></li>
              <li><Link to="/reviews" className="hover:text-luxury-gold transition-colors">Reviews</Link></li>
              <li><Link to="/blog" className="hover:text-luxury-gold transition-colors">Local Guide & Blog</Link></li>
              <li><Link to="/" className="hover:text-luxury-gold transition-colors">Book Now</Link></li>
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
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
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
  useEscapeKey(onClose, isOpen);
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

const CouponManagement = ({ coupons, showToast }: { coupons: any[]; showToast: (m: string, t: any) => void }) => {
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, type: 'percent', expiryDate: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newCoupon.code || newCoupon.discount <= 0) return;
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'coupons', editingId), {
          ...newCoupon,
          code: newCoupon.code.toUpperCase()
        });
        showToast('Coupon updated!', 'success');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'coupons'), {
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          isActive: true,
          createdAt: serverTimestamp()
        });
        showToast('Coupon added!', 'success');
      }
      setNewCoupon({ code: '', discount: 0, type: 'percent', expiryDate: '' });
    } catch (e) {
      showToast(editingId ? 'Failed to update coupon' : 'Failed to add coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { isActive: !currentStatus });
      showToast('Coupon status updated', 'success');
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleEditExpiry = async (id: string, currentExpiry: string) => {
    const newExpiry = window.prompt('Set new expiry date (YYYY-MM-DD), leave blank to clear:', currentExpiry || '');
    if (newExpiry !== null) {
      if (newExpiry && isNaN(Date.parse(newExpiry))) {
        showToast('Invalid date format', 'error');
        return;
      }
      try {
        await updateDoc(doc(db, 'coupons', id), { expiryDate: newExpiry });
        showToast('Expiry updated', 'success');
      } catch (e) {
        showToast('Failed to update expiry', 'error');
      }
    }
  };

  const handleEdit = (coupon: any) => {
    setNewCoupon({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      expiryDate: coupon.expiryDate || ''
    });
    setEditingId(coupon.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    // window.confirm removed for iframe compatibility
    try {
      await deleteDoc(doc(db, 'coupons', id));
      showToast('Coupon deleted', 'info');
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif font-bold text-luxury-dark">Discount Coupons</h3>
          <p className="text-sm text-luxury-dark/60">Generate promotional codes for your guests</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-luxury-dark/5 shadow-sm">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 mb-6">Create New Coupon</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <input 
              type="text" 
              placeholder="COUPON_CODE" 
              value={newCoupon.code}
              onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              className="w-full px-6 py-4 bg-gray-50 border border-luxury-dark/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-luxury-gold uppercase"
            />
          </div>
          <div>
            <input 
              type="number" 
              placeholder="Discount Value" 
              value={newCoupon.discount || ''}
              onChange={e => setNewCoupon({...newCoupon, discount: Number(e.target.value)})}
              className="w-full px-6 py-4 bg-gray-50 border border-luxury-dark/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-luxury-gold"
            />
          </div>
          <div>
            <select 
              value={newCoupon.type}
              onChange={e => setNewCoupon({...newCoupon, type: e.target.value})}
              className="w-full px-6 py-4 bg-gray-50 border border-luxury-dark/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-luxury-gold"
            >
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[8px] font-bold uppercase tracking-widest text-luxury-dark/40 mb-1 ml-1">Expiry Date (Optional)</label>
            <input 
              type="date" 
              value={(newCoupon as any).expiryDate || ''}
              onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
              className="w-full px-6 py-4 bg-gray-50 border border-luxury-dark/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-luxury-gold"
            />
          </div>
          <button 
            disabled={loading}
            onClick={handleAdd}
            className="w-full py-4 bg-luxury-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-luxury-gold hover:text-luxury-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (editingId ? 'Update Coupon' : 'Create Coupon')}
          </button>
          
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setNewCoupon({ code: '', discount: 0, type: 'percent', expiryDate: '' });
              }}
              className="w-full py-4 bg-gray-100 text-luxury-dark rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-luxury-dark/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-luxury-dark/5 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/40">Code</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/40">Discount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/40">Expiry</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/40 min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className={"border-b border-luxury-dark/5 last:border-b-0 hover:bg-gray-50/30 transition-colors " + (coupon.isActive !== false ? '' : 'bg-red-50/20')}>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-luxury-dark tracking-tight">{coupon.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-luxury-gold">
                      {coupon.type === 'percent' ? coupon.discount + '%' : '₹' + coupon.discount} OFF
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {coupon.expiryDate ? (
                        <span className="text-xs font-medium text-luxury-dark/60">
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-luxury-dark/30 italic">No Expiry</span>
                      )}
                      <button
                        onClick={() => handleEditExpiry(coupon.id, coupon.expiryDate)}
                        className="text-[10px] text-blue-500 hover:text-blue-700 underline uppercase font-bold tracking-widest"
                      >
                        Set
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={"inline-flex px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest " + (coupon.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {coupon.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center cursor-pointer group" title={coupon.isActive !== false ? 'Deactivate' : 'Activate'}>
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={coupon.isActive !== false} 
                            onChange={() => toggleCouponStatus(coupon.id, coupon.isActive !== false)} 
                          />
                          <div className={"block w-8 h-4 rounded-full transition-colors " + (coupon.isActive !== false ? 'bg-luxury-gold' : 'bg-gray-300')}></div>
                          <div className={"absolute left-1 top-1 bg-white w-2 h-2 rounded-full transition-transform " + (coupon.isActive !== false ? 'translate-x-4' : '')}></div>
                        </div>
                      </label>
                      <button 
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-xl hover:bg-blue-50"
                        title="Edit Coupon"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-luxury-dark/40 text-xs font-medium">
                    No discount coupons generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LoyaltyDashboard = ({ user, loyalty, referrals, appUsers, isAdmin, showToast }: any) => {
  const [isCopying, setIsCopying] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(loyalty.referralCode);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
    showToast('Referral code copied!', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-black text-luxury-dark tracking-tight">Privilege Club</h2>
          <p className="text-luxury-dark/55 font-medium">Your loyalty rewards and referral benefits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Points Card */}
        <div className="bg-luxury-dark text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
            <Trophy size={96} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-luxury-gold flex items-center justify-center text-luxury-dark">
                <Crown size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luxury-gold">Current Tier</p>
                <p className="text-xl font-black tracking-tight">{loyalty.tier}</p>
              </div>
            </div>
            
            <div className="mt-auto">
              <h4 className="text-4xl font-black text-white tracking-tighter mb-2">{loyalty.points}</h4>
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Total Rewards Points</p>
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <div className="bg-white rounded-[3rem] p-8 border border-luxury-dark/5 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest text-luxury-dark/30 mb-6">Invite Your Friends</h4>
            <p className="text-sm font-medium text-luxury-dark/70 leading-relaxed mb-8">
              Share your unique referral code. When a friend books their first stay, you both get <strong>500 Reward Points</strong>!
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-grow p-4 bg-gray-50 border border-luxury-dark/5 rounded-2xl font-black text-luxury-dark text-center tracking-[0.3em] uppercase">
              {loyalty.referralCode}
            </div>
            <button 
              onClick={copyCode}
              className="p-4 bg-luxury-dark text-white rounded-2xl hover:bg-luxury-gold hover:text-luxury-dark transition-all"
            >
              {isCopying ? <CheckCircle2 size={24} /> : <Copy size={24} />}
            </button>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-[3rem] p-8">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-luxury-gold mb-6">Tier Benefits</h4>
          <div className="space-y-4">
            {[
              { icon: Zap, text: 'Early Check-in Priority' },
              { icon: Gift, text: 'Complimentary Welcome Drinks' },
              { icon: Star, text: 'Exclusive 5% Member Discount' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-luxury-gold">
                  <benefit.icon size={16} />
                </div>
                <span className="text-[11px] font-bold text-luxury-dark/70 uppercase tracking-wide">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-[3.5rem] border border-luxury-dark/5 p-10 mt-12 shadow-sm">
          <h3 className="text-xl font-serif font-black text-luxury-dark mb-8">Admin: Member Loyalty Tracking</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-luxury-dark/5">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30">Member Name</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 text-center">Referrals</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 text-center">Points</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-luxury-dark/30 text-right">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-dark/5">
                {appUsers.map((appUser: any) => (
                  <tr key={appUser.id} className="hover:bg-luxury-dark/[0.02] transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-luxury-dark text-white flex items-center justify-center font-black text-[10px]">
                          {appUser.displayName?.[0] || appUser.email?.[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-luxury-dark">{appUser.displayName || 'Unknown'}</p>
                          <p className="text-[9px] font-medium text-luxury-dark/30">{appUser.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-center text-xs font-bold text-luxury-dark/60">{appUser.referralCount || 0}</td>
                    <td className="py-6 text-center text-xs font-black text-luxury-dark">{appUser.loyaltyPoints || 0} PTS</td>
                    <td className="py-6 text-right">
                      <span className="px-3 py-1 bg-luxury-gold/20 text-luxury-gold text-[9px] font-black uppercase tracking-widest rounded-lg">
                        {appUser.loyaltyTier || 'Silver'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('notif_sound_enabled') !== 'false');
  const [showPushReminder, setShowPushReminder] = useState(false);
  const [showPushBlockedReminder, setShowPushBlockedReminder] = useState(false);

  const registerPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Fetch public key from server
        const keyResponse = await fetch(BACKEND_URL + '/api/push/public-key');
        if (!keyResponse.ok) throw new Error('Failed to fetch public key');
        const vapidPublicKey = await keyResponse.text();
        
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });

          await fetch(BACKEND_URL + '/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          
          setShowPushReminder(false);
          setShowPushBlockedReminder(false);
          showToast('Notifications enabled successfully!', 'success');
        } catch (subErr) {
          console.warn('Subscription error (possibly already active):', subErr);
          setShowPushReminder(false);
        }
      } else if (permission === 'denied') {
        setShowPushReminder(false);
        setShowPushBlockedReminder(true);
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
      showToast('Could not enable notifications.', 'error');
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      const isDismissed = localStorage.getItem('push_reminder_dismissed');
      const isDismissedRecently = isDismissed && (Date.now() - parseInt(isDismissed)) < (24 * 60 * 60 * 1000);

      // Give it a moment after load
      const timer = setTimeout(() => {
        if (Notification.permission === 'default' && !isDismissedRecently) {
          setShowPushReminder(true);
        } else if (Notification.permission === 'denied' && !isDismissedRecently) {
          setShowPushBlockedReminder(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notif_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (!user || (userRole !== 'admin' && userRole !== 'agent')) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectToSSE = () => {
      // Use Cloudflare Worker URL if provided, otherwise fallback to local proxy
      const workerUrl = import.meta.env.VITE_WORKER_URL || "";
      const streamUrl = workerUrl 
        ? `${workerUrl}/api/notifications/stream?userId=${user.uid}` 
        : `/api/notifications/stream?userId=${user.uid}`;
      
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Avoid duplicate UI triggers if the user already saw a toast from local capture
          // But usually server push is more reliable for multi-user sync
          setNotifications(prev => [{
            id: Date.now(),
            ...data,
            read: false,
            createdAt: new Date()
          }, ...prev].slice(0, 50));
          
          setUnreadCount(prev => prev + 1);
          showToast(data.title + ": " + data.message, 'success');
          if (soundEnabled) {
            const audio = new Audio('https://res.cloudinary.com/dxxd8os4d/video/upload/v1740924000/notification_p9lndw.mp3');
            audio.play().catch(e => console.warn('Sound play blocked:', e));
          }
        } catch (e) {
          console.error("SSE parse error:", e);
        }
      };

      eventSource.onerror = () => {
        console.warn("SSE connection lost. Reconnecting in 5s...");
        eventSource?.close();
        reconnectTimeout = setTimeout(connectToSSE, 5000);
      };
    };

    connectToSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user, userRole, soundEnabled]);

  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [heroSettings, setHeroSettings] = useState<any>(null);
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [replyTemplates, setReplyTemplates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const allGalleryImages = useMemo(() => {
    const firestoreSrcs = new Set(galleryImages.map(img => img.src));
    const uniqueFallbackImages = GALLERY_FALLBACK_IMAGES.filter(img => !firestoreSrcs.has(img.src));
    return [...galleryImages, ...uniqueFallbackImages];
  }, [galleryImages]);

  const currentFilteredImages = useMemo(() => {
    if (galleryCategory === 'All') return allGalleryImages;
    return allGalleryImages.filter(img => img.category === galleryCategory);
  }, [allGalleryImages, galleryCategory]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio('https://res.cloudinary.com/dxxd8os4d/video/upload/v1740924000/notification_p9lndw.mp3');
    audio.play().catch(e => console.warn('Sound play blocked:', e));
  };

  const triggerNotification = async (title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    playNotificationSound();
    
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date()
    };
    
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);
    showToast(title + ": " + message, type);

    try {
      await fetch(BACKEND_URL + '/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type })
      });
    } catch (e) {
      console.warn("Notification sync failed:", e);
    }
  };

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Version check to clear stale cache
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion !== APP_VERSION) {
      clearAppCache(false); // Clean but try to keep auth
    }

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

  const handleClearCache = () => {
    // Custom modal replacement for window.confirm would be better but let's at least update the logic
    if (window.confirm('This will clear your local app data, cookies and reload the application. Continue?')) {
      clearAppCache(true);
    }
  };

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

    const unsubscribePricingSettings = onSnapshot(doc(db, 'settings', 'pricing'), (docSnap) => {
      if (docSnap.exists()) {
        setPricingSettings(docSnap.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/pricing'));

    const unsubscribeReplyTemplates = onSnapshot(doc(db, 'settings', 'replyTemplates'), (docSnap) => {
      if (docSnap.exists()) {
        setReplyTemplates(docSnap.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/replyTemplates'));

    return () => {
      unsubscribeGallery();
      unsubscribeSettings();
      unsubscribePricingSettings();
      unsubscribeReplyTemplates();
    };
  }, []);

  // Global Real-time Notification Listener for Admins/Agents
  useEffect(() => {
    if (!user || userRole === null || (userRole !== 'admin' && userRole !== 'agent')) return;

    // Listen for new leads
    const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(10));
    // Listen for new bookings
    const qBookings = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(10));

    let initialLeadsLoad = true;
    let initialBookingsLoad = true;

    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      if (initialLeadsLoad) {
        initialLeadsLoad = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const lead = change.doc.data();
          // Avoid duplicate notification if we added it ourselves
          if (lead.uid === user.uid) return;
          triggerNotification('New Lead Received', `From ${lead.name || 'Anonymous'} via ${lead.source || 'Direct'}`, 'success');
        }
      });
    }, (error) => console.error("Leads notification error:", error));

    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      if (initialBookingsLoad) {
        initialBookingsLoad = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const booking = change.doc.data();
          // Avoid duplicate notification if we added it ourselves
          if (booking.uid === user.uid) return;
          triggerNotification('New Booking Request', `By ${booking.name || 'Guest'} for ${booking.checkIn}`, 'success');
        }
      });
    }, (error) => console.error("Bookings notification error:", error));

    return () => {
      unsubscribeLeads();
      unsubscribeBookings();
    };
  }, [user?.uid, userRole]);

  // Auto-sync iCal every 30 minutes
  useEffect(() => {
    let intervalId: any;
    
    const runSync = async () => {
      try {
        const docRef = doc(db, 'settings', 'calendar_sync');
        const docSnap = await getDoc(docRef).catch(() => 
          getDocFromServer(docRef)
        );

        if (docSnap.exists() && docSnap.data().urls && docSnap.data().urls.length > 0) {
          const urls = docSnap.data().urls;
          
          const response = await fetch(BACKEND_URL + '/api/calendar/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls })
          });

          if (!response.ok) {
            throw new Error(`Server sync failed: ${response.status}`);
          }

          const result = await response.json();
          const allExternalEvents = result.events || [];

          if (allExternalEvents.length > 0) {
            const batch = writeBatch(db);
            const blockedSnapshot = await getDocs(query(collection(db, 'blocked_dates'), where('type', '==', 'external')));
            blockedSnapshot.forEach(doc => batch.delete(doc.ref));
            
            allExternalEvents.forEach((event: any) => {
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
        }
      } catch (err) {
        console.error('Auto iCal Sync error:', err);
      }
    };

    // Run once after 1 minute, then every 30 mins
    const timeoutId = setTimeout(() => {
      // Only run sync if user is admin or agent and has permissions
      if (user && (userRole === 'admin' || userRole === 'agent')) {
        runSync();
        intervalId = setInterval(runSync, 30 * 60 * 1000);
      }
    }, 60000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, userRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthError(null);
      try {
        setUser(currentUser);
        if (currentUser) {
          // Fetch user role
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef).catch(() => 
              getDocFromServer(userRef)
            );
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const isSuperAdmin = currentUser.email && currentUser.email.toLowerCase() === 'anujkumarmittal@gmail.com';
              setUserRole(isSuperAdmin ? 'admin' : userData.role);
              setUserPermissions(userData.permissions || null);
            } else {
              let role = 'client';
              let permissions = null;

              if (currentUser.email) {
                const isSuperAdmin = currentUser.email.toLowerCase() === 'anujkumarmittal@gmail.com';
                // Check if pre-authorized by email
                const q = query(collection(db, 'users'), where('email', '==', currentUser.email.toLowerCase()));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                  const placeholderDoc = querySnapshot.docs[0];
                  const placeholderData = placeholderDoc.data();
                  role = isSuperAdmin ? 'admin' : (placeholderData.role || role);
                  permissions = placeholderData.permissions || permissions;
                  // Cleanup placeholder
                  await deleteDoc(doc(db, 'users', placeholderDoc.id));
                } else if (isSuperAdmin) {
                  role = 'admin';
                }
              }
              
              setUserRole(role);
              setUserPermissions(permissions);
              
              await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                email: (currentUser.email || '').toLowerCase(),
                displayName: currentUser.displayName || 'Guest',
                role: role,
                permissions: permissions,
                isAnonymous: currentUser.isAnonymous,
                createdAt: format(new Date(), 'dd/MM/yyyy, HH:mm:ss')
              }, { merge: true });
            }
          } catch (docErr) {
            console.error("Error fetching user profile:", docErr);
            // Don't block the whole app if just the profile fetch fails but we have the user
            setUserRole('client');
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Auth state logic error:", error);
        setAuthError(error instanceof Error ? error.message : 'Failed to retrieve connection state');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const openBookingModal = () => setIsBookingModalOpen(true);
  const closeBookingModal = () => setIsBookingModalOpen(false);
  const handleSignOut = () => {
    setUserRole(null);
    setUser(null);
    setTimeout(() => signOut(auth).catch(e => console.error(e)), 100);
  };

  if (loading || authError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-luxury-dark">
        <div className="flex flex-col items-center gap-6 px-6 text-center">
          <img 
            src="https://res.cloudinary.com/dxxd8os4d/image/upload/v1772725088/Unique_Farm_House_Logo_hrzu3e.gif" 
            alt="Logo" 
            className="h-24 w-auto animate-pulse"
            referrerPolicy="no-referrer"
          />
          {authError ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 max-w-sm"
            >
              <p className="text-red-400 text-sm font-medium">Connection Error: {authError}</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-luxury-gold text-luxury-dark rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-all"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={() => clearAppCache(true)}
                  className="px-6 py-2 bg-white/10 text-white/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all"
                >
                  Hard Reset App
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-luxury-gold"
              />
            </div>
          )}
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
        unreadCount={unreadCount}
        notifications={notifications}
        onNotificationClick={() => setShowNotifPanel(!showNotifPanel)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero onBookNow={openBookingModal} settings={heroSettings} />
              <BookingSection onBookNow={openBookingModal} />
              <SEOContent />
            </>
          } />
          <Route path="/about" element={<div className="pt-24"><About /></div>} />
          <Route path="/amenities" element={<div className="pt-24"><Amenities onAmenityClick={setGalleryCategory} /></div>} />
          <Route path="/gallery" element={<div className="pt-24"><Gallery onImageClick={setSelectedImage} images={galleryImages} activeCategory={galleryCategory} onCategoryChange={setGalleryCategory} /></div>} />
          <Route path="/reviews" element={<div className="pt-24"><Reviews /></div>} />
          <Route path="/location" element={<div className="pt-24"><LocationSection /></div>} />
          <Route path="/blog" element={<div className="pt-24"><Blog /></div>} />
          <Route path="/blog/:id" element={<div className="pt-24"><BlogPost /></div>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
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
        onNotify={triggerNotification}
        pricingSettings={pricingSettings}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <GalleryModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
        onNext={() => {
          const currentIndex = currentFilteredImages.findIndex(img => img.src === selectedImage.src);
          const nextIndex = (currentIndex + 1) % currentFilteredImages.length;
          setSelectedImage(currentFilteredImages[nextIndex]);
        }}
        onPrev={() => {
          const currentIndex = currentFilteredImages.findIndex(img => img.src === selectedImage.src);
          const prevIndex = (currentIndex - 1 + currentFilteredImages.length) % currentFilteredImages.length;
          setSelectedImage(currentFilteredImages[prevIndex]);
        }}
      />
      
      <AnimatePresence>
        {isDashboardOpen && user && (
          <MyBookings 
            user={user} 
            userRole={userRole} 
            userPermissions={userPermissions}
            onClose={() => setIsDashboardOpen(false)} 
            onLogin={() => setIsAuthModalOpen(true)} 
            allBookings={allBookings} 
            showToast={showToast} 
            onLogout={handleSignOut}
            galleryImages={galleryImages}
            heroSettings={heroSettings}
            replyTemplates={replyTemplates}
            pricingSettings={pricingSettings}
            onClearCache={handleClearCache}
            notifications={notifications}
            unreadCount={unreadCount}
            showNotifPanel={showNotifPanel}
            setShowNotifPanel={setShowNotifPanel}
            setNotifications={setNotifications}
            setUnreadCount={setUnreadCount}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onNotify={triggerNotification}
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

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-24 right-8 z-50 bg-white text-luxury-dark p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-luxury-gold transition-colors border border-black/5"
          >
            <ChevronLeft size={24} className="rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

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
        {showPushReminder && (
          <PushReminder 
            onEnable={registerPushNotifications} 
            onDismiss={() => {
              setShowPushReminder(false);
              localStorage.setItem('push_reminder_dismissed', Date.now().toString());
            }} 
          />
        )}
        {showPushBlockedReminder && (
          <PushBlockedReminder 
            onDismiss={() => {
              setShowPushBlockedReminder(false);
              localStorage.setItem('push_reminder_dismissed', Date.now().toString());
            }} 
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
