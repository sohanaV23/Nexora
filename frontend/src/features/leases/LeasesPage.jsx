import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Key, 
  Plus, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const LeasesPage = () => {
  const { t } = useTranslation();
  const { currentRole, currentCommunity } = useDemoAuth();

  const [tenancies, setTenancies] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Lease Modal
  const [leaseModal, setLeaseModal] = useState(false);
  const [newLease, setNewLease] = useState({
    flatId: '',
    tenantEmail: 'priya.tenant@nexora.local',
    tenantName: 'Priya Sundaram',
    tenantPhone: '+91 98765 55555',
    leaseStart: '2026-04-01',
    leaseEnd: '2027-03-31',
    monthlyRentPaise: 2400000,
    securityDepositPaise: 5000000,
    dueDay: 5,
    moveInNotes: 'Keys handed over with inventory check.'
  });

  // Move-Out Modal
  const [moveOutModal, setMoveOutModal] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState(null);
  const [moveOutData, setMoveOutData] = useState({
    depositDeductionsPaise: 500000, // ₹5,000 for paint
    depositDeductionReason: 'Wall repaint and minor switchboard replacement',
    moveOutInspection: 'Flat cleaned, electrical fixtures inspected, all keys returned.'
  });

  const loadData = async () => {
    try {
      const [tenRes, flatRes] = await Promise.all([
        api.getTenancies(),
        api.getFlats()
      ]);
      if (tenRes.success) setTenancies(tenRes.data.tenancies);
      if (flatRes.success) {
        setFlats(flatRes.data.flats);
        if (flatRes.data.flats.length > 0 && !newLease.flatId) {
          setNewLease(prev => ({ ...prev, flatId: flatRes.data.flats[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load leases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCommunity]);

  const handleCreateLease = async (e) => {
    e.preventDefault();
    try {
      await api.createTenancy(newLease);
      setLeaseModal(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to create lease');
    }
  };

  const handleMoveOut = async (e) => {
    e.preventDefault();
    if (!selectedTenancy) return;
    try {
      await api.moveOutSettlement(selectedTenancy.id, moveOutData);
      setMoveOutModal(false);
      setSelectedTenancy(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to process move out');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-0.5 rounded border border-indigo-400/20 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> Rental Property Management
            </span>
            <span className="text-xs text-indigo-200">Contractual Leases & Deposit Ledger</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Tenancy Agreements & Move-In/Out Lifecycles</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track contractual monthly rent separate from society maintenance, record security deposit liabilities, and execute move-out settlements.
          </p>
        </div>

        {['admin', 'landlord', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setLeaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Tenant / Register Lease</span>
          </button>
        )}
      </div>

      {/* Leases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenancies.map((ten) => (
          <div key={ten.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {ten.flat?.flatNumber} • {ten.flat?.building?.name}
                </span>
                <h4 className="text-base font-bold text-slate-800 mt-1">Tenant: {ten.tenant?.name}</h4>
                <p className="text-xs text-slate-500">{ten.tenant?.phone} • {ten.tenant?.email}</p>
              </div>
              <StatusBadge status={ten.status === 'ACTIVE' ? 'Approved' : 'Closed'} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Rent</span>
                <p className="font-bold text-slate-800 text-sm">₹ {(ten.monthlyRentPaise / 100).toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-slate-400">Due on {ten.dueDay}th of month</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Security Deposit</span>
                <p className="font-bold text-emerald-700 text-sm">₹ {(ten.securityDepositPaise / 100).toLocaleString('en-IN')}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Status: {ten.depositStatus}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Landlord / Owner:</span>
                <span className="font-semibold text-slate-700">{ten.landlord?.name} ({ten.landlord?.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lease Term:</span>
                <span>{new Date(ten.leaseStart).toLocaleDateString()} to {new Date(ten.leaseEnd).toLocaleDateString()}</span>
              </div>
              {ten.moveInNotes && (
                <div className="pt-1 text-[11px] text-slate-500 italic">
                  Move-In: "{ten.moveInNotes}"
                </div>
              )}
            </div>

            {ten.status === 'ACTIVE' && ['admin', 'landlord', 'super_admin'].includes(currentRole) && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => {
                    setSelectedTenancy(ten);
                    setMoveOutModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Execute Move-Out Settlement</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Onboard Lease Modal */}
      {leaseModal && (
        <Modal
          isOpen={leaseModal}
          onClose={() => setLeaseModal(false)}
          title="Register New Rental Tenancy Agreement"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateLease} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Flat Unit *
              </label>
              <select
                value={newLease.flatId}
                onChange={(e) => setNewLease({ ...newLease, flatId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                {flats.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.flatNumber} ({f.building?.name}) — Status: {f.occupancyStatus}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tenant Full Name *
              </label>
              <input
                type="text"
                required
                value={newLease.tenantName}
                onChange={(e) => setNewLease({ ...newLease, tenantName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tenant Email *
                </label>
                <input
                  type="email"
                  required
                  value={newLease.tenantEmail}
                  onChange={(e) => setNewLease({ ...newLease, tenantEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tenant Phone
                </label>
                <input
                  type="tel"
                  value={newLease.tenantPhone}
                  onChange={(e) => setNewLease({ ...newLease, tenantPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Rent (INR ₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newLease.monthlyRentPaise / 100}
                  onChange={(e) => setNewLease({ ...newLease, monthlyRentPaise: parseInt(e.target.value, 10) * 100 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={newLease.securityDepositPaise / 100}
                  onChange={(e) => setNewLease({ ...newLease, securityDepositPaise: parseInt(e.target.value, 10) * 100 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeaseModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                Confirm Tenancy Registration
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Move-Out Settlement Modal */}
      {moveOutModal && selectedTenancy && (
        <Modal
          isOpen={moveOutModal}
          onClose={() => setMoveOutModal(false)}
          title={`Move-Out Settlement: ${selectedTenancy.flat?.flatNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleMoveOut} className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Tenant:</span>
                <span className="font-bold">{selectedTenancy.tenant?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Deposit Held:</span>
                <span className="font-bold text-emerald-700">₹ {(selectedTenancy.securityDepositPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Approved Deposit Deductions (INR ₹)
              </label>
              <input
                type="number"
                value={moveOutData.depositDeductionsPaise / 100}
                onChange={(e) => setMoveOutData({ ...moveOutData, depositDeductionsPaise: parseInt(e.target.value || 0, 10) * 100 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Deductions
              </label>
              <input
                type="text"
                value={moveOutData.depositDeductionReason}
                onChange={(e) => setMoveOutData({ ...moveOutData, depositDeductionReason: e.target.value })}
                placeholder="e.g. Wall painting, deep cleaning, or damaged door latch"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
              <span className="font-semibold text-emerald-800">Net Refund to Tenant:</span>
              <span className="text-base font-bold text-emerald-900">
                ₹ {Math.max(0, (selectedTenancy.securityDepositPaise - moveOutData.depositDeductionsPaise) / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMoveOutModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Finalize Move-Out & Release Flat
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
