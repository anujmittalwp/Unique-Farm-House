import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantCompany, TenantUser, UserRole } from './types';
import { fetchCompanies, fetchUsers, createCompany, createMember } from './dataService';

interface AuthContextType {
  currentCompany: TenantCompany | null;
  currentUser: TenantUser | null;
  companies: TenantCompany[];
  teamMembers: TenantUser[];
  isLoading: boolean;
  switchCompany: (companyId: string) => void;
  switchUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  addNewCompany: (name: string, email: string, phone: string, slug?: string) => Promise<TenantCompany>;
  addNewMember: (name: string, email: string, role: UserRole, phone?: string) => Promise<TenantUser>;
  reloadAuthData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SaaSAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<TenantCompany[]>([]);
  const [currentCompany, setCurrentCompany] = useState<TenantCompany | null>(null);
  const [teamMembers, setTeamMembers] = useState<TenantUser[]>([]);
  const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allCompanies = await fetchCompanies();
      setCompanies(allCompanies);

      const savedCompanyId = localStorage.getItem('saas_active_company_id');
      const selectedCompany = allCompanies.find(c => c.id === savedCompanyId) || allCompanies[0] || null;
      setCurrentCompany(selectedCompany);

      if (selectedCompany) {
        const members = await fetchUsers(selectedCompany.id);
        setTeamMembers(members);

        const savedUserId = localStorage.getItem('saas_active_user_id');
        const selectedUser = members.find(u => u.id === savedUserId) || members[0] || null;
        setCurrentUser(selectedUser);
      }
    } catch (e) {
      console.error('Failed to load SaaS Auth data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchCompany = async (companyId: string) => {
    const target = companies.find(c => c.id === companyId);
    if (target) {
      setCurrentCompany(target);
      localStorage.setItem('saas_active_company_id', target.id);
      const members = await fetchUsers(target.id);
      setTeamMembers(members);
      if (members.length > 0) {
        setCurrentUser(members[0]);
        localStorage.setItem('saas_active_user_id', members[0].id);
      }
    }
  };

  const switchUser = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    if (member) {
      setCurrentUser(member);
      localStorage.setItem('saas_active_user_id', member.id);
    }
  };

  const switchUserRole = (newRole: UserRole) => {
    if (currentUser) {
      const updated: TenantUser = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      setTeamMembers(prev => prev.map(m => (m.id === currentUser.id ? updated : m)));
    }
  };

  const addNewCompany = async (name: string, email: string, phone: string, slug?: string): Promise<TenantCompany> => {
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newComp = await createCompany({
      name,
      slug: generatedSlug,
      email,
      phone,
      plan: 'starter',
      settings: { currency: 'INR' },
    });

    const newOwner = await createMember({
      companyId: newComp.id,
      name: name + ' Admin',
      email,
      phone,
      role: 'owner',
    });

    const refreshed = await fetchCompanies();
    setCompanies(refreshed);
    setCurrentCompany(newComp);
    localStorage.setItem('saas_active_company_id', newComp.id);

    setTeamMembers([newOwner]);
    setCurrentUser(newOwner);
    localStorage.setItem('saas_active_user_id', newOwner.id);

    return newComp;
  };

  const addNewMember = async (name: string, email: string, role: UserRole, phone?: string): Promise<TenantUser> => {
    if (!currentCompany) throw new Error('No active company selected');
    const member = await createMember({
      companyId: currentCompany.id,
      name,
      email,
      role,
      phone,
    });
    setTeamMembers(prev => [member, ...prev]);
    return member;
  };

  return (
    <AuthContext.Provider
      value={{
        currentCompany,
        currentUser,
        companies,
        teamMembers,
        isLoading,
        switchCompany,
        switchUserRole,
        switchUser,
        addNewCompany,
        addNewMember,
        reloadAuthData: loadData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSaaSAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSaaSAuth must be used within a SaaSAuthProvider');
  }
  return context;
};
