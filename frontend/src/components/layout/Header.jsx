import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Globe, 
  UserCheck, 
  Building2, 
  ChevronDown, 
  Shield, 
  Wrench, 
  User, 
  Check, 
  Crown,
  Key,
  Home,
  Sparkles,
  Lock,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { Modal } from '../ui/Modal';
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
    availableRoles,
    logout
  } = useDemoAuth();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [commMenuOpen, setCommMenuOpen] = useState(false);

  // Hidden 5-Click Super Admin Easter Egg State
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);
  const [superAdminModalOpen, setSuperAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('super.admin@nexora.local');
  const [adminPassword, setAdminPassword] = useState('Password123!');
  const [loginError, setLoginError] = useState(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 5) {
      setSuperAdminModalOpen(true);
      setClickCount(0);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await switchRole('super_admin');
      setSuperAdminModalOpen(false);
      setLoginError(null);
    } catch (err) {
      setLoginError('Invalid administrator credentials.');
    }
  };

  const roleIcons = {
    resident: User,
    tenant: Home,
    landlord: Key,
    admin: Shield,
    worker: Wrench,
    security: UserCheck,
    super_admin: Crown
  };

  const CurrentRoleIcon = roleIcons[currentRole] || User;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Nexora Brand Icon with 5-Click Easter Egg */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Nexora Platform (Click 5 times for Platform Admin)"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight hidden sm:inline">Nexora</span>
            {clickCount > 1 && clickCount < 5 && (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                {clickCount}/5
              </span>
            )}
          </div>

          {/* Community Switcher Dropdown */}
          {currentRole !== 'super_admin' && (
            <div className="relative ml-2 sm:ml-4">
              <button
                onClick={() => { setCommMenuOpen(!commMenuOpen); setRoleMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-xs font-medium text-slate-700 transition-colors"
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline font-semibold">{currentCommunity?.name || 'Greenwood Heights'}</span>
                <span className="sm:hidden font-semibold">{currentCommunity?.code || 'GWH'}</span>
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
                      {c.id === currentCommunity?.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentRole === 'super_admin' && (
            <div className="ml-2 sm:ml-4 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Platform Master Oversight</span>
            </div>
          )}
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

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => { setRoleMenuOpen(!roleMenuOpen); setCommMenuOpen(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/70 text-xs font-semibold text-indigo-800 transition-colors shadow-2xs"
            >
              <CurrentRoleIcon className="w-4 h-4 text-indigo-600" />
              <span className="capitalize">{currentRole.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                  Switch User Persona
                </div>
                {availableRoles.map((r) => {
                  const Icon = roleIcons[r.key] || User;
                  const isSelected = r.key === currentRole;
                  return (
                    <button
                      key={r.key}
                      onClick={() => {
                        switchRole(r.key);
                        setRoleMenuOpen(false);
                      }}
                      className={clsx(
                        'w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors',
                        isSelected ? 'bg-indigo-50/70 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span>{r.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Mini Card & Sign Out */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize">{currentRole.replace('_', ' ')}</p>
            </div>
            <button
              onClick={() => logout()}
              className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out to Role Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hidden Super Admin Access Modal */}
      {superAdminModalOpen && (
        <Modal
          isOpen={superAdminModalOpen}
          onClose={() => setSuperAdminModalOpen(false)}
          title="Platform Administrator Gateway"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authorized Platform Administration Only</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  This panel grants cross-community governance, community creation, and system audit access.
                </p>
              </div>
            </div>

            <form onSubmit={handleSuperAdminLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Master Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('super_admin');
                    setSuperAdminModalOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Quick Demo Login
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Authenticate Platform Master
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
};
