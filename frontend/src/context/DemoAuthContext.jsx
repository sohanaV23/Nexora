import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

const DemoAuthContext = createContext(null);

export const DEMO_COMMUNITIES = [
  { id: 'comm-1', name: 'Greenwood Heights', code: 'GWH', address: 'Plot 42, Financial District, Gachibowli' },
  { id: 'comm-2', name: 'Cyber Towers Residency', code: 'CTR', address: 'Madhapur Main Road, HITEC City' }
];

export const AVAILABLE_ROLES = [
  { key: 'resident', label: 'Resident (Owner)', icon: 'User' },
  { key: 'tenant', label: 'Resident (Tenant)', icon: 'Home' },
  { key: 'landlord', label: 'Landlord / Owner', icon: 'Key' },
  { key: 'admin', label: 'Association Admin', icon: 'Shield' },
  { key: 'worker', label: 'Maintenance Worker', icon: 'Wrench' },
  { key: 'security', label: 'Security Staff', icon: 'UserCheck' },
  { key: 'super_admin', label: 'Nexora Super Admin', icon: 'Crown' }
];

export const DemoAuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('resident');
  const [currentCommunity, setCurrentCommunity] = useState(DEMO_COMMUNITIES[0]);
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('i18nextLng') || 'en');
  const [communities, setCommunities] = useState(DEMO_COMMUNITIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await api.getMe();
        if (res.success && res.data.user) {
          setCurrentUser(res.data.user);
          const roleKey = res.data.user.role.toLowerCase();
          setCurrentRole(roleKey);
          if (res.data.user.activeCommunity) {
            setCurrentCommunity(res.data.user.activeCommunity);
          }
        }
      } catch (err) {
        // Fall back to resident demo login
        try {
          const demoRes = await api.demoLogin('resident');
          if (demoRes.success && demoRes.data.user) {
            setCurrentUser(demoRes.data.user);
            setCurrentRole('resident');
            if (demoRes.data.user.activeCommunity) {
              setCurrentCommunity(demoRes.data.user.activeCommunity);
            }
          }
        } catch (e) {
          console.error('Failed to init demo session:', e);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch communities list
  useEffect(() => {
    async function loadCommunities() {
      try {
        const res = await api.getCommunities();
        if (res.success && res.data.communities.length > 0) {
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

  const switchRole = async (roleKey) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(roleKey);
      if (res.success && res.data.user) {
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
      if (res.success && res.data.activeCommunity) {
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
      currentUser: currentUser || { name: 'Loading...', role: currentRole },
      currentRole,
      currentCommunity,
      currentLanguage,
      communities,
      availableRoles: AVAILABLE_ROLES,
      isLoading,
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
