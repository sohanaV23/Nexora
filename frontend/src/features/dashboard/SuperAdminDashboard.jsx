import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Crown, 
  Building2, 
  Users, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity,
  Search
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';

export const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommModal, setNewCommModal] = useState(false);
  const [newComm, setNewComm] = useState({ name: '', code: '', address: '', city: 'Hyderabad' });

  const loadData = async () => {
    try {
      const [overRes, commRes] = await Promise.all([
        api.getSuperAdminOverview(),
        api.getSuperAdminCommunities()
      ]);
      if (overRes.success) setOverview(overRes.data);
      if (commRes.success) setCommunities(commRes.data.communities);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleCommunityStatus(id, nextStatus);
      await loadData();
    } catch (err) {
      alert('Failed to update community status');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await api.apiRequest('/communities', { method: 'POST', body: JSON.stringify(newComm) });
      setNewCommModal(false);
      setNewComm({ name: '', code: '', address: '', city: 'Hyderabad' });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to create community');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-sm">Loading Platform Master Console...</div>;
  }

  const { communities: commStats, platform, finances, recentAuditLogs } = overview || {
    communities: { total: 2, active: 2, suspended: 0 },
    platform: { totalUsers: 8, totalFlats: 3, totalComplaints: 3, openComplaints: 2 },
    finances: { totalBilledPaise: 3100000, totalCollectedPaise: 350000, totalOutstandingPaise: 2750000, collectionRatePercent: '11.3' },
    recentAuditLogs: []
  };

  return (
    <div className="space-y-6">
      {/* Platform Master Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 rounded-2xl p-6 text-white border border-amber-500/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Platform Super Administrator
            </span>
            <span className="text-xs text-slate-400">Cross-Community Governance Hub</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Nexora System Administration & Infrastructure</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitor multi-community health, register new housing societies, inspect cross-community financial flow, and audit security events.
          </p>
        </div>

        <button
          onClick={() => setNewCommModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Community</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Communities"
          value={commStats.total}
          subtitle={`${commStats.active} Active • ${commStats.suspended} Suspended`}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Platform User Accounts"
          value={platform.totalUsers}
          subtitle={`${platform.totalFlats} Flats under management`}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Society Invoices"
          value={`₹ ${(finances.totalBilledPaise / 100).toLocaleString('en-IN')}`}
          subtitle={`₹ ${(finances.totalCollectedPaise / 100).toLocaleString('en-IN')} verified (${finances.collectionRatePercent}%)`}
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Cross-Community Issues"
          value={platform.openComplaints}
          subtitle={`${platform.totalComplaints} lifetime tickets`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Communities Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Multi-Community Registry</h3>
            <p className="text-xs text-slate-500">Separately managed gated communities with isolated databases</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {communities.length} Communities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Community & Code</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Flats</th>
                <th className="py-3 px-4">Active Members</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {communities.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[11px] font-mono text-indigo-600 font-bold">{c.code}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{c.address}, {c.city}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{c._count?.flats || 0}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{c._count?.memberships || 0}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${c.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                    >
                      {c.status === 'ACTIVE' ? 'Suspend Community' : 'Reactivate Community'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Security & Audit Trail Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Cross-Community Security & Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live immutable logs</span>
        </div>

        <div className="space-y-2.5">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700">{log.community?.name || 'Platform Level'}</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <p className="text-[10px] text-slate-400">Actor: {log.actor?.name || 'System'} ({log.actor?.role || 'SYSTEM'})</p>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Register Community Modal */}
      {newCommModal && (
        <Modal
          isOpen={newCommModal}
          onClose={() => setNewCommModal(false)}
          title="Onboard New Residential Community"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateCommunity} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Community Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prestige High Fields"
                value={newComm.name}
                onChange={(e) => setNewComm({ ...newComm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Community Short Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PHF"
                value={newComm.code}
                onChange={(e) => setNewComm({ ...newComm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                placeholder="e.g. Nanakramguda, Financial District"
                value={newComm.address}
                onChange={(e) => setNewComm({ ...newComm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewCommModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
              >
                Register Community
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
