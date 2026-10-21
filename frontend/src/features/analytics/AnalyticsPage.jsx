import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Download, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';

const MONTHLY_DATA = [
  { month: 'Jun', total: 18, resolved: 17 },
  { month: 'Jul', total: 24, resolved: 22 },
  { month: 'Aug', total: 29, resolved: 26 },
  { month: 'Sep', total: 34, resolved: 31 },
  { month: 'Oct', total: 21, resolved: 16 }
];

const CATEGORY_DATA = [
  { name: 'Plumbing & Water', value: 14, color: '#3b82f6' },
  { name: 'Electrical', value: 10, color: '#f59e0b' },
  { name: 'Elevator & Lift', value: 8, color: '#ef4444' },
  { name: 'Cleaning & Waste', value: 7, color: '#10b981' },
  { name: 'Parking & Security', value: 5, color: '#6366f1' }
];

const RECURRING_FAULTS = [
  { facility: 'Tower A - Passenger Lift 2', faultCount: 4, issue: 'Door sensor alignment & motor jerk', lastIncident: '2026-10-21' },
  { facility: 'Tower B - Basement 1 (Pillar P-42)', faultCount: 3, issue: 'Overhead drain pipe valve drip', lastIncident: '2026-10-21' },
  { facility: 'Tower A - 7th Floor Garbage Chute', faultCount: 2, issue: 'Flap spring latch stuck', lastIncident: '2026-10-18' }
];

export const AnalyticsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Operational Analytics</h2>
          <p className="text-xs text-slate-500">Service reliability trends, SLA breach indicators, and recurring failure hotspots</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall SLA Compliance"
          value="91.4%"
          subtitle="Target: >90%"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Avg. Resolution Time"
          value="6.2 Hours"
          subtitle="Across all categories"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Recurring Fault Locations"
          value="3 Facilities"
          subtitle="Identified for AMC review"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Monthly Resolution Rate"
          value="94.2%"
          subtitle="+2.4% vs last month"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Complaint Trend Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Complaint Volume & Resolutions</h3>
              <p className="text-xs text-slate-400">Past 5 months activity</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" name="Total Filed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Category Distribution</h3>
              <p className="text-xs text-slate-400">Breakdown of reported issues</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recurring Fault Analytics (Real Differentiator) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recurring Fault Hotspots (Equipment & Infrastructure)
            </h3>
            <p className="text-xs text-slate-500">
              Statistical detection of repeated breakdowns within 60-day window
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
            Requires Preventative AMC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Equipment / Facility</th>
                <th className="py-3 px-4">Repeated Incident Count</th>
                <th className="py-3 px-4">Identified Failure Mode</th>
                <th className="py-3 px-4 text-right">Last Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {RECURRING_FAULTS.map((rf, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{rf.facility}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {rf.faultCount} Failures
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{rf.issue}</td>
                  <td className="py-3.5 px-4 text-right text-slate-500">{rf.lastIncident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
