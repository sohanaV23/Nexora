import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Shield, 
  User, 
  Home, 
  Key, 
  Wrench, 
  UserCheck, 
  Crown, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Building2, 
  Check, 
  Zap, 
  FileText, 
  Clock 
} from 'lucide-react';
import { useDemoAuth } from '../context/DemoAuthContext';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    login, 
    demoLogin, 
    availableRoles, 
    currentLanguage, 
    switchLanguage,
    communities,
    switchCommunity,
    currentCommunity
  } = useDemoAuth();

  // Active persona selection
  const [selectedRoleKey, setSelectedRoleKey] = useState('resident');
  const [email, setEmail] = useState('rohit.resident@nexora.local');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCommId, setSelectedCommId] = useState(communities[0]?.id || 'comm-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const selectedPersona = availableRoles.find(r => r.key === selectedRoleKey) || availableRoles[0];

  const handleSelectRole = (role) => {
    setSelectedRoleKey(role.key);
    setEmail(role.email);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (selectedCommId) {
        await switchCommunity(selectedCommId).catch(() => {});
      }
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (roleKey) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await demoLogin(roleKey);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Demo session initialization failed.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[25%] w-[350px] h-[350px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block leading-tight">
              Nexora
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase block">
              Smart Living Ecosystem
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hyderabad Tier-1 Communities Live</span>
          </div>

          <button
            onClick={() => switchLanguage(currentLanguage === 'en' ? 'te' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{currentLanguage === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold shadow-xs">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Role Authentication & Access Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Role-Based Living & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Property Governance Portal
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Select your assigned persona below for instant 1-click evaluation access, or enter your registered society credentials.
          </p>
        </div>

        {/* 2-Column Main Login Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto w-full">
          {/* Left: Role Selection Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>1. Select Persona Role</span>
              </h2>
              <span className="text-xs text-indigo-400 font-medium">Click to preview capabilities</span>
            </div>

            {/* Persona Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableRoles.map((role) => {
                const Icon = roleIcons[role.key] || User;
                const isSelected = role.key === selectedRoleKey;

                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-indigo-900/60 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {role.label}
                          </h3>
                        </div>
                        <p className="text-xs font-medium text-indigo-400 mt-0.5 truncate">
                          {role.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">{role.flat}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/5">
                        {role.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Persona Feature Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                    Active Preview Mode: {selectedPersona.label}
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    Credentials pre-loaded for <strong>{selectedPersona.name}</strong> ({selectedPersona.email})
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemoLogin(selectedPersona.key)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Instant 1-Click Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Interactive Credentials Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>2. Authenticate Session</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sign in with selected role credentials or custom account.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleStandardLogin} className="space-y-4">
              {/* Community Context Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Residential Community
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCommId}
                    onChange={(e) => setSelectedCommId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {communities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code || 'GWH'}) — {c.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@nexora.local"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">Default: Password123!</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Token Note */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded bg-slate-950 border-white/20 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <span>Keep 7-day verified session</span>
                </label>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> HttpOnly Secure
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Nexora Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Persona Bar at Bottom */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick 1-Click Persona Access:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableRoles.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => handleQuickDemoLogin(role.key)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-400/30 text-[11px] font-medium text-slate-300 transition-all flex items-center gap-1"
                    title={`Instantly sign in as ${role.name}`}
                  >
                    <span>{role.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-indigo-400 font-semibold uppercase">
                      ({role.key === 'super_admin' ? 'Master' : role.key})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature & Security Badges Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto w-full text-center">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center space-y-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Dual-Ledger Accounting</h4>
            <p className="text-[10px] text-slate-400">Strict zero-drift reconciliation</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center space-y-1">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Multi-Tier SLA Engine</h4>
            <p className="text-[10px] text-slate-400">Automated breach escalations</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center space-y-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">AI Complaint Triage</h4>
            <p className="text-[10px] text-slate-400">Smart duplicate & category checks</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center space-y-1">
            <FileText className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-white">Contactless Gate QR</h4>
            <p className="text-[10px] text-slate-400">Secure digital visitor passes</p>
          </div>
        </div>
      </main>

      {/* Footer Copyright */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 text-center text-xs text-slate-500 border-t border-white/5">
        <p>© 2026 Nexora Smart Apartment & Rental Property Management Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};
