import React, { useState } from 'react';
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
  AlertCircle 
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_VISITORS } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const SecurityDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [passInput, setPassInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleValidatePass = (codeToTest) => {
    const code = codeToTest || passInput.trim();
    if (!code) return;

    const found = visitors.find(v => v.passCode.toUpperCase() === code.toUpperCase());
    if (found) {
      setScanResult(found);
      setScanError(null);
    } else {
      setScanError(`No active visitor pass matches token "${code}".`);
      setScanResult(null);
    }
  };

  const handleCheckIn = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Checked In',
          entryTime: timeNow
        };
      }
      return v;
    }));
    setScanResult(null);
    setPassInput('');
  };

  const handleCheckOut = (id) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Departed',
          exitTime: timeNow
        };
      }
      return v;
    }));
  };

  const insideCount = visitors.filter(v => v.status === 'Checked In').length;
  const expectedCount = visitors.filter(v => v.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded border border-emerald-500/30">
              Security Gate Terminal
            </span>
            <span className="text-xs text-slate-400">{currentUser.post}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Main Gate Visitor Access & Verification</h2>
          <p className="text-xs text-slate-400 mt-1">Verify time-limited digital visitor passes and record timestamped entry/exit.</p>
        </div>

        <button
          onClick={() => setQrModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>Simulate QR Scan</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Visitors Inside Community"
          value={insideCount}
          subtitle="Currently on premises"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Expected Today"
          value={expectedCount}
          subtitle="Pre-approved by residents"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Total Passes Issued"
          value={visitors.length}
          subtitle="Active logs today"
          icon={ShieldCheck}
          color="sky"
        />
      </div>

      {/* Manual Pass Validation Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fast Pass Validation</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter 6-character pass code (e.g. NX-8942)..."
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidatePass()}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => handleValidatePass()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
          >
            Verify Pass
          </button>
        </div>

        {/* Validation Result Box */}
        {scanResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-in fade-in space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Valid Digital Pass Verified</h4>
                  <p className="text-xs text-emerald-700">Code: <strong>{scanResult.passCode}</strong></p>
                </div>
              </div>
              <StatusBadge status={scanResult.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-emerald-800 bg-white/70 p-3 rounded-lg border border-emerald-100">
              <div>
                <span className="text-[10px] uppercase text-emerald-600 block">Visitor Name</span>
                <span className="font-bold">{scanResult.visitorName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-600 block">Visiting Flat</span>
                <span className="font-bold">{scanResult.visitingFlat}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-600 block">Purpose</span>
                <span>{scanResult.purpose}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-600 block">Scheduled Time</span>
                <span>{scanResult.expectedTime}</span>
              </div>
            </div>

            {scanResult.status === 'Approved' && (
              <button
                onClick={() => handleCheckIn(scanResult.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Authorize & Record Entry Timestamp</span>
              </button>
            )}
          </div>
        )}

        {scanError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{scanError}</span>
          </div>
        )}
      </div>

      {/* Today's Gate Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Today's Gate Visitor Log</h3>
          <span className="text-xs text-slate-400">{visitors.length} Total Passes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Pass Code</th>
                <th className="py-3 px-4">Visitor & Phone</th>
                <th className="py-3 px-4">Visiting Flat</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Entry / Exit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{v.passCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{v.visitorName}</div>
                    <div className="text-[11px] text-slate-400">{v.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{v.visitingFlat}</td>
                  <td className="py-3.5 px-4 text-slate-500">{v.purpose}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-slate-500">
                    <div>In: {v.entryTime || '—'}</div>
                    <div>Out: {v.exitTime || '—'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {v.status === 'Approved' && (
                      <button
                        onClick={() => handleCheckIn(v.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>
                    )}
                    {v.status === 'Checked In' && (
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Check Out</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated QR Scan Modal */}
      {qrModalOpen && (
        <Modal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          title="Simulate Camera QR Scanner"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white border-2 border-dashed border-indigo-400 p-4 relative overflow-hidden">
              <QrCode className="w-20 h-20 text-indigo-400 animate-pulse" />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
              <p className="text-[10px] text-slate-400 mt-2">Simulated Optical QR Sensor</p>
            </div>

            <p className="text-xs text-slate-500">
              Select an issued test pass to simulate pointing the gate camera at a visitor's smartphone screen:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleValidatePass('NX-8942');
                  setQrModalOpen(false);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-xs text-left"
              >
                <div className="font-mono font-bold text-indigo-600">NX-8942</div>
                <div className="text-[11px] text-slate-500 truncate">Amit Verma (B-402)</div>
              </button>
              <button
                onClick={() => {
                  handleValidatePass('NX-3109');
                  setQrModalOpen(false);
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50 text-xs text-left"
              >
                <div className="font-mono font-bold text-indigo-600">NX-3109</div>
                <div className="text-[11px] text-slate-500 truncate">Swiggy Partner (A-204)</div>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
