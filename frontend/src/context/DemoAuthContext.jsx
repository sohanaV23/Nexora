import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DemoAuthContext = createContext(null);

export const DEMO_COMMUNITIES = [
  { id: 'comm-1', name: 'Greenwood Heights', code: 'GWH', address: 'Plot 42, Financial District, Hyderabad' },
  { id: 'comm-2', name: 'Cyber Towers Residency', code: 'CTR', address: 'Madhapur Main Road, HITEC City, Hyderabad' }
];

export const DEMO_USERS = {
  resident: {
    id: 'user-res-1',
    name: 'Rohit Sharma',
    role: 'resident',
    email: 'rohit.resident@nexora.local',
    flat: 'Tower B - Flat 402',
    phone: '+91 98765 43210'
  },
  admin: {
    id: 'user-adm-1',
    name: 'Ananya Rao',
    role: 'admin',
    email: 'ananya.admin@nexora.local',
    designation: 'Society Secretary',
    phone: '+91 98765 11111'
  },
  worker: {
    id: 'user-wrk-1',
    name: 'Suresh Kumar',
    role: 'worker',
    email: 'suresh.maintenance@nexora.local',
    specialization: 'Senior Electrician & Plumbing Specialist',
    phone: '+91 98765 22222'
  },
  security: {
    id: 'user-sec-1',
    name: 'Ramesh Singh',
    role: 'security',
    email: 'ramesh.gate@nexora.local',
    post: 'Main Gate 1 Guardhouse',
    phone: '+91 98765 33333'
  }
};

export const DemoAuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('nexora_demo_role') || 'resident');
  const [currentCommunity, setCurrentCommunity] = useState(() => {
    const saved = localStorage.getItem('nexora_demo_community');
    return saved ? JSON.parse(saved) : DEMO_COMMUNITIES[0];
  });
  const [currentLanguage, setCurrentLanguage] = useState(() => localStorage.getItem('i18nextLng') || 'en');

  const currentUser = DEMO_USERS[currentRole] || DEMO_USERS.resident;

  const switchRole = (role) => {
    if (DEMO_USERS[role]) {
      setCurrentRole(role);
      localStorage.setItem('nexora_demo_role', role);
    }
  };

  const switchCommunity = (commId) => {
    const found = DEMO_COMMUNITIES.find(c => c.id === commId);
    if (found) {
      setCurrentCommunity(found);
      localStorage.setItem('nexora_demo_community', JSON.stringify(found));
    }
  };

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <DemoAuthContext.Provider value={{
      currentRole,
      currentUser,
      currentCommunity,
      currentLanguage,
      switchRole,
      switchCommunity,
      switchLanguage,
      communities: DEMO_COMMUNITIES,
      availableRoles: Object.keys(DEMO_USERS)
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
