import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Search, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { INITIAL_PARKING_SLOTS } from '../../services/mockData';

export const ParkingPage = () => {
  const { t } = useTranslation();
  const [slots, setSlots] = useState(INITIAL_PARKING_SLOTS);
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filtered = slots.filter(s => filterLevel === 'ALL' || s.level === filterLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Parking Inventory & Vehicle Directory</h2>
          <p className="text-xs text-slate-500">Conflict-free slot management and vehicle mapping</p>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((s) => (
          <div key={s.slotNumber} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-lg text-indigo-600">{s.slotNumber}</span>
              <StatusBadge status={s.status === 'Allocated' ? 'Checked In' : 'Submitted'} />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">{s.tower} • {s.level}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Type: {s.vehicleType}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="text-[10px] text-slate-400 block uppercase">Allocated Flat</span>
              <span className="font-semibold text-slate-800">{s.allocatedTo || 'Available for Assignment'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
