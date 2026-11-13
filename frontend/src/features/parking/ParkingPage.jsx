import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Car, 
  Search, 
  CheckCircle2, 
  Plus, 
  Zap, 
  ShieldCheck, 
  Filter, 
  Key, 
  User, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_PARKING_SLOTS } from '../../services/mockData';

export const ParkingPage = () => {
  const { t } = useTranslation();
  const { currentRole, currentCommunity } = useDemoAuth();

  const [slots, setSlots] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL'); // 'ALL' | 'Basement 1' | 'Basement 2'
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ALLOCATED' | 'AVAILABLE'

  // Allocation Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetFlatId, setTargetFlatId] = useState('');
  const [targetVehicleType, setTargetVehicleType] = useState('4-Wheeler');
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadParkingData = async () => {
    try {
      const [parkingRes, flatsRes] = await Promise.all([
        api.getParkingSlots(),
        api.getFlats()
      ]);

      if (parkingRes.success && parkingRes.data?.parkingSlots?.length > 0) {
        setSlots(parkingRes.data.parkingSlots);
      } else {
        // Fallback to mock data with database IDs
        setSlots(INITIAL_PARKING_SLOTS.map((s, idx) => ({
          id: `slot-demo-${idx + 1}`,
          slotNumber: s.slotNumber,
          tower: s.tower,
          level: s.level,
          vehicleType: s.vehicleType,
          status: s.status === 'Allocated' ? 'ALLOCATED' : 'AVAILABLE',
          allocatedFlat: s.allocatedTo ? { flatNumber: s.allocatedTo, ownerName: 'Resident' } : null
        })));
      }

      if (flatsRes.success && flatsRes.data?.flats) {
        setFlats(flatsRes.data.flats);
        if (flatsRes.data.flats.length > 0 && !targetFlatId) {
          setTargetFlatId(flatsRes.data.flats[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch parking data:', err);
      // Graceful fallback
      setSlots(INITIAL_PARKING_SLOTS.map((s, idx) => ({
        id: `slot-demo-${idx + 1}`,
        slotNumber: s.slotNumber,
        tower: s.tower,
        level: s.level,
        vehicleType: s.vehicleType,
        status: s.status === 'Allocated' ? 'ALLOCATED' : 'AVAILABLE',
        allocatedFlat: s.allocatedTo ? { flatNumber: s.allocatedTo, ownerName: 'Resident' } : null
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParkingData();
  }, [currentCommunity]);

  const handleOpenAllocateModal = (slot) => {
    setSelectedSlot(slot);
    setTargetVehicleType(slot.vehicleType || '4-Wheeler');
    if (flats.length > 0) {
      setTargetFlatId(slot.allocatedFlatId || flats[0].id);
    }
    setAllocateModalOpen(true);
  };

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      if (selectedSlot.id && !selectedSlot.id.startsWith('slot-demo')) {
        await api.allocateParkingSlot(selectedSlot.id, {
          flatId: targetFlatId,
          vehicleType: targetVehicleType
        });
      }

      // Update local state smoothly
      const matchedFlat = flats.find(f => f.id === targetFlatId);
      const flatLabel = matchedFlat ? `${matchedFlat.building?.name || 'Tower'} - ${matchedFlat.flatNumber}` : 'Flat Unit';

      setSlots(prev => prev.map(s => {
        if (s.id === selectedSlot.id || s.slotNumber === selectedSlot.slotNumber) {
          return {
            ...s,
            status: 'ALLOCATED',
            allocatedFlatId: targetFlatId,
            vehicleType: targetVehicleType,
            allocatedFlat: {
              flatNumber: flatLabel,
              ownerName: matchedFlat?.ownerName || 'Resident'
            }
          };
        }
        return s;
      }));

      setActionSuccess(`Slot ${selectedSlot.slotNumber} successfully assigned to ${flatLabel}.`);
      setAllocateModalOpen(false);
      setSelectedSlot(null);

      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update parking allocation');
    }
  };

  const handleReleaseSlot = async (slot) => {
    if (!window.confirm(`Release slot ${slot.slotNumber} and mark as Available?`)) return;

    try {
      if (slot.id && !slot.id.startsWith('slot-demo')) {
        await api.allocateParkingSlot(slot.id, { flatId: null });
      }

      setSlots(prev => prev.map(s => {
        if (s.id === slot.id || s.slotNumber === slot.slotNumber) {
          return {
            ...s,
            status: 'AVAILABLE',
            allocatedFlatId: null,
            allocatedFlat: null
          };
        }
        return s;
      }));

      setActionSuccess(`Slot ${slot.slotNumber} is now marked as Available.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to release parking slot');
    }
  };

  // Filter calculations
  const filteredSlots = slots.filter(s => {
    const matchesSearch = 
      s.slotNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.tower && s.tower.toLowerCase().includes(search.toLowerCase())) ||
      (s.allocatedFlat?.flatNumber && s.allocatedFlat.flatNumber.toLowerCase().includes(search.toLowerCase())) ||
      (s.allocatedFlat?.ownerName && s.allocatedFlat.ownerName.toLowerCase().includes(search.toLowerCase()));

    const matchesLevel = filterLevel === 'ALL' || s.level === filterLevel;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalSlots = slots.length;
  const allocatedSlots = slots.filter(s => s.status === 'ALLOCATED').length;
  const availableSlots = totalSlots - allocatedSlots;
  const evSlots = slots.filter(s => s.vehicleType?.includes('EV') || s.level === 'Basement 2').length;

  const canManage = currentRole === 'admin' || currentRole === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Parking Inventory & Vehicle Directory</h2>
          <p className="text-xs text-slate-500">
            Conflict-free slot management, tower mapping, and EV charging bays for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold">{actionSuccess}</p>
        </div>
      )}

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Parking Inventory"
          value={`${totalSlots} Slots`}
          subtitle="Tower A & Tower B"
          icon={Car}
          color="indigo"
        />
        <StatCard
          title="Allocated Slots"
          value={`${allocatedSlots} In Use`}
          subtitle={`${Math.round((allocatedSlots / (totalSlots || 1)) * 100)}% occupancy`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Available for Allocation"
          value={`${availableSlots} Open`}
          subtitle="Ready for assignment"
          icon={ShieldCheck}
          color="sky"
        />
        <StatCard
          title="EV Ready Bays"
          value={`${evSlots} Bays`}
          subtitle="Fast charger equipped"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Level & Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="px-2 text-slate-400 text-[11px] uppercase">Level:</span>
              {['ALL', 'Basement 1', 'Basement 2'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterLevel === lvl ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="px-2 text-slate-400 text-[11px] uppercase">Status:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'ALLOCATED', label: 'Allocated' },
                { id: 'AVAILABLE', label: 'Available' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterStatus === st.id ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search slot number, tower, flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSlots.map((s) => {
          const isAllocated = s.status === 'ALLOCATED';
          return (
            <div 
              key={s.id || s.slotNumber} 
              className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-3 transition-all hover:shadow-md flex flex-col justify-between ${
                isAllocated ? 'border-slate-200/80' : 'border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isAllocated ? 'bg-slate-100 text-slate-700' : 'bg-indigo-600 text-white'
                    }`}>
                      {s.slotNumber.slice(-3)}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-base text-slate-800">{s.slotNumber}</span>
                      <p className="text-[10px] text-slate-400">{s.tower || 'Tower B'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isAllocated ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isAllocated ? 'Occupied' : 'Vacant'}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Level:</span>
                    <span className="font-semibold text-slate-700">{s.level || 'Basement 1'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Vehicle Class:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      {s.vehicleType?.includes('EV') ? <Zap className="w-3 h-3 text-amber-500" /> : <Car className="w-3 h-3 text-slate-400" />}
                      {s.vehicleType || '4-Wheeler'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assigned Unit</span>
                  {isAllocated ? (
                    <div>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {s.allocatedFlat?.flatNumber || 'Flat Assigned'}
                      </p>
                      {s.allocatedFlat?.ownerName && (
                        <p className="text-[11px] text-slate-500">{s.allocatedFlat.ownerName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Assignment
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Admins */}
              {canManage && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {isAllocated ? (
                    <button
                      onClick={() => handleReleaseSlot(s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Release Slot
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenAllocateModal(s)}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Allocate Slot</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSlots.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
          <Car className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm text-slate-700">No parking slots matched your filters</p>
          <p>Try resetting the search query or status filter.</p>
        </div>
      )}

      {/* Allocate Parking Slot Modal */}
      {allocateModalOpen && selectedSlot && (
        <Modal
          isOpen={allocateModalOpen}
          onClose={() => setAllocateModalOpen(false)}
          title={`Allocate Slot ${selectedSlot.slotNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveAllocation} className="space-y-4">
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
              <Car className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Slot Location: {selectedSlot.tower} • {selectedSlot.level}</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Assign this designated bay to a registered apartment flat or tenant vehicle.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assign to Flat Unit *
              </label>
              <select
                required
                value={targetFlatId}
                onChange={(e) => setTargetFlatId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {flats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.building?.name || 'Tower'} - {f.flatNumber} ({f.ownerName || 'Resident'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle Classification
              </label>
              <select
                value={targetVehicleType}
                onChange={(e) => setTargetVehicleType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="4-Wheeler">4-Wheeler (Sedan / SUV)</option>
                <option value="2-Wheeler">2-Wheeler (Motorcycle / Scooter)</option>
                <option value="4-Wheeler (EV)">4-Wheeler Electric Vehicle (EV Charger Enabled)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAllocateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
