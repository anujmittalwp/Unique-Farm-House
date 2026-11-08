import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Save, 
  Code2,
  RefreshCw
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured,
  getSupabaseClient 
} from '../supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onConfigUpdated: () => void;
}

export const SaaSSupabaseSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  showToast,
  onConfigUpdated,
}) => {
  const [creds, setCreds] = useState(() => getSupabaseCredentials());
  const [isTesting, setIsTesting] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleSave = () => {
    saveSupabaseCredentials(creds.url, creds.anonKey);
    showToast('Supabase settings saved! Reloading data...', 'success');
    onConfigUpdated();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      saveSupabaseCredentials(creds.url, creds.anonKey);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Please enter a valid URL and Anon Key');
      }

      const { data, error } = await client.from('saas_companies').select('count', { count: 'exact', head: true });
      if (error) {
        throw error;
      }
      showToast('Connection Successful! Supabase tables detected.', 'success');
      onConfigUpdated();
    } catch (err: any) {
      showToast('Connection failed: ' + (err.message || 'Make sure you ran the SQL Schema in Supabase SQL Editor'), 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const sampleSql = `-- 1. Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies / Tenants Table
CREATE TABLE IF NOT EXISTS saas_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    plan TEXT DEFAULT 'starter',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Users Table
CREATE TABLE IF NOT EXISTS saas_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'agent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS saas_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    source TEXT DEFAULT 'Direct',
    status TEXT NOT NULL DEFAULT 'new',
    priority TEXT DEFAULT 'medium',
    score TEXT DEFAULT 'WARM',
    remarks TEXT,
    budget TEXT,
    guests TEXT,
    city TEXT,
    booking_date DATE,
    booking_time TEXT,
    occasion TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    follow_up_date DATE,
    follow_up_time TEXT,
    follow_up_remarks TEXT,
    follow_up_type TEXT DEFAULT 'call',
    assigned_agent_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS saas_lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES saas_leads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES saas_companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    user_name TEXT NOT NULL,
    outcome TEXT DEFAULT 'none',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sampleSql);
    showToast('SQL script copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-luxury-dark/10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-luxury-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Database size={18} className="text-luxury-gold" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base">Supabase Cloud Database Settings</h3>
              <p className="text-xs text-white/70">Connect real cloud PostgreSQL database or run in local sandbox</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isConfigured 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {isConfigured ? (
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={24} className="text-amber-600 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide">
                  {isConfigured ? 'Connected to Supabase' : 'Offline Sandbox Mode Active'}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isConfigured 
                    ? 'Leads and activities are reading & writing directly to your Supabase PostgreSQL tables.' 
                    : 'Currently running seamlessly in local browser storage. Enter your Supabase credentials below to activate cloud sync.'}
                </p>
              </div>
            </div>

            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-bold underline flex items-center gap-1 shrink-0 ml-2"
            >
              Open Supabase <ExternalLink size={12} />
            </a>
          </div>

          {/* Form Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={creds.url}
                onChange={(e) => setCreds(prev => ({ ...prev, url: e.target.value }))}
                className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={creds.anonKey}
                onChange={(e) => setCreds(prev => ({ ...prev, anonKey: e.target.value }))}
                className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
              />
            </div>
          </div>

          {/* Buttons: Test & Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 py-2.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
              <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-xs font-bold bg-luxury-dark hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Save size={14} />
              <span>Save Credentials</span>
            </button>
          </div>

          {/* SQL Script Accordion */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="text-xs font-bold text-luxury-dark flex items-center gap-1.5 hover:underline"
              >
                <Code2 size={14} />
                <span>{showSql ? 'Hide SQL Setup Script' : 'View SQL Setup Script for Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={copySql}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <Copy size={12} />
                <span>Copy SQL</span>
              </button>
            </div>

            {showSql && (
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {sampleSql}
              </pre>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
