import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  QrCode, 
  Clock, 
  UserCheck, 
  Search, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Users,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_VISITORS } from '../../services/mockData';

export const SecurityDashboard = () => {
  const { t } = useTranslation();
  const { currentUser, currentCommunity } = useDemoAuth();

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passInput, setPassInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadVisitors = async () => {
    try {
      const res = await api.getVisitors();
      if (res.success && res.data?.visitors?.length > 0) {
        setVisitors(res.data.visitors);
      } else {
        setVisitors(INITIAL_VISITORS.map(v => ({
          ...v,
          status: v.status.toUpperCase().replace(' ', '_'),
          flat: { flatNumber: v.visitingFlat }
        })));
      }
    } catch (err) {
      console.error('Failed to load visitors in security dashboard:', err);
      setVisitors(INITIAL_VISITORS.map(v => ({
        ...v,
        status: v.status.toUpperCase().replace(' ', '_'),
        flat: { flatNumber: v.visitingFlat }
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, [currentCommunity]);

  const handleValidatePass = async (codeToTest) => {
    const code = (codeToTest || passInput).trim().toUpperCase();
    if (!code) return;

    const found = visitors.find(v => v.passCode?.toUpperCase() === code);
    if (found) {
      setScanResult(found);
      setScanError(null);
    } else {
      setScanError(`Passcode token "${code}" was not found or is expired.`);
      setScanResult(null);
    }
  };

  const handleCheckIn = async (pass) => {
    try {
      if (pass.passCode) {
        await api.validateVisitorPass({ passCode: pass.passCode, action: 'CHECK_IN' });
      }

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setVisitors(prev => prev.map(v => {
        if (v.id === pass.id || v.passCode === pass.passCode) {
          return {
            ...v,
            status: 'CHECKED_IN',
            entryTime: timeNow
          };
        }
        return v;
      }));

      setNotification(`Visitor ${pass.visitorName} successfully checked in at ${timeNow}.`);
      setScanResult(null);
      setPassInput('');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to check in visitor');
    }
  };

  const handleCheckOut = async (pass) => {
    try {
      if (pass.passCode) {
        await api.validateVisitorPass({ passCode: pass.passCode, action: 'CHECK_OUT' });
      }

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setVisitors(prev => prev.map(v => {
        if (v.id === pass.id || v.passCode === pass.passCode) {
          return {
            ...v,
            status: 'DEPARTED',
            exitTime: timeNow
          };
        }
        return v;
      }));

      setNotification(`Visitor ${pass.visitorName} departure recorded at ${timeNow}.`);
      setScanResult(null);
      setPassInput('');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to check out visitor');
    }
  };

  const activeOnPremises = visitors.filter(v => v.status === 'CHECKED_IN' || v.status === 'Checked In').length;
  const approvedExpected = visitors.filter(v => v.status === 'APPROVED' || v.status === 'Approved').length;
  const departedCount = visitors.filter(v => v.status === 'DEPARTED' || v.status === 'Departed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Main Gate & Sentinel Command Station</h2>
          <p className="text-xs text-slate-500">
            Real-time QR pass scanner, visitor ingress verification, and logbook for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Gate Sentinel Officer: {currentUser?.name || 'Ramesh Singh'}
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{notification}</p>
        </div>
      )}

      {/* Gate Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Visitors Inside Community"
          value={`${activeOnPremises} On Premises`}
          subtitle="Currently inside premises"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Expected Today"
          value={`${approvedExpected} Pending`}
          subtitle="Pre-authorized passes"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Departed Gate Log"
          value={`${departedCount} Logged`}
          subtitle="Exit scan recorded"
          icon={LogOut}
          color="sky"
        />
        <StatCard
          title="Scanner Status"
          value="Online"
          subtitle="RFID & QR Gate 1 Active"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* Rapid Gate Code Scanner Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-400" />
              <span>Contactless Pass Token Scanner</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Type or scan 6-character visitor token (e.g. NX-8942 or NX-3109)
            </p>
          </div>
          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-indigo-300">Quick Test:</span>
            {visitors.slice(0, 2).map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setPassInput(v.passCode);
                  handleValidatePass(v.passCode);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-800/80 hover:bg-indigo-700 text-xs font-mono font-bold text-indigo-200 transition-colors"
              >
                {v.passCode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Enter digital pass code (e.g. NX-8942)..."
              value={passInput}
              onChange={(e) => setPassInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleValidatePass()}
              className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={() => handleValidatePass()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white uppercase tracking-wider transition-colors shadow-md"
          >
            Scan & Verify
          </button>
        </div>

        {/* Scan Feedback Result Card */}
        {scanResult && (
          <div className="p-4 rounded-xl bg-white/10 border border-emerald-400/50 backdrop-blur-md animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-emerald-300">Authorized Gate Pass Verified!</span>
              </div>
              <StatusBadge status={scanResult.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-indigo-300 block">Visitor</span>
                <span className="font-semibold text-white">{scanResult.visitorName}</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 block">Destination Flat</span>
                <span className="font-semibold text-white">{scanResult.flat?.flatNumber || scanResult.visitingFlat}</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 block">Category</span>
                <span className="text-white">{scanResult.purpose}</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 block">Mobile</span>
                <span className="font-mono text-white">{scanResult.phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => handleCheckIn(scanResult)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Allow Ingress (Check In)</span>
              </button>
              <button
                onClick={() => handleCheckOut(scanResult)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Mark Departure</span>
              </button>
            </div>
          </div>
        )}

        {scanError && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {/* Live Gate Pass Logbook */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Today's Gate Ingress & Egress Records ({visitors.length})
          </h3>
          <span className="text-xs text-slate-400">Chronological gate activity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Passcode & Visitor</th>
                <th className="py-3 px-4">Destination Flat</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Arrival Log</th>
                <th className="py-3 px-4">Departure Log</th>
                <th className="py-3 px-4 text-right">Gate Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visitors.map((v) => {
                const flatLabel = v.flat?.flatNumber || v.visitingFlat || 'Flat';
                const isApproved = v.status === 'APPROVED' || v.status === 'Approved';
                const isCheckedIn = v.status === 'CHECKED_IN' || v.status === 'Checked In';

                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-600 block">{v.passCode}</span>
                      <span className="font-semibold text-slate-800">{v.visitorName}</span>
                      <span className="text-[11px] text-slate-400 block">{v.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{flatLabel}</td>
                    <td className="py-3 px-4 text-slate-600">{v.purpose}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.entryTime ? (
                        <span className="text-emerald-600 font-semibold">In: {v.entryTime}</span>
                      ) : (
                        <span className="text-slate-400">Exp: {v.expectedTime}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.exitTime ? (
                        <span className="text-slate-600 font-medium">Out: {v.exitTime}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isApproved && (
                          <button
                            onClick={() => handleCheckIn(v)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        {isCheckedIn && (
                          <button
                            onClick={() => handleCheckOut(v)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
