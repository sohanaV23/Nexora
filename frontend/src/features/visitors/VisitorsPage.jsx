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
  Download
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_VISITORS } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const VisitorsPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePass, setActivePass] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Personal / Family Guest',
    expectedDate: '2026-10-22',
    expectedTime: '06:00 PM',
    visitingFlat: currentUser.flat || 'Tower B - Flat 402'
  });

  const canvasRef = useRef(null);

  // Draw QR code when active pass changes
  useEffect(() => {
    if (activePass && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        `NEXORA-PASS:${activePass.passCode}:${activePass.visitorName}:${activePass.visitingFlat}`,
        { width: 180, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [activePass]);

  const handleCreatePass = (e) => {
    e.preventDefault();
    const randomCode = `NX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPass = {
      id: `VIS-00${visitors.length + 1}`,
      passCode: randomCode,
      visitorName: formData.visitorName,
      phone: formData.phone,
      visitingFlat: formData.visitingFlat,
      purpose: formData.purpose,
      expectedDate: formData.expectedDate,
      expectedTime: formData.expectedTime,
      status: 'Approved',
      entryTime: null,
      exitTime: null
    };

    setVisitors([newPass, ...visitors]);
    setActivePass(newPass);
    setIsModalOpen(false);
    setFormData({
      visitorName: '',
      phone: '',
      purpose: 'Personal / Family Guest',
      expectedDate: '2026-10-22',
      expectedTime: '06:00 PM',
      visitingFlat: currentUser.flat || 'Tower B - Flat 402'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Visitor Management & Gate Security</h2>
          <p className="text-xs text-slate-500">Issue secure, time-limited digital entry passes with simulated QR validation</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Visitor Pass</span>
        </button>
      </div>

      {/* Visitor Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visitors.map((pass) => (
          <div
            key={pass.id}
            onClick={() => setActivePass(pass)}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {pass.passCode}
                </span>
                <StatusBadge status={pass.status} />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-800">{pass.visitorName}</h4>
                <p className="text-xs text-slate-500">{pass.phone}</p>
                <p className="text-xs font-medium text-slate-700 mt-1">{pass.purpose}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Visiting: <strong className="text-slate-800 font-medium">{pass.visitingFlat}</strong></span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Arrival: {pass.expectedTime}</span>
                <span>{pass.expectedDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Pass Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Visitor Pass"
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
              placeholder="e.g. Rahul Sharma"
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
                Category / Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Personal / Family Guest</option>
                <option>Food Delivery</option>
                <option>E-Commerce Courier</option>
                <option>Cab / Taxi Driver</option>
                <option>Home Service Provider</option>
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
              Host Destination Flat
            </label>
            <input
              type="text"
              value={formData.visitingFlat}
              onChange={(e) => setFormData({ ...formData, visitingFlat: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              Issue Pass
            </button>
          </div>
        </form>
      </Modal>

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
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-lg space-y-4 relative overflow-hidden">
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
                  <span className="text-[10px] text-indigo-300 block">Flat</span>
                  <span className="font-semibold text-slate-100">{activePass.visitingFlat}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">Purpose</span>
                  <span className="text-slate-200">{activePass.purpose}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">Valid On</span>
                  <span className="text-slate-200">{activePass.expectedDate} {activePass.expectedTime}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Show this QR code or 6-character pass token to security at the gate for automated validation.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
