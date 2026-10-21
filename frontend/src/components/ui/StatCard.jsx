import React from 'react';
import clsx from 'clsx';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl flex items-center justify-center', colorStyles[color] || colorStyles.indigo)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={clsx('font-semibold', trend.positive ? 'text-emerald-600' : 'text-rose-600')}>
              {trend.positive ? '+' : ''}{trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
