import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Globe, 
  UserCheck, 
  Building2, 
  Bell, 
  ChevronDown,
  Shield,
  Wrench,
  User,
  Check
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import clsx from 'clsx';

export const Header = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { 
    currentRole, 
    currentUser, 
    currentCommunity, 
    currentLanguage, 
    switchRole, 
    switchCommunity, 
    switchLanguage,
    communities,
    availableRoles 
  } = useDemoAuth();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [commMenuOpen, setCommMenuOpen] = useState(false);

  const roleIcons = {
    resident: User,
    admin: Shield,
    worker: Wrench,
    security: UserCheck
  };

  const CurrentRoleIcon = roleIcons[currentRole] || User;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Community Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setCommMenuOpen(!commMenuOpen); setRoleMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-xs font-medium text-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline font-semibold">{currentCommunity.name}</span>
            <span className="sm:hidden font-semibold">{currentCommunity.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {commMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                Select Community
              </div>
              {communities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    switchCommunity(c.id);
                    setCommMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.address}</p>
                  </div>
                  {c.id === currentCommunity.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <button
          onClick={() => switchLanguage(currentLanguage === 'en' ? 'te' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 transition-colors"
          title="Switch English / Telugu"
        >
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>{currentLanguage === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>

        {/* Role Switcher Pill (Essential for testing all workflows) */}
        <div className="relative">
          <button
            onClick={() => { setRoleMenuOpen(!roleMenuOpen); setCommMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/70 text-xs font-semibold text-indigo-800 transition-colors shadow-2xs"
          >
            <CurrentRoleIcon className="w-4 h-4 text-indigo-600" />
            <span className="capitalize">{t(`roles.${currentRole}`)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                {t('common.switch_role')}
              </div>
              {availableRoles.map((role) => {
                const Icon = roleIcons[role] || User;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setRoleMenuOpen(false);
                    }}
                    className={clsx(
                      'w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors',
                      role === currentRole ? 'bg-indigo-50/70 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-600" />
                      <span className="capitalize">{t(`roles.${role}`)}</span>
                    </div>
                    {role === currentRole && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Mini Card */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left text-xs leading-tight">
            <p className="font-semibold text-slate-800">{currentUser.name}</p>
            <p className="text-[11px] text-slate-500">{currentUser.flat || currentUser.designation || currentUser.specialization || currentUser.post}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
