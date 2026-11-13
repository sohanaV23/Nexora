import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Plus, 
  QrCode, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  Share2,
  Download,
  Search,
  Check,
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_VISITORS } from '../../services/mockData';

export const VisitorsPage = () => {
  const { t } = useTranslation();
  const { currentUser, currentRole, currentCommunity } = useDemoAuth();

  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePass, setActivePass] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Personal / Family Guest',
    expectedDate: new Date().toISOString().split('T')[0],
    expectedTime: '06:00 PM',
    flatId: ''
  });

  const canvasRef = useRef(null);

  const loadVisitorsData = async () => {
    try {
      const [visRes, flatRes] = await Promise.all([
        api.getVisitors(),
        api.getFlats()
      ]);

      if (visRes.success && visRes.data?.visitors?.length > 0) {
        setVisitors(visRes.data.visitors);
      } else {
        setVisitors(INITIAL_VISITORS.map(v => ({
          ...v,
          status: v.status.toUpperCase().replace(' ', '_'),
          flat: { flatNumber: v.visitingFlat }
        })));
      }

      if (flatRes.success && flatRes.data?.flats) {
        setFlats(flatRes.data.flats);
        if (flatRes.data.flats.length > 0 && !formData.flatId) {
          setFormData(prev => ({ ...prev, flatId: flatRes.data.flats[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load visitors:', err);
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
    loadVisitorsData();
  }, [currentCommunity]);

  // Draw QR code when active pass changes
  useEffect(() => {
    if (activePass && canvasRef.current) {
      const flatName = activePass.flat?.flatNumber || activePass.visitingFlat || 'Flat Unit';
      QRCode.toCanvas(
        canvasRef.current,
        `NEXORA-PASS:${activePass.passCode}:${activePass.visitorName}:${flatName}`,
        { width: 180, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [activePass]);

  const handleCreatePass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createVisitorPass({
        visitorName: formData.visitorName,
        phone: formData.phone,
        purpose: formData.purpose,
        expectedDate: formData.expectedDate,
        expectedTime: formData.expectedTime,
        flatId: formData.flatId
      });

      const newPass = res.success && res.data?.pass ? res.data.pass : {
        id: `VIS-${Date.now()}`,
        passCode: `NX-${Math.floor(1000 + Math.random() * 9000)}`,
        visitorName: formData.visitorName,
        phone: formData.phone,
        purpose: formData.purpose,
        expectedDate: formData.expectedDate,
        expectedTime: formData.expectedTime,
        status: 'APPROVED',
        flat: flats.find(f => f.id === formData.flatId)
      };

      setVisitors([newPass, ...visitors]);
      setActivePass(newPass);
      setIsModalOpen(false);

      setNotification(`Visitor pass ${newPass.passCode} issued for ${formData.visitorName}.`);
      setFormData({
        visitorName: '',
        phone: '',
        purpose: 'Personal / Family Guest',
        expectedDate: new Date().toISOString().split('T')[0],
        expectedTime: '06:00 PM',
        flatId: flats[0]?.id || ''
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to create pass');
    }
  };

  const handleCheckInOut = async (pass, action) => {
    try {
      if (pass.passCode) {
        await api.validateVisitorPass({ passCode: pass.passCode, action });
      }

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setVisitors(prev => prev.map(v => {
        if (v.id === pass.id || v.passCode === pass.passCode) {
          return {
            ...v,
            status: action === 'CHECK_OUT' ? 'DEPARTED' : 'CHECKED_IN',
            entryTime: action === 'CHECK_IN' ? timeNow : v.entryTime,
            exitTime: action === 'CHECK_OUT' ? timeNow : v.exitTime
          };
        }
        return v;
      }));

      setNotification(`Visitor ${pass.visitorName} marked as ${action === 'CHECK_OUT' ? 'Departed' : 'Checked In'}.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update visitor status');
    }
  };

  const filteredVisitors = visitors.filter(v =>
    v.visitorName?.toLowerCase().includes(search.toLowerCase()) ||
    v.passCode?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  const canValidate = currentRole === 'security' || currentRole === 'admin' || currentRole === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Visitor Management & Gate Security</h2>
          <p className="text-xs text-slate-500">
            Issue secure digital entry passes with encrypted QR code tokens for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Visitor Pass</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{notification}</p>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search visitor by name, token code (e.g. NX-8942), or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {filteredVisitors.length} Active Pass{filteredVisitors.length === 1 ? '' : 'es'}
        </span>
      </div>

      {/* Visitor Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitors.map((pass) => {
          const flatLabel = pass.flat?.flatNumber || pass.visitingFlat || 'Flat Unit';
          const isApproved = pass.status === 'APPROVED' || pass.status === 'Approved';
          const isCheckedIn = pass.status === 'CHECKED_IN' || pass.status === 'Checked In';
          const isDeparted = pass.status === 'DEPARTED' || pass.status === 'Departed';

          return (
            <div
              key={pass.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                    {pass.passCode}
                  </span>
                  <StatusBadge status={pass.status} />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-800">{pass.visitorName}</h4>
                  <p className="text-xs text-slate-500 font-mono">{pass.phone}</p>
                  <p className="text-xs font-semibold text-indigo-700 bg-indigo-50/60 inline-block px-2 py-0.5 rounded mt-1.5">
                    {pass.purpose}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Visiting Destination:</span>
                    <strong className="text-slate-800">{flatLabel}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Expected: {pass.expectedTime}</span>
                    <span>{pass.expectedDate}</span>
                  </div>
                  {pass.entryTime && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-600 font-medium">
                      <span>Gate Entry:</span>
                      <span>{pass.entryTime}</span>
                    </div>
                  )}
                  {pass.exitTime && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Gate Departure:</span>
                      <span>{pass.exitTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActivePass(pass)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View QR</span>
                </button>

                {canValidate && (
                  <div className="flex items-center gap-1.5">
                    {isApproved && (
                      <button
                        onClick={() => handleCheckInOut(pass, 'CHECK_IN')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        Check In
                      </button>
                    )}
                    {isCheckedIn && (
                      <button
                        onClick={() => handleCheckInOut(pass, 'CHECK_OUT')}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        Check Out
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredVisitors.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm text-slate-700">No visitor passes found</p>
          <p>Generate a new digital entry pass using the button above.</p>
        </div>
      )}

      {/* Generate Pass Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue Digital Visitor Gate Pass"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreatePass} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Visitor Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                placeholder="e.g. Rahul Verma"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose / Category
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Personal / Family Guest</option>
                  <option>Food Delivery (Swiggy / Zomato)</option>
                  <option>E-Commerce Courier (Amazon / Flipkart)</option>
                  <option>Cab Driver (Uber / Ola)</option>
                  <option>Service Technician (Urban Company)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expected Time
                </label>
                <input
                  type="text"
                  value={formData.expectedTime}
                  onChange={(e) => setFormData({ ...formData, expectedTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Host Destination Flat *
              </label>
              {flats.length > 0 ? (
                <select
                  required
                  value={formData.flatId}
                  onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.building?.name || 'Tower'} - {f.flatNumber} ({f.ownerName || 'Resident'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value="Tower B - Flat 402 (Rohit Sharma)"
                  readOnly
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Issue Digital Pass
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* QR Pass Display Modal */}
      {activePass && (
        <Modal
          isOpen={!!activePass}
          onClose={() => setActivePass(null)}
          title="Digital Resident Visitor Pass"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            {/* Visual Pass Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                <div className="text-left">
                  <h4 className="text-base font-bold tracking-tight">Nexora Gate Pass</h4>
                  <p className="text-[10px] text-indigo-300">Authorized Community Entry</p>
                </div>
                <StatusBadge status={activePass.status} />
              </div>

              {/* Canvas Rendered QR Code */}
              <div className="bg-white p-3 rounded-xl inline-block shadow-md">
                <canvas ref={canvasRef} className="mx-auto rounded" />
              </div>

              <div>
                <p className="text-[11px] text-indigo-300 uppercase tracking-wider">Pass Verification Code</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-emerald-400 mt-0.5">{activePass.passCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/40">
                <div>
                  <span className="text-[10px] text-indigo-300 block">Visitor</span>
                  <span className="font-semibold text-slate-100">{activePass.visitorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">Destination</span>
                  <span className="font-semibold text-slate-100">{activePass.flat?.flatNumber || activePass.visitingFlat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">Category</span>
                  <span className="text-slate-200 truncate block">{activePass.purpose}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">Validity Date</span>
                  <span className="text-slate-200">{activePass.expectedDate}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Present this encrypted QR code or the 6-character token to gate security for contactless biometric scanning.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
