import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_COMPLAINTS } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const ComplaintsPage = () => {
  const { t } = useTranslation();
  const { currentUser, currentRole } = useDemoAuth();

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // New Complaint Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plumbing & Water',
    location: currentUser.flat || 'Tower B - Flat 402',
    priority: 'Medium'
  });

  // Local ML suggestion state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handleAiSuggest = () => {
    if (!formData.title && !formData.description) return;
    setIsAiLoading(true);
    setTimeout(() => {
      const text = (formData.title + ' ' + formData.description).toLowerCase();
      let suggested = 'Other';
      let confidence = 0.88;

      if (text.includes('water') || text.includes('leak') || text.includes('tap') || text.includes('pipe') || text.includes('drain')) {
        suggested = 'Plumbing & Water';
        confidence = 0.96;
      } else if (text.includes('lift') || text.includes('elevator') || text.includes('stuck') || text.includes('floor')) {
        suggested = 'Elevator & Lift';
        confidence = 0.98;
      } else if (text.includes('power') || text.includes('light') || text.includes('wire') || text.includes('fuse') || text.includes('mcb')) {
        suggested = 'Electrical';
        confidence = 0.94;
      } else if (text.includes('garbage') || text.includes('clean') || text.includes('smell') || text.includes('odor')) {
        suggested = 'Cleaning & Waste';
        confidence = 0.92;
      } else if (text.includes('parking') || text.includes('car') || text.includes('vehicle') || text.includes('slot')) {
        suggested = 'Parking';
        confidence = 0.95;
      } else if (text.includes('noise') || text.includes('music') || text.includes('loud')) {
        suggested = 'Noise & Disturbance';
        confidence = 0.90;
      }

      setAiSuggestion({ category: suggested, confidence: Math.round(confidence * 100) });
      setFormData(prev => ({ ...prev, category: suggested }));
      setIsAiLoading(false);

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
      reportedBy: `${currentUser.name} (${currentUser.flat || 'Admin Log'})`,
      assignedTo: 'Pending Assignment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaTargetHours: formData.priority === 'Urgent' ? 4 : formData.priority === 'High' ? 8 : 24,
      isOverdue: false,
      confidenceScore: aiSuggestion ? aiSuggestion.confidence / 100 : 0.90,
      timeline: [
        { status: 'Submitted', timestamp: 'Just now', note: 'Complaint logged into Nexora system' }
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

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Complaints & Maintenance Hub</h2>
          <p className="text-xs text-slate-500">End-to-end service requests with SLA accountability and status tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('complaints.new_complaint')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaints by title, location or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Plumbing & Water">Plumbing & Water</option>
            <option value="Electrical">Electrical</option>
            <option value="Elevator & Lift">Elevator & Lift</option>
            <option value="Cleaning & Waste">Cleaning & Waste</option>
            <option value="Parking">Parking</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedComplaint(item)}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 group-hover:underline">{item.id}</span>
                <StatusBadge status={item.status} />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.category}</span>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mt-0.5 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[160px]">{item.location}</span>
                </span>
                <PriorityBadge priority={item.priority} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Worker: <strong className="text-slate-700 font-medium">{item.assignedTo}</strong></span>
                <span className="flex items-center gap-1 font-semibold text-indigo-600">
                  <Clock className="w-3 h-3" />
                  {item.slaTargetHours}h SLA
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* File Complaint Modal */}
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
              placeholder="e.g. Water leak in kitchen pipe or lift motor jerking"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              placeholder="Describe what happened, noise levels, leaks, or safety hazards..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {/* Complaint Detail & History Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Record — ${selectedComplaint.id}`}
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
                <span className="text-slate-400 block text-[10px] uppercase">SLA Target</span>
                <span className="font-semibold text-indigo-600">{selectedComplaint.slaTargetHours} Hours</span>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Audit History & State Transitions</h4>
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
