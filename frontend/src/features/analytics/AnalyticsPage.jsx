import React, { useState, useEffect } from 'react';
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
import { Download, TrendingUp, AlertTriangle, CheckCircle2, Clock, Building2, ShieldCheck, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';

const DEFAULT_CATEGORY_DATA = [
  { name: 'Plumbing & Water', value: 14, color: '#3b82f6' },
  { name: 'Electrical', value: 10, color: '#f59e0b' },
  { name: 'Elevator & Lift', value: 8, color: '#ef4444' },
  { name: 'Cleaning & Waste', value: 7, color: '#10b981' },
  { name: 'Parking & Security', value: 5, color: '#6366f1' }
];

const MONTHLY_TREND_DATA = [
  { month: 'Jun', total: 18, resolved: 17 },
  { month: 'Jul', total: 24, resolved: 22 },
  { month: 'Aug', total: 29, resolved: 26 },
  { month: 'Sep', total: 34, resolved: 31 },
  { month: 'Oct', total: 21, resolved: 19 }
];

const PALETTE = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'];

export const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { currentCommunity } = useDemoAuth();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getAnalytics();
        if (res.success && res.data) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [currentCommunity]);

  // Derived Category Data
  const categoryData = analyticsData?.categoryDistribution?.length > 0
    ? analyticsData.categoryDistribution.map((item, idx) => ({
        name: item.name,
        value: item.value,
        color: PALETTE[idx % PALETTE.length]
      }))
    : DEFAULT_CATEGORY_DATA;

  // Derived Recurring Faults
  const recurringFaults = analyticsData?.recurringFaults?.length > 0
    ? analyticsData.recurringFaults
    : [
        { facility: 'Tower A - Passenger Lift 2', faultCount: 4, issue: 'Door sensor alignment & motor jerk', status: 'Requires Preventative AMC' },
        { facility: 'Tower B - Basement 1 (Pillar P-42)', faultCount: 3, issue: 'Overhead drain pipe valve drip', status: 'Requires Preventative AMC' },
        { facility: 'Tower A - 7th Floor Garbage Chute', faultCount: 2, issue: 'Flap spring latch stuck', status: 'Monitored' }
      ];

  const summary = analyticsData?.summary || {
    totalComplaints: 21,
    resolvedComplaints: 19,
    openComplaints: 2,
    resolutionRate: '90.5',
    totalBilledPaise: 3100000,
    totalCollectedPaise: 2750000
  };

  const billedRupees = (summary.totalBilledPaise || 0) / 100;
  const collectedRupees = (summary.totalCollectedPaise || 0) / 100;
  const collectionRate = billedRupees > 0 ? Math.round((collectedRupees / billedRupees) * 100) : 92;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Operational Analytics</h2>
          <p className="text-xs text-slate-500">
            Real-time service reliability trends, SLA performance metrics, and equipment failure hotspots for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
      </div>

      {/* Top Metrics StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall SLA Compliance"
          value={`${summary.resolutionRate}%`}
          subtitle="Target: >90% Resolution"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Work Orders"
          value={`${summary.openComplaints} Open`}
          subtitle={`${summary.resolvedComplaints} resolved this month`}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Recurring Fault Locations"
          value={`${recurringFaults.length} Hotspots`}
          subtitle="Identified for AMC overhaul"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Maintenance Collection"
          value={`${collectionRate}%`}
          subtitle={`₹${collectedRupees.toLocaleString('en-IN')} of ₹${billedRupees.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Complaint Volume & Resolutions</h3>
              <p className="text-xs text-slate-400">Monthly progression over past 5 periods</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="total" name="Total Logged" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Category Distribution</h3>
              <p className="text-xs text-slate-400">Volume share by service domain</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Equipment Hotspots Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Recurring Failure Analysis & Preventative AMC Review</h3>
          </div>
          <span className="text-xs text-slate-400">Automated audit cluster detector</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Equipment / Facility Location</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Diagnostic Finding</th>
                <th className="py-3 px-4 text-right">Maintenance Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recurringFaults.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.facility}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {row.faultCount} Incidents Logged
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{row.issue}</td>
                  <td className="py-3 px-4 text-right font-medium text-indigo-600">
                    {row.status || 'Requires Preventative AMC'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
