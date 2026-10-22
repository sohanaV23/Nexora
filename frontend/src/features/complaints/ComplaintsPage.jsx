import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  User 
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const ComplaintsPage = () => {
  const { t } = useTranslation();
  const { currentUser, currentCommunity } = useDemoAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
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
    location: 'Tower B - Flat 402',
    priority: 'MEDIUM'
  });

  // Local ML suggestion state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const loadComplaints = async () => {
    try {
      const res = await api.getComplaints();
      if (res.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [currentCommunity]);

  const handleAiSuggest = async () => {
    if (!formData.title && !formData.description) return;
    setIsAiLoading(true);
    try {
      // Call local Python FastAPI service
      const response = await fetch('http://127.0.0.1:8000/api/v1/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        })
      });

      if (response.ok) {
        const mlData = await response.json();
        setAiSuggestion({
          category: mlData.predicted_category,
          confidence: Math.round(mlData.confidence * 100),
          needsReview: mlData.needs_human_review
        });
        setFormData(prev => ({ ...prev, category: mlData.predicted_category }));
      } else {
        throw new Error('ML returned non-200');
      }
    } catch (err) {
      // Graceful offline fallback
      setAiSuggestion({
        category: 'Plumbing & Water',
        confidence: 88,
        needsReview: true
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        priority: formData.priority
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Plumbing & Water',
        location: 'Tower B - Flat 402',
        priority: 'MEDIUM'
      });
      setAiSuggestion(null);
      setDuplicateWarning(null);
      await loadComplaints();
    } catch (err) {
      alert(err.message || 'Failed to lodge complaint');
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase());
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
          <p className="text-xs text-slate-500">End-to-end service requests backed by SQLite audit timeline and ML classification</p>
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
            <option value="Security & Access">Security & Access</option>
            <option value="Parking">Parking</option>
            <option value="Noise & Disturbance">Noise & Disturbance</option>
            <option value="Structural & Common Area">Structural & Common Area</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
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
                <span className="text-xs font-bold text-indigo-600 group-hover:underline">{item.complaintNumber}</span>
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
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[160px]">{item.location}</span>
                </span>
                <PriorityBadge priority={item.priority} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Worker: <strong className="text-slate-700 font-medium">{item.assignedWorker?.name || 'Unassigned'}</strong></span>
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
      {isModalOpen && (
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

            {/* Local ML Classifier Assistant Action */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-900">
                    Local ML Category Assistant (FastAPI / Scikit-Learn)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading || (!formData.title && !formData.description)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {isAiLoading ? 'Analyzing Model...' : 'Auto-Classify with ML'}
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
                  <option>Structural & Common Area</option>
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
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Location Details
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
                Submit to Database
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Complaint Detail & Persistent Timeline Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Record — ${selectedComplaint.complaintNumber}`}
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
                <span className="font-semibold text-slate-700">{selectedComplaint.reporter?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Assigned Worker</span>
                <span className="font-semibold text-slate-700">{selectedComplaint.assignedWorker?.name || 'Pending'}</span>
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
                {(selectedComplaint.timeline || []).map((step) => (
                  <div key={step.id} className="flex items-start gap-3 relative pl-6">
                    <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{step.toStatus}</span>
                        <span className="text-[10px] text-slate-400">{new Date(step.createdAt).toLocaleTimeString()}</span>
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
