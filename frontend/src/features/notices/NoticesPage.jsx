import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Calendar, Plus, Megaphone } from 'lucide-react';
import { INITIAL_NOTICES } from '../../services/mockData';
import { Modal } from '../../components/ui/Modal';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const NoticesPage = () => {
  const { t } = useTranslation();
  const { currentRole } = useDemoAuth();

  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Maintenance',
    audience: 'All Residents'
  });

  const handleCreateNotice = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `NOT-0${notices.length + 1}`,
      communityId: 'comm-1',
      title: formData.title,
      content: formData.content,
      category: formData.category,
      audience: formData.audience,
      publishedAt: new Date().toISOString().split('T')[0],
      expiresAt: '2026-11-01',
      isImportant: true
    };
    setNotices([newEntry, ...notices]);
    setModalOpen(false);
    setFormData({ title: '', content: '', category: 'Maintenance', audience: 'All Residents' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Notice Board</h2>
          <p className="text-xs text-slate-500">Official circulars, maintenance schedules, and association announcements</p>
        </div>
        {currentRole === 'admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {n.category}
                </span>
                <span className="text-xs text-slate-400">Audience: <strong>{n.audience}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Published on {n.publishedAt}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Publish Community Notice"
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
                placeholder="e.g. Water Tank Cleaning Schedule"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option>Maintenance</option>
                <option>Event</option>
                <option>Security</option>
                <option>General</option>
              </select>
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
                placeholder="Detailed text of the announcement..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
