import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Calendar,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_DUES } from '../../services/mockData';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const DuesPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useDemoAuth();

  const [dues, setDues] = useState(INITIAL_DUES);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Simulated UPI / QR');

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    if (!selectedDue) return;

    const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    setDues(prev => prev.map(d => {
      if (d.id === selectedDue.id) {
        return {
          ...d,
          status: 'Paid',
          paidOn: today,
          receiptNumber: receiptNo
        };
      }
      return d;
    }));

    setSelectedDue({
      ...selectedDue,
      status: 'Paid',
      paidOn: today,
      receiptNumber: receiptNo
    });

    setPayModalOpen(false);
    setReceiptModalOpen(true);
  };

  const totalOutstanding = dues
    .filter(d => d.status === 'Pending')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-indigo-500/30 text-indigo-200 font-semibold px-2.5 py-0.5 rounded border border-indigo-400/20">
              Account Ledger: {currentUser.flat || 'Society General'}
            </span>
            <span className="text-xs text-indigo-200">Zero Gateway Fees (Simulated Mode)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Maintenance Charges & Financial Records</h2>
          <p className="text-xs text-slate-300 mt-1">Review monthly charges, record mock payments, and download official receipts.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-right">
          <p className="text-[11px] text-slate-300 uppercase font-semibold">Total Outstanding Balance</p>
          <p className="text-2xl font-bold text-amber-300">₹ {totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Dues List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Monthly Maintenance Invoices</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dues.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600">{item.id}</span>
                  <h4 className="text-base font-bold text-slate-800 mt-0.5">{item.month}</h4>
                  <p className="text-xs text-slate-500">Flat: {item.flat} • {item.resident}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Charge</span>
                  <p className="text-xl font-bold text-slate-800">₹ {item.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Due Date</span>
                  <p className="text-xs font-semibold text-slate-700">{item.dueDate}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                {item.status === 'Paid' ? (
                  <>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Paid on {item.paidOn}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDue(item);
                        setReceiptModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Payment Due
                    </span>
                    <button
                      onClick={() => {
                        setSelectedDue(item);
                        setPayModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Modal (Simulated / Manual) */}
      {payModalOpen && selectedDue && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Record Maintenance Payment — ${selectedDue.month}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSimulatePayment} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Invoice Amount</p>
                <p className="text-xl font-bold text-slate-800">₹ {selectedDue.amount.toLocaleString('en-IN')}</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {selectedDue.flat}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method / Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Simulated UPI / QR (Instant Demo)</option>
                <option>Bank NEFT / IMPS Reference</option>
                <option>Society Office Cheque</option>
                <option>Cash Collected at Desk</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <p className="font-semibold">Local Simulation Note:</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                No actual bank charges or credit cards are involved. This action simulates the ledger entry and generates a verifiable receipt.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Confirm & Issue Receipt
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Receipt Modal */}
      {receiptModalOpen && selectedDue && (
        <Modal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          title="Maintenance Payment Receipt"
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="text-center pb-3 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">Greenwood Heights Association</h4>
              <p className="text-[11px] text-slate-500">Official Residential Maintenance Receipt</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                {selectedDue.receiptNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Resident Name</span>
                <span className="font-semibold text-slate-800">{selectedDue.resident}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Flat & Unit</span>
                <span className="font-semibold text-slate-800">{selectedDue.flat}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Billing Month</span>
                <span className="font-semibold text-slate-800">{selectedDue.month}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date</span>
                <span className="font-semibold text-slate-800">{selectedDue.paidOn}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900 border-t-2 border-slate-200">
                <span>Amount Paid</span>
                <span className="text-emerald-700">₹ {selectedDue.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-400">
              System generated by Nexora Platform • No signature required
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
