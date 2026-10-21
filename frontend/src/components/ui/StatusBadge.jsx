import React from 'react';
import clsx from 'clsx';

const STATUS_CONFIG = {
  'Submitted': { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Acknowledged': { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  'Assigned': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'In Progress': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Resolved': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Closed': { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  'Reopened': { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Overdue': { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  'Paid': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Pending': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Approved': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Checked In': { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' }
};

export const StatusBadge = ({ status, className }) => {
  const config = STATUS_CONFIG[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.bg,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  );
};
