import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_FACILITIES } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const FacilitiesPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Form State
  const [bookingDate, setBookingDate] = useState('2026-10-25');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [purpose, setPurpose] = useState('Birthday Celebration');

  const handleBook = (e) => {
    e.preventDefault();
    if (!selectedFacility) return;

    setBookingSuccess({
      facility: selectedFacility.name,
      date: bookingDate,
      time: `${startTime} – ${endTime}`,
      flat: currentUser.flat || 'B-402'
    });

    setBookModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Community Facilities & Booking</h2>
          <p className="text-xs text-slate-500">Reserve shared amenities with conflict-free scheduling</p>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-emerald-900">Reservation Confirmed!</h4>
            <p className="mt-0.5">
              Successfully reserved <strong>{bookingSuccess.facility}</strong> on {bookingSuccess.date} ({bookingSuccess.time}) for {bookingSuccess.flat}.
            </p>
          </div>
        </div>
      )}

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((fac) => (
          <div key={fac.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600">{fac.id.toUpperCase()}</span>
                <h4 className="text-base font-bold text-slate-800 mt-0.5">{fac.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Capacity: {fac.capacity} Persons
                  </span>
                  <span>•</span>
                  <span>{fac.ratePerHour > 0 ? `₹ ${fac.ratePerHour}/hr` : 'Free Amenity'}</span>
                </div>
              </div>
              <StatusBadge status={fac.status === 'Available' ? 'Approved' : 'Pending'} />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                disabled={fac.status !== 'Available'}
                onClick={() => {
                  setSelectedFacility(fac);
                  setBookModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                Book Facility
              </button>
            </div>
          </div>
        ))}
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
                  Start Time
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Occasion / Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
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
