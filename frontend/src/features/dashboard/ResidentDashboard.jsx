import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Plus, 
  Clock, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_COMPLAINTS, INITIAL_NOTICES, INITIAL_VISITORS, INITIAL_DUES } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const ResidentDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State for new complaint
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plumbing & Water',
    location: currentUser.flat || 'Tower B - Flat 402',
    priority: 'Medium'
  });

  // ML Category suggestion simulation state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Local helper for AI category suggestion demo
  const handleAiSuggest = () => {
    if (!formData.title && !formData.description) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const text = (formData.title + ' ' + formData.description).toLowerCase();
      let suggested = 'Other';
      let confidence = 0.88;

      if (text.includes('water') || text.includes('leak') || text.includes('tap') || text.includes('pipe') || text.includes('flush')) {
        suggested = 'Plumbing & Water';
        confidence = 0.95;
      } else if (text.includes('lift') || text.includes('elevator') || text.includes('stuck')) {
        suggested = 'Elevator & Lift';
        confidence = 0.97;
      } else if (text.includes('power') || text.includes('light') || text.includes('wire') || text.includes('switch') || text.includes('mcb')) {
        suggested = 'Electrical';
        confidence = 0.94;
      } else if (text.includes('garbage') || text.includes('clean') || text.includes('smell') || text.includes('waste')) {
        suggested = 'Cleaning & Waste';
        confidence = 0.91;
      } else if (text.includes('park') || text.includes('car') || text.includes('bike') || text.includes('slot')) {
        suggested = 'Parking';
        confidence = 0.93;
      }

      setAiSuggestion({ category: suggested, confidence: Math.round(confidence * 100) });
      setFormData(prev => ({ ...prev, category: suggested }));
      setIsAiLoading(false);

      // Check for local duplicate similarity
      if (text.includes('leak') && text.includes('basement')) {
        setDuplicateWarning({
          matchId: 'CMP-2026-001',
          matchTitle: 'Water leakage in Tower B basement parking ceiling',
          status: 'In Progress'
        });
      } else {
        setDuplicateWarning(null);
      }
    }, 600);
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    const newId = `CMP-2026-00${complaints.length + 1}`;
    const newEntry = {
      id: newId,
      communityId: 'comm-1',
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      priority: formData.priority,
      status: 'Submitted',
      reportedBy: `${currentUser.name} (${currentUser.flat})`,
      assignedTo: 'Pending Assignment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaTargetHours: formData.priority === 'Urgent' ? 4 : formData.priority === 'High' ? 8 : 24,
      isOverdue: false,
      confidenceScore: aiSuggestion ? aiSuggestion.confidence / 100 : 0.90,
      timeline: [
        { status: 'Submitted', timestamp: 'Just now', note: 'Complaint logged by resident' }
      ]
    };

    setComplaints([newEntry, ...complaints]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'Plumbing & Water',
      location: currentUser.flat || 'Tower B - Flat 402',
      priority: 'Medium'
    });
    setAiSuggestion(null);
    setDuplicateWarning(null);
  };

  const myComplaints = complaints.filter(c => c.reportedBy.includes(currentUser.name) || c.reportedBy.includes('B-402'));
  const openCount = myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-400/20">
                {currentUser.flat}
              </span>
              <span className="text-xs text-indigo-200">Resident Portal</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t('common.welcome')}, {currentUser.name}!
            </h2>
            <p className="text-sm text-indigo-200 mt-1 max-w-xl">
              Track maintenance requests, approve visitors, pay monthly dues, and stay updated with your community.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-semibold text-sm shadow-lg hover:bg-indigo-50 transition-all shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('complaints.new_complaint')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Complaints"
          value={openCount}
          subtitle="Issues in resolution"
          icon={AlertCircle}
          color="indigo"
        />
        <StatCard
          title="Maintenance Dues"
          value="₹ 3,500"
          subtitle="Next due: Nov 15, 2026"
          icon={CreditCard}
          color="amber"
        />
        <StatCard
          title="Expected Visitors"
          value="1 Guest"
          subtitle="Pass active for today"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Community Notices"
          value={INITIAL_NOTICES.length}
          subtitle="2 unread announcements"
          icon={Bell}
          color="sky"
        />
      </div>

      {/* Active Complaints & Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">My Complaints & Issues</h3>
              <p className="text-xs text-slate-500">Live SLA and assignment status</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {myComplaints.length} Total Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myComplaints.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedComplaint(item)}
                className="py-4 hover:bg-slate-50/70 p-3 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">{item.id}</span>
                      <span className="text-xs text-slate-400">• {item.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>Assigned to: <strong className="text-slate-600 font-medium">{item.assignedTo}</strong></span>
                      <span>•</span>
                      <span>Target: {item.slaTargetHours}h SLA</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Community Notices</h3>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-3">
              {INITIAL_NOTICES.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{n.publishedAt}</span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-800">{n.title}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visitor Pass Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800">Today's Visitor Pass</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Pass Code</p>
                  <p className="text-base font-mono font-bold text-emerald-400">NX-8942</p>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Approved
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Amit Verma</p>
                <p className="text-[11px] text-slate-400">Personal / Family Guest • 06:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Complaint Modal with Local ML Suggestion Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File a New Maintenance Request"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Water dripping from bathroom tap or Lift 2 door jammed"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description & Details *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide specific details about the issue and exact location..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* AI Category Assistant Action */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-900">
                  AI Category & Duplicate Assistant
                </span>
              </div>
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading || (!formData.title && !formData.description)}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isAiLoading ? 'Analyzing...' : 'Auto-Classify'}
              </button>
            </div>

            {aiSuggestion && (
              <div className="text-xs text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-200 flex items-center justify-between">
                <span>
                  Suggested Category: <strong>{aiSuggestion.category}</strong>
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {aiSuggestion.confidence}% Confidence
                </span>
              </div>
            )}

            {duplicateWarning && (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Possible Duplicate Notice:</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Similar active complaint found: <strong>{duplicateWarning.matchTitle}</strong> ({duplicateWarning.matchId}) — {duplicateWarning.status}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Plumbing & Water</option>
                <option>Electrical</option>
                <option>Elevator & Lift</option>
                <option>Cleaning & Waste</option>
                <option>Security & Access</option>
                <option>Parking</option>
                <option>Noise & Disturbance</option>
                <option>Structural / Common Area</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Location / Flat
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-all"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Detail & Timeline Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details — ${selectedComplaint.id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {selectedComplaint.category}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Location: {selectedComplaint.location}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {selectedComplaint.description}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Reported By</span>
                <span className="font-semibold text-slate-700">{selectedComplaint.reportedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Assigned Worker</span>
                <span className="font-semibold text-slate-700">{selectedComplaint.assignedTo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">SLA Window</span>
                <span className="font-semibold text-indigo-600">{selectedComplaint.slaTargetHours} Hours</span>
              </div>
            </div>

            {/* Persistent State Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Audit Timeline & History</h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {selectedComplaint.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative pl-6">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{step.status}</span>
                        <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-500 mt-1">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
