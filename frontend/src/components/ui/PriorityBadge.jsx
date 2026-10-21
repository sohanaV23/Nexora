import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, ArrowDown, Clock } from 'lucide-react';

const PRIORITY_CONFIG = {
  'Urgent': {
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle
  },
  'High': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle
  },
  'Medium': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock
  },
  'Low': {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: ArrowDown
  }
};

export const PriorityBadge = ({ priority, className }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Low'];
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        config.bg,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {priority}
    </span>
  );
};
