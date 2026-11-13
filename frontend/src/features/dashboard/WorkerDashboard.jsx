import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Play,
  FileCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_COMPLAINTS } from '../../services/mockData';

export const WorkerDashboard = () => {
  const { t } = useTranslation();
  const { currentUser, currentCommunity } = useDemoAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadJobs = async () => {
    try {
      const res = await api.getComplaints();
      if (res.success && res.data?.complaints?.length > 0) {
        setComplaints(res.data.complaints.map(c => ({
          ...c,
          reportedBy: c.reporter?.name ? `${c.reporter.name} (${c.flat?.flatNumber || 'Flat'})` : (c.reportedBy || 'Resident'),
          assignedTo: c.assignedWorker?.name || c.assignedTo || 'Pending Assignment'
        })));
      } else {
        setComplaints(INITIAL_COMPLAINTS);
      }
    } catch (err) {
      console.error('Failed to load technician jobs:', err);
      setComplaints(INITIAL_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [currentCommunity]);

  // Jobs assigned to Suresh Kumar or pending assignment
  const myJobs = complaints.filter(c => {
    const assigned = (c.assignedTo || '').toLowerCase();
    const workerName = (c.assignedWorker?.name || '').toLowerCase();
    const isMine = assigned.includes('suresh') || workerName.includes('suresh');
    const isPending = assigned.includes('pending') || !c.assignedWorkerId;
    return isMine || isPending;
  });

  const handleStartWork = async (jobId) => {
    try {
      if (jobId && !jobId.startsWith('CMP-2026')) {
        await api.updateComplaintStatus(jobId, { 
          status: 'IN_PROGRESS', 
          note: `Work commenced on site by ${currentUser?.name || 'Suresh Kumar'}` 
        });
      }

      setComplaints(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: 'IN_PROGRESS',
            assignedTo: currentUser?.name || 'Suresh Kumar'
          };
        }
        return job;
      }));

      setActionSuccess(`Job started. Status marked as IN PROGRESS.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const handleConfirmResolution = async (e) => {
    e.preventDefault();
    if (!activeJob) return;

    try {
      if (activeJob.id && !activeJob.id.startsWith('CMP-2026')) {
        await api.updateComplaintStatus(activeJob.id, { 
          status: 'RESOLVED', 
          note: `Work completed by ${currentUser?.name || 'Suresh Kumar'}. Notes: ${resolutionNotes || 'Tested and functional'}` 
        });
      }

      setComplaints(prev => prev.map(job => {
        if (job.id === activeJob.id) {
          return {
            ...job,
            status: 'RESOLVED'
          };
        }
        return job;
      }));

      setActionSuccess(`Job ${activeJob.complaintNumber || activeJob.id} resolved successfully.`);
      setResolveModalOpen(false);
      setActiveJob(null);
      setResolutionNotes('');

      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to complete job');
    }
  };

  const pendingCount = myJobs.filter(j => j.status !== 'RESOLVED' && j.status !== 'Resolved' && j.status !== 'CLOSED' && j.status !== 'Closed').length;
  const completedCount = myJobs.filter(j => j.status === 'RESOLVED' || j.status === 'Resolved' || j.status === 'CLOSED' || j.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Worker Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Technician Work Orders & Field Dispatch</h2>
          <p className="text-xs text-slate-500">
            Assigned maintenance tasks, SLA resolution timers, and job completion reports for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-semibold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Technician Active: {currentUser?.name || 'Suresh Kumar'}
          </span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{actionSuccess}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Active Work Orders"
          value={pendingCount}
          subtitle="Requires on-site resolution"
          icon={Wrench}
          color="indigo"
        />
        <StatCard
          title="Jobs Resolved & Closed"
          value={completedCount}
          subtitle="Signed off this month"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Target SLA Turnaround"
          value="< 4.0 Hours"
          subtitle="Zero SLA breaches this week"
          icon={Clock}
          color="sky"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            My Service Tickets ({myJobs.length})
          </h3>
          <span className="text-xs text-slate-400">Ordered by priority level</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myJobs.map((job) => {
            const isResolved = job.status === 'RESOLVED' || job.status === 'Resolved';
            const isInProgress = job.status === 'IN_PROGRESS' || job.status === 'In Progress';
            const isAssigned = job.status === 'ASSIGNED' || job.status === 'Assigned' || job.status === 'SUBMITTED' || job.status === 'Submitted';

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {job.complaintNumber || job.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={job.priority} />
                      <StatusBadge status={job.status} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">{job.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Category: <strong>{job.category}</strong></span>
                      <span>Reporter: {job.reportedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Worker Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {isAssigned && (
                    <button
                      onClick={() => handleStartWork(job.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start On-Site Inspection</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      onClick={() => {
                        setActiveJob(job);
                        setResolveModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sign Off as Resolved</span>
                    </button>
                  )}

                  {isResolved && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Work Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolve Confirmation Modal */}
      {resolveModalOpen && activeJob && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title={`Complete Job — ${activeJob.complaintNumber || activeJob.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmResolution} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Issue</p>
              <p className="text-sm font-semibold text-slate-800">{activeJob.title}</p>
              <p className="text-xs text-slate-500 mt-1">{activeJob.location}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technician Work Notes & Parts Replaced *
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Tightened overhead flange valve, replaced Teflon seal gasket, zero leaks observed under pressure."
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
                Verify & Close Ticket
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
