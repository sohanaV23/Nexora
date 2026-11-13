import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

const DemoAuthContext = createContext(null);

export const DEMO_COMMUNITIES = [
  { id: 'comm-1', name: 'Greenwood Heights', code: 'GWH', address: 'Plot 42, Financial District, Gachibowli', city: 'Hyderabad' },
  { id: 'comm-2', name: 'Cyber Towers Residency', code: 'CTR', address: 'Madhapur Main Road, HITEC City', city: 'Hyderabad' }
];

export const AVAILABLE_ROLES = [
  { 
    key: 'resident', 
    label: 'Resident (Owner)', 
    name: 'Rohit Sharma', 
    email: 'rohit.resident@nexora.local', 
    flat: 'Flat B-402 (Owner)', 
    community: 'Greenwood Heights',
    icon: 'User',
    badge: 'Owner-Occupant',
    tagline: 'Personal Unit Operations',
    description: 'Manage apartment dues, raise maintenance complaints with ML suggestions, book amenities, and issue gate passes.'
  },
  { 
    key: 'tenant', 
    label: 'Resident (Tenant)', 
    name: 'Priya Sundaram', 
    email: 'priya.tenant@nexora.local', 
    flat: 'Flat A-204 (Tenant)', 
    community: 'Greenwood Heights',
    icon: 'Home',
    badge: 'Active Lease Contract',
    tagline: 'Tenant Living & Rent Ledger',
    description: 'Pay monthly contractual rent, report payment receipts, view lease details, and request maintenance support.'
  },
  { 
    key: 'landlord', 
    label: 'Landlord / Property Owner', 
    name: 'Dr. Anand Kumar', 
    email: 'anand.landlord@nexora.local', 
    flat: 'Flat A-204 & B-301', 
    community: 'Greenwood Heights',
    icon: 'Key',
    badge: 'Multi-Unit Portfolio',
    tagline: 'Rental Asset Governance',
    description: 'Monitor tenant rent payouts, review lease expiration timelines, inspect unit handovers, and track property dues.'
  },
  { 
    key: 'admin', 
    label: 'Association Admin', 
    name: 'Ananya Rao', 
    email: 'ananya.admin@nexora.local', 
    flat: 'RWA President Desk', 
    community: 'Greenwood Heights',
    icon: 'Shield',
    badge: 'Full Community Operations',
    tagline: 'Society Governance & SLAs',
    description: 'Verify maintenance payments, dispatch technician tickets, track SLA breach timers, and broadcast circulars.'
  },
  { 
    key: 'worker', 
    label: 'Maintenance Worker', 
    name: 'Suresh Kumar', 
    email: 'suresh.maintenance@nexora.local', 
    flat: 'Maintenance Bay', 
    community: 'Greenwood Heights',
    icon: 'Wrench',
    badge: 'Senior Technician',
    tagline: 'Field Service Execution',
    description: 'View dispatched service tickets, start onsite work, log work completion notes, and maintain SLA resolution targets.'
  },
  { 
    key: 'security', 
    label: 'Security Staff', 
    name: 'Ramesh Singh', 
    email: 'ramesh.gate@nexora.local', 
    flat: 'Main Gate 1 Sentinel', 
    community: 'Greenwood Heights',
    icon: 'UserCheck',
    badge: 'Gate & Visitor Sentinel',
    tagline: 'Contactless Access Control',
    description: 'Scan and validate digital visitor QR codes, record arrival and departure times, and maintain gate security logs.'
  },
  { 
    key: 'super_admin', 
    label: 'Nexora Super Admin', 
    name: 'Nexora Platform Master', 
    email: 'super.admin@nexora.local', 
    flat: 'Global Headquarters', 
    community: 'All Communities (Cross-Scope)',
    icon: 'Crown',
    badge: 'Platform Master Governance',
    tagline: 'Multi-Tenant Ecosystem',
    description: 'Multi-community oversight, onboard new residential societies, audit platform security logs, and toggle community status.'
  }
];

export const DemoAuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('resident');
  const [currentCommunity, setCurrentCommunity] = useState(DEMO_COMMUNITIES[0]);
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('i18nextLng') || 'en');
  const [communities, setCommunities] = useState(DEMO_COMMUNITIES);
  const [isLoading, setIsLoading] = useState(true);

  // Check active session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await api.getMe();
        if (res.success && res.data?.user) {
          setCurrentUser(res.data.user);
          const roleKey = res.data.user.role.toLowerCase();
          setCurrentRole(roleKey);
          if (res.data.user.activeCommunity) {
            setCurrentCommunity(res.data.user.activeCommunity);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        // Not authenticated: prompt role-based login
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch communities list whenever user is authenticated
  useEffect(() => {
    async function loadCommunities() {
      try {
        const res = await api.getCommunities();
        if (res.success && res.data?.communities?.length > 0) {
          setCommunities(res.data.communities);
        }
      } catch (e) {
        // Keep fallback
      }
    }
    if (currentUser) {
      loadCommunities();
    }
  }, [currentUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data?.user) {
        setCurrentUser(res.data.user);
        const roleKey = res.data.user.role.toLowerCase();
        setCurrentRole(roleKey);
        if (res.data.user.activeCommunity) {
          setCurrentCommunity(res.data.user.activeCommunity);
        }
        return res;
      }
      throw new Error(res.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleKey) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(roleKey);
      if (res.success && res.data?.user) {
        setCurrentUser(res.data.user);
        setCurrentRole(roleKey);
        if (res.data.user.activeCommunity) {
          setCurrentCommunity(res.data.user.activeCommunity);
        }
        return res;
      }
      throw new Error(res.error?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setCurrentUser(null);
      setCurrentRole('resident');
      setIsLoading(false);
    }
  };

  const switchRole = async (roleKey) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(roleKey);
      if (res.success && res.data?.user) {
        setCurrentUser(res.data.user);
        setCurrentRole(roleKey);
        if (res.data.user.activeCommunity) {
          setCurrentCommunity(res.data.user.activeCommunity);
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchCommunity = async (commId) => {
    try {
      const res = await api.switchCommunity(commId);
      if (res.success && res.data?.activeCommunity) {
        setCurrentCommunity(res.data.activeCommunity);
      }
    } catch (err) {
      console.error('Failed to switch community:', err);
    }
  };

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <DemoAuthContext.Provider value={{
      currentUser,
      currentRole,
      currentCommunity,
      currentLanguage,
      communities,
      availableRoles: AVAILABLE_ROLES,
      isLoading,
      login,
      demoLogin,
      logout,
      switchRole,
      switchCommunity,
      switchLanguage
    }}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};
