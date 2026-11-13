import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Users
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_COMPLAINTS } from '../../services/mockData';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentCommunity } = useDemoAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('Suresh Kumar');
  const [pendingDuesCount, setPendingDuesCount] = useState(1);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      const [cmpRes, invRes] = await Promise.all([
        api.getComplaints(),
        api.getInvoices()
      ]);

      if (cmpRes.success && cmpRes.data?.complaints?.length > 0) {
        setComplaints(cmpRes.data.complaints.map(c => ({
          ...c,
          reportedBy: c.reporter?.name ? `${c.reporter.name} (${c.flat?.flatNumber || 'Flat'})` : (c.reportedBy || 'Resident'),
          assignedTo: c.assignedWorker?.name || c.assignedTo || 'Unassigned',
          status: c.status
        })));
      } else {
        setComplaints(INITIAL_COMPLAINTS);
      }

      if (invRes.success && invRes.data?.invoices) {
        const pending = invRes.data.invoices.filter(i => 
          i.payments?.some(p => p.status === 'PENDING_VERIFICATION')
        ).length;
        setPendingDuesCount(pending);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setComplaints(INITIAL_COMPLAINTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCommunity]);

  // Filter complaints
  const filteredComplaints = complaints.filter(item => {
    const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const locMatch = (item.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = (item.complaintNumber || item.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || locMatch || idMatch;

    const currentStatus = (item.status || '').toUpperCase().replace(' ', '_');
    const filterStatusUpper = statusFilter.toUpperCase().replace(' ', '_');
    const matchesStatus = statusFilter === 'ALL' || currentStatus === filterStatusUpper;

    const currentCat = (item.category || '').toLowerCase();
    const filterCatLower = categoryFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'ALL' || currentCat.includes(filterCatLower);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      if (selectedComplaint.id && !selectedComplaint.id.startsWith('CMP-2026')) {
        await api.assignComplaintWorker(selectedComplaint.id, { workerName: selectedWorker });
      }

      setComplaints(prev => prev.map(c => {
        if (c.id === selectedComplaint.id) {
          return {
            ...c,
            status: 'ASSIGNED',
            assignedTo: selectedWorker
          };
        }
        return c;
      }));

      setActionSuccess(`Assigned ticket ${selectedComplaint.complaintNumber || selectedComplaint.id} to ${selectedWorker}.`);
      setAssignModalOpen(false);
      setSelectedComplaint(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to assign worker');
    }
  };

  const handleUpdateStatus = async (complaintId, nextStatus) => {
    try {
      const statusUpper = nextStatus.toUpperCase().replace(' ', '_');
      if (complaintId && !complaintId.startsWith('CMP-2026')) {
        await api.updateComplaintStatus(complaintId, { status: statusUpper });
      }

      setComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return { ...c, status: statusUpper };
        }
        return c;
      }));

      setActionSuccess(`Ticket status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const overdueCount = complaints.filter(c => c.isOverdue || c.status === 'OVERDUE' || c.status === 'Overdue').length;
  const inProgressCount = complaints.filter(c => 
    c.status === 'IN_PROGRESS' || c.status === 'In Progress' || c.status === 'ASSIGNED' || c.status === 'Assigned'
  ).length;
  const openCount = complaints.filter(c => 
    c.status !== 'RESOLVED' && c.status !== 'Resolved' && c.status !== 'CLOSED' && c.status !== 'Closed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Association Operations Cockpit</h2>
          <p className="text-xs text-slate-500">
            Real-time facility management, SLA compliance, and maintenance governance for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["ID,Title,Category,Status,Priority,Location,AssignedTo"]
                .concat(complaints.map(c => `"${c.complaintNumber || c.id}","${c.title}","${c.category}","${c.status}","${c.priority}","${c.location}","${c.assignedTo}"`))
                .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "nexora_complaints_report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{actionSuccess}</p>
        </div>
      )}

      {/* KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Open Requests"
          value={openCount}
          subtitle="Awaiting resolution"
          icon={AlertCircle}
          color="indigo"
        />
        <StatCard
          title="SLA Overdue Issues"
          value={overdueCount}
          subtitle="Escalation active"
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="In Progress Jobs"
          value={inProgressCount}
          subtitle="Assigned to staff"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Payments Pending Audit"
          value={`${pendingDuesCount} Queue`}
          subtitle="Awaiting admin verification"
          icon={CreditCard}
          color="sky"
        />
      </div>

      {/* Complaints Management Table with Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, keyword, or flat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Plumbing">Plumbing & Water</option>
              <option value="Electrical">Electrical</option>
              <option value="Elevator">Elevator & Lift</option>
              <option value="Cleaning">Cleaning & Waste</option>
              <option value="Security">Security & Access</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ticket ID & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No service tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-indigo-600">{c.complaintNumber || c.id}</div>
                      <div className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{c.title}</div>
                      <div className="text-[11px] text-slate-400">By {c.reportedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{c.category}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 line-clamp-1 max-w-[140px]">{c.location}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{c.assignedTo}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setAssignModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors"
                          title="Assign or reassign maintenance staff"
                        >
                          Assign
                        </button>
                        {(c.status === 'SUBMITTED' || c.status === 'Submitted') && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'ACKNOWLEDGED')}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-medium transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {(c.status === 'IN_PROGRESS' || c.status === 'In Progress') && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && selectedComplaint && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Technician — ${selectedComplaint.complaintNumber || selectedComplaint.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAssignWorker} className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Issue Description</p>
              <p className="text-sm font-semibold text-slate-800">{selectedComplaint.title}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Technician / Maintenance Worker
              </label>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Suresh Kumar">Suresh Kumar (Senior Electrician & Plumbing)</option>
                <option value="Otis Certified Technician">Otis Certified Technician (Elevator AMC)</option>
                <option value="Sanitation Team">Sanitation & Waste Disposal Team</option>
                <option value="Security Field Lead">Security Field Officer</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
