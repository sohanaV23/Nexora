import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  AlertCircle, 
  FileText, 
  Clock, 
  CreditCard, 
  Users, 
  Car, 
  Building2, 
  Bell, 
  BarChart3, 
  ShieldCheck, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import clsx from 'clsx';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { currentRole, currentCommunity } = useDemoAuth();

  // Role-appropriate navigation items
  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, roles: ['resident', 'admin', 'worker', 'security'] },
    { to: '/complaints', label: t('nav.complaints'), icon: AlertCircle, roles: ['resident', 'admin', 'worker'] },
    { to: '/slas', label: t('nav.slas'), icon: Clock, roles: ['admin'] },
    { to: '/dues', label: t('nav.dues'), icon: CreditCard, roles: ['resident', 'admin'] },
    { to: '/visitors', label: t('nav.visitors'), icon: ShieldCheck, roles: ['resident', 'admin', 'security'] },
    { to: '/parking', label: t('nav.parking'), icon: Car, roles: ['resident', 'admin'] },
    { to: '/facilities', label: t('nav.facilities'), icon: Building2, roles: ['resident', 'admin'] },
    { to: '/notices', label: t('nav.notices'), icon: Bell, roles: ['resident', 'admin', 'worker', 'security'] },
    { to: '/directory', label: t('nav.directory'), icon: Users, roles: ['resident', 'admin'] },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3, roles: ['admin'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Nexora</h1>
            <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">Smart Living</span>
          </div>
        </div>

        {/* Community Scope Badge */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Community</p>
              <p className="font-medium text-slate-200 truncate">{currentCommunity.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Role Pill Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 uppercase">
              {currentRole.slice(0, 2)}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-200 capitalize">{t(`roles.${currentRole}`)}</p>
              <p className="text-[11px] text-slate-400 truncate">Role Scoped View</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
