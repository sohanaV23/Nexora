import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Calendar, 
  Plus, 
  Megaphone, 
  AlertTriangle, 
  Pin, 
  Search, 
  CheckCircle2,
  Users,
  Building2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_NOTICES } from '../../services/mockData';

export const NoticesPage = () => {
  const { t } = useTranslation();
  const { currentRole, currentCommunity } = useDemoAuth();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'MAINTENANCE',
    audience: 'ALL_RESIDENTS',
    isImportant: false
  });

  const loadNotices = async () => {
    try {
      const res = await api.getNotices();
      if (res.success && res.data?.notices?.length > 0) {
        setNotices(res.data.notices);
      } else {
        // Fallback to sample notices
        setNotices(INITIAL_NOTICES.map(n => ({
          ...n,
          category: n.category.toUpperCase()
        })));
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
      setNotices(INITIAL_NOTICES.map(n => ({
        ...n,
        category: n.category.toUpperCase()
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [currentCommunity]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.publishNotice({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        audience: formData.audience,
        isImportant: formData.isImportant
      });

      if (res.success && res.data?.notice) {
        setNotices([res.data.notice, ...notices]);
      } else {
        // Local fallback
        const newNotice = {
          id: `NOT-${Date.now()}`,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          audience: formData.audience,
          isImportant: formData.isImportant,
          publishedAt: new Date().toISOString()
        };
        setNotices([newNotice, ...notices]);
      }

      setSuccessMessage('Community circular published and broadcast successfully.');
      setModalOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'MAINTENANCE',
        audience: 'ALL_RESIDENTS',
        isImportant: false
      });

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to publish notice');
    }
  };

  const filteredNotices = notices.filter(n => {
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    const matchesSearch = 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const canPublish = currentRole === 'admin' || currentRole === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Notice Board & Circulars</h2>
          <p className="text-xs text-slate-500">
            Official announcements, maintenance outages, and society circulars for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        {canPublish && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Circulars' },
            { id: 'MAINTENANCE', label: 'Maintenance' },
            { id: 'EVENT', label: 'Events' },
            { id: 'SECURITY', label: 'Security' },
            { id: 'GENERAL', label: 'General' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                categoryFilter === tab.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((n) => {
          const isImp = n.isImportant;
          const pubDate = n.publishedAt ? new Date(n.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recent';
          
          return (
            <div 
              key={n.id} 
              className={`bg-white rounded-2xl border p-6 shadow-2xs space-y-3 transition-all hover:shadow-xs relative overflow-hidden ${
                isImp ? 'border-amber-300/80 bg-gradient-to-r from-amber-50/20 via-white to-white' : 'border-slate-200/80'
              }`}
            >
              {isImp && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <Pin className="w-2.5 h-2.5" /> High Priority
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    n.category === 'MAINTENANCE' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : n.category === 'EVENT'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : n.category === 'SECURITY'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Audience: <strong className="text-slate-600">{n.audience?.replace('_', ' ') || 'All Residents'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Published on {pubDate}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{n.content}</p>
            </div>
          );
        })}

        {filteredNotices.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm text-slate-700">No notices found</p>
            <p>There are no circulars matching your current filter.</p>
          </div>
        )}
      </div>

      {/* Publish Notice Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Publish Community Circular"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Overhead Water Tank Cleaning & Shutdown"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="EVENT">Community Event</option>
                  <option value="SECURITY">Gate & Security</option>
                  <option value="GENERAL">General Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Audience Scope
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL_RESIDENTS">All Residents</option>
                  <option value="OWNERS_ONLY">Flat Owners Only</option>
                  <option value="TENANTS_ONLY">Tenants Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notice Content *
              </label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Provide specific timings, affected towers, and safety instructions..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isImportant"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <label htmlFor="isImportant" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                Pin as High Priority Announcement
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
