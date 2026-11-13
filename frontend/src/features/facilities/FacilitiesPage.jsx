import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { INITIAL_FACILITIES } from '../../services/mockData';

export const FacilitiesPage = () => {
  const { t } = useTranslation();
  const { currentUser, currentCommunity } = useDemoAuth();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Form State
  const [bookingDate, setBookingDate] = useState('2026-10-31');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [purpose, setPurpose] = useState('Family Celebration');

  const loadFacilities = async () => {
    try {
      const res = await api.getFacilities();
      if (res.success && res.data?.facilities?.length > 0) {
        setFacilities(res.data.facilities);
      } else {
        setFacilities(INITIAL_FACILITIES.map(f => ({
          ...f,
          ratePerHourPaise: f.ratePerHour * 100,
          status: f.status.toUpperCase().replace(' ', '_'),
          bookings: []
        })));
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
      setFacilities(INITIAL_FACILITIES.map(f => ({
        ...f,
        ratePerHourPaise: f.ratePerHour * 100,
        status: f.status.toUpperCase().replace(' ', '_'),
        bookings: []
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, [currentCommunity]);

  const handleOpenBookModal = (fac) => {
    setSelectedFacility(fac);
    setBookingError(null);
    setBookModalOpen(true);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setBookingError(null);
    try {
      if (selectedFacility.id && !selectedFacility.id.startsWith('fac-')) {
        await api.bookFacility(selectedFacility.id, {
          bookingDate,
          startTime,
          endTime,
          purpose
        });
      }

      const confirmedSlot = {
        facilityName: selectedFacility.name,
        date: bookingDate,
        time: `${startTime} – ${endTime}`,
        purpose: purpose || 'Community Gathering'
      };

      setBookingSuccess(confirmedSlot);
      setBookModalOpen(false);

      // Refresh facilities with new booking
      await loadFacilities();

      setTimeout(() => setBookingSuccess(null), 6000);
    } catch (err) {
      setBookingError(err.message || 'Conflict detected: this time slot is already booked.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Facilities & Amenity Booking</h2>
          <p className="text-xs text-slate-500">
            Reserve shared society amenities with automated zero-overlap conflict detection for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {bookingSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-emerald-900">Amenity Reservation Confirmed!</h4>
            <p className="mt-0.5 text-emerald-700">
              Successfully booked <strong>{bookingSuccess.facilityName}</strong> on {bookingSuccess.date} ({bookingSuccess.time}) for <em>"{bookingSuccess.purpose}"</em>.
            </p>
          </div>
        </div>
      )}

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {facilities.map((fac) => {
          const isAvailable = fac.status === 'AVAILABLE' || fac.status === 'Available';
          const rateRupees = fac.ratePerHourPaise ? fac.ratePerHourPaise / 100 : (fac.ratePerHour || 0);
          const recentBookings = fac.bookings || [];

          return (
            <div 
              key={fac.id} 
              className={`bg-white rounded-2xl border p-6 shadow-2xs space-y-4 flex flex-col justify-between transition-all hover:shadow-sm ${
                isAvailable ? 'border-slate-200/80' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                      Amenity #{fac.id.slice(0, 8)}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 mt-1">{fac.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Users className="w-3.5 h-3.5 text-indigo-500" /> Max Capacity: {fac.capacity}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">
                        {rateRupees > 0 ? `₹${rateRupees.toLocaleString('en-IN')}/hour` : 'Complimentary Resident Amenity'}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isAvailable ? 'Available' : 'Under Maintenance'}
                  </span>
                </div>

                {/* Existing Bookings preview */}
                {recentBookings.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                      Confirmed Reservations:
                    </span>
                    {recentBookings.slice(0, 2).map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600">
                        <span>📅 {b.bookingDate} ({b.startTime} - {b.endTime})</span>
                        <span className="text-slate-400 italic truncate max-w-[140px]">{b.purpose}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAvailable ? 'Instant booking confirmation' : 'Temporarily suspended for repair'}
                </span>
                <button
                  disabled={!isAvailable}
                  onClick={() => handleOpenBookModal(fac)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors shadow-2xs"
                >
                  Book Amenity
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {bookModalOpen && selectedFacility && (
        <Modal
          isOpen={bookModalOpen}
          onClose={() => setBookModalOpen(false)}
          title={`Reserve ${selectedFacility.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleBook} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-semibold">{bookingError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Booking Date *
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time *
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>08:00 AM</option>
                  <option>10:00 AM</option>
                  <option>01:00 PM</option>
                  <option>03:00 PM</option>
                  <option>06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  End Time *
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>10:00 AM</option>
                  <option>01:00 PM</option>
                  <option>04:00 PM</option>
                  <option>06:00 PM</option>
                  <option>09:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Occasion / Gathering Purpose *
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Birthday Celebration / Board Meeting"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Facility Rate:</span>
                <span className="font-semibold text-slate-800">
                  {selectedFacility.ratePerHourPaise ? `₹${selectedFacility.ratePerHourPaise / 100}/hr` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Conflict Engine:</span>
                <span className="text-emerald-700 font-medium">Automatic Lock Active</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Confirm Reservation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
