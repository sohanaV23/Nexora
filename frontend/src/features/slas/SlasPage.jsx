import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldAlert, ArrowRight, CheckCircle2, Play } from 'lucide-react';

const SLA_MATRIX = [
  { category: 'Elevator & Lift', priority: 'Urgent', responseHours: 0.5, resolutionHours: 4, escalationLevel: 'Immediate (President)' },
  { category: 'Plumbing & Water', priority: 'High', responseHours: 1, resolutionHours: 8, escalationLevel: 'Secretary (4h)' },
  { category: 'Electrical (Main Lines)', priority: 'Urgent', responseHours: 0.5, resolutionHours: 4, escalationLevel: 'Immediate (President)' },
  { category: 'Cleaning & Waste', priority: 'Medium', responseHours: 2, resolutionHours: 12, escalationLevel: 'Supervisor (8h)' },
  { category: 'Parking & Security', priority: 'High', responseHours: 1, resolutionHours: 6, escalationLevel: 'Security Lead (3h)' },
  { category: 'General / Noise', priority: 'Low', responseHours: 4, resolutionHours: 24, escalationLevel: 'Office Admin (16h)' }
];

export const SlasPage = () => {
  const { t } = useTranslation();
  const [escalationTriggered, setEscalationTriggered] = useState(false);

  const handleSimulateEscalation = () => {
    setEscalationTriggered(true);
    setTimeout(() => {
      setEscalationTriggered(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">SLA Targets & Escalation Engine</h2>
          <p className="text-xs text-slate-500">Service level agreements, automated overdue alerts, and multi-tier escalation hierarchy</p>
        </div>
        <button
          onClick={handleSimulateEscalation}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Idempotent SLA Engine Sweep</span>
        </button>
      </div>

      {escalationTriggered && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">SLA Sweep Executed Successfully</h4>
            <p className="text-indigo-700 mt-0.5">
              Scanned 4 active complaints. 1 breach detected (CMP-2026-004 Garbage Chute). Escalation notification dispatched to Association President without duplicate alert entries.
            </p>
          </div>
        </div>
      )}

      {/* Escalation Hierarchy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Level 1: Technician
          </span>
          <h4 className="text-sm font-bold text-slate-800">Job Assignment & Initial Response</h4>
          <p className="text-xs text-slate-500">Technician is notified on dispatch. Response target window begins immediately upon submission.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            Level 2: Society Secretary
          </span>
          <h4 className="text-sm font-bold text-slate-800">50% Elapsed Overdue Alert</h4>
          <p className="text-xs text-slate-500">If unresolved past half-time threshold, an alert warning is logged in the admin activity feed.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
            Level 3: Association President
          </span>
          <h4 className="text-sm font-bold text-slate-800">SLA Breach Escalation</h4>
          <p className="text-xs text-slate-500">Total resolution target breach flags complaint as Overdue and raises priority to executive review.</p>
        </div>
      </div>

      {/* SLA Policy Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Community SLA Policy Matrix</h3>
          <span className="text-xs text-slate-400">Enforced by backend scheduler</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Response Target</th>
                <th className="py-3 px-4">Resolution Target</th>
                <th className="py-3 px-4 text-right">Escalation Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {SLA_MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {row.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-indigo-600 font-medium">{row.responseHours} Hours</td>
                  <td className="py-3 px-4 text-slate-800 font-bold">{row.resolutionHours} Hours</td>
                  <td className="py-3 px-4 text-right text-rose-600 font-medium">{row.escalationLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
