import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  PlusCircle, 
  Check, 
  Crown,
  Briefcase
} from 'lucide-react';
import { useSaaSAuth } from '../AuthContext';
import { UserRole } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SaaSTeamModal: React.FC<Props> = ({ isOpen, onClose, showToast }) => {
  const { 
    currentCompany, 
    currentUser, 
    companies, 
    teamMembers, 
    switchCompany, 
    switchUser, 
    addNewMember, 
    addNewCompany 
  } = useSaaSAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'addMember' | 'companies' | 'addCompany'>('members');

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('agent');

  // New company form
  const [newCompName, setNewCompName] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');

  if (!isOpen) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    try {
      await addNewMember(newMemberName.trim(), newMemberEmail.trim(), newMemberRole, newMemberPhone.trim());
      showToast(`Member "${newMemberName}" added successfully`, 'success');
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      setActiveTab('members');
    } catch (err: any) {
      showToast(err.message || 'Failed to add member', 'error');
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim() || !newCompEmail.trim()) {
      showToast('Company name and email are required', 'error');
      return;
    }
    try {
      const comp = await addNewCompany(newCompName.trim(), newCompEmail.trim(), newCompPhone.trim());
      showToast(`Company "${comp.name}" created and switched!`, 'success');
      setNewCompName('');
      setNewCompEmail('');
      setNewCompPhone('');
      setActiveTab('members');
    } catch (err: any) {
      showToast(err.message || 'Failed to create company', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-luxury-dark/10 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-luxury-dark text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Building2 size={18} className="text-luxury-gold" />
            </div>
            <div>
              <h3 className="font-serif font-black text-base">Multi-Tenant & Team Access</h3>
              <p className="text-xs text-white/70">
                Active Tenant: <span className="font-bold text-amber-300">{currentCompany?.name}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 px-6 pt-2 bg-gray-50/80 gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-luxury-dark text-luxury-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users size={14} />
            Team Members ({teamMembers.length})
          </button>

          <button
            onClick={() => setActiveTab('addMember')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'addMember'
                ? 'border-luxury-dark text-luxury-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserPlus size={14} />
            + Add Member
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'companies'
                ? 'border-luxury-dark text-luxury-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Building2 size={14} />
            Switch Tenant ({companies.length})
          </button>

          <button
            onClick={() => setActiveTab('addCompany')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'addCompany'
                ? 'border-luxury-dark text-luxury-dark'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <PlusCircle size={14} />
            + New Company
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: Team Members */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-luxury-dark">Current Company Team</h4>
                  <p className="text-xs text-gray-500">Click &quot;Switch to User&quot; to test the dashboard under different roles</p>
                </div>
                <button
                  onClick={() => setActiveTab('addMember')}
                  className="text-xs bg-luxury-dark text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-black transition-all"
                >
                  <UserPlus size={12} /> Add
                </button>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {teamMembers.map((member) => {
                  const isCurrent = currentUser?.id === member.id;
                  return (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          member.role === 'owner' 
                            ? 'bg-amber-100 text-amber-800' 
                            : member.role === 'manager' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role === 'owner' ? <Crown size={18} /> : member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-luxury-dark">{member.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                You (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{member.email}</span>
                            {member.phone && <span>• {member.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                          member.role === 'owner' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : member.role === 'manager' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {member.role}
                        </span>

                        {!isCurrent && (
                          <button
                            onClick={() => {
                              switchUser(member.id);
                              showToast(`Switched view to ${member.name} (${member.role})`, 'info');
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            Switch to User
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Add Member */}
          {activeTab === 'addMember' && (
            <form onSubmit={handleAddMember} className="space-y-4">
              <h4 className="text-sm font-bold text-luxury-dark">Invite Team Member</h4>
              <div>
                <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaurav Sharma"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="agent@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                    System Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark cursor-pointer font-bold"
                  >
                    <option value="agent">Agent (View & Follow-up assigned leads)</option>
                    <option value="manager">Manager (Assign, view all, export)</option>
                    <option value="admin">Admin (Manage team & settings)</option>
                    <option value="owner">Owner (Full access)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-luxury-dark text-white rounded-xl hover:bg-black"
                >
                  Save Member
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Switch Tenant Company */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-luxury-dark">Registered SaaS Tenants</h4>
                  <p className="text-xs text-gray-500">Each company has strictly isolated leads and data</p>
                </div>
                <button
                  onClick={() => setActiveTab('addCompany')}
                  className="text-xs bg-luxury-dark text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:bg-black transition-all"
                >
                  <PlusCircle size={12} /> New Tenant
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {companies.map((comp) => {
                  const isActive = currentCompany?.id === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        switchCompany(comp.id);
                        showToast(`Switched active tenant to ${comp.name}`, 'success');
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-luxury-dark bg-luxury-dark/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-luxury-dark text-white flex items-center justify-center font-bold">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-luxury-dark">{comp.name}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                              {comp.slug}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {comp.email} • Plan: <strong className="uppercase text-amber-700">{comp.plan}</strong>
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                          <Check size={14} /> Active
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 group-hover:text-gray-600 font-medium">Select</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Register New Company */}
          {activeTab === 'addCompany' && (
            <form onSubmit={handleAddCompany} className="space-y-4">
              <h4 className="text-sm font-bold text-luxury-dark">Register New Resort / Company</h4>
              <p className="text-xs text-gray-500">Creates an isolated tenant database instance for a new client.</p>

              <div>
                <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                  Resort / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Orchid Resort & Spa"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@grandorchid.com"
                    value={newCompEmail}
                    onChange={(e) => setNewCompEmail(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 99999 88888"
                    value={newCompPhone}
                    onChange={(e) => setNewCompPhone(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-luxury-dark"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('companies')}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-luxury-dark text-white rounded-xl hover:bg-black"
                >
                  Create & Launch Tenant
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
