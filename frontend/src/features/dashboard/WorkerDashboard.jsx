import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Play,
  FileCheck
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_COMPLAINTS } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const WorkerDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Jobs assigned to Suresh Kumar
  const myJobs = complaints.filter(c => c.assignedTo.includes('Suresh Kumar') || c.assignedTo === 'Pending Assignment');

  const handleStartWork = (jobId) => {
    setComplaints(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: 'In Progress',
          timeline: [
            ...job.timeline,
            { status: 'In Progress', timestamp: 'Just now', note: `Work commenced on site by ${currentUser.name}` }
          ]
        };
      }
      return job;
    }));
  };

  const handleConfirmResolution = (e) => {
    e.preventDefault();
    if (!activeJob) return;

    setComplaints(prev => prev.map(job => {
      if (job.id === activeJob.id) {
        return {
          ...job,
          status: 'Resolved',
          timeline: [
            ...job.timeline,
            { 
              status: 'Resolved', 
              timestamp: 'Just now', 
              note: `Work completed by ${currentUser.name}. Notes: ${resolutionNotes || 'Tested and fully operational'}` 
            }
          ]
        };
      }
      return job;
    }));

    setResolveModalOpen(false);
    setActiveJob(null);
    setResolutionNotes('');
  };

  const pendingCount = myJobs.filter(j => j.status !== 'Resolved' && j.status !== 'Closed').length;
  const completedCount = myJobs.filter(j => j.status === 'Resolved' || j.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Worker Greeting */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-0.5 rounded border border-amber-500/30">
              Staff Portal
            </span>
            <span className="text-xs text-slate-400">{currentUser.specialization}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Active Work Queue: {currentUser.name}</h2>
          <p className="text-xs text-slate-400 mt-1">Review assigned jobs, verify location, and update progress timestamps.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Tasks"
          value={pendingCount}
          subtitle="Awaiting action"
          icon={Wrench}
          color="indigo"
        />
        <StatCard
          title="Jobs In Progress"
          value={myJobs.filter(j => j.status === 'In Progress').length}
          subtitle="Currently active"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed This Week"
          value={completedCount}
          subtitle="Verified by residents"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Assigned Tasks Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Assigned Maintenance Tasks</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600">{job.id}</span>
                    <span className="text-xs text-slate-400">• {job.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mt-1">{job.title}</h4>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {job.description}
              </p>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Reported by: <strong className="text-slate-800">{job.reportedBy}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>SLA Resolution Target: {job.slaTargetHours} Hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                {job.status === 'Assigned' && (
                  <button
                    onClick={() => handleStartWork(job.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Work</span>
                  </button>
                )}
                {job.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      setActiveJob(job);
                      setResolveModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Complete & Mark Resolved</span>
                  </button>
                )}
                {job.status === 'Resolved' && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolution Recorded</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Confirmation Modal */}
      {resolveModalOpen && activeJob && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title={`Record Job Resolution — ${activeJob.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmResolution} className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Issue Title</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{activeJob.title}</p>
              <p className="text-xs text-slate-500">{activeJob.location}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technician Resolution Notes *
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain the fix applied (e.g. replaced worn rubber washer, tested water pressure for 10 mins)..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
