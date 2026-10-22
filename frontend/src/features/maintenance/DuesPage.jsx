import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  Receipt, 
  AlertCircle, 
  Check, 
  X, 
  Key, 
  Building2,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useDemoAuth } from '../../context/DemoAuthContext';

export const DuesPage = () => {
  const { t } = useTranslation();
  const { currentRole, currentCommunity } = useDemoAuth();

  const [activeTab, setActiveTab] = useState('MAINTENANCE'); // 'MAINTENANCE' | 'RENT' | 'VERIFICATION_QUEUE'
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report Payment Modal
  const [reportModal, setReportModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'OUTSIDE_UPI',
    transactionReference: '',
    isSimulated: false,
    proofNotes: ''
  });

  // Receipt Modal
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Reject Modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Transaction reference not matched in bank statement');

  const loadInvoices = async () => {
    try {
      const res = await api.getInvoices();
      if (res.success) {
        setInvoices(res.data.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [currentCommunity]);

  const handleReportPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.reportPayment(selectedInvoice.id, {
        amountPaise: Math.round(parseFloat(paymentForm.amount) * 100),
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: paymentForm.transactionReference,
        isSimulated: paymentForm.isSimulated,
        proofNotes: paymentForm.proofNotes
      });
      setReportModal(false);
      await loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to report payment');
    }
  };

  const handleVerify = async (paymentId) => {
    try {
      await api.verifyPayment(paymentId, { action: 'VERIFY' });
      await loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to verify payment');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.verifyPayment(rejectPaymentId, { action: 'REJECT', rejectionReason });
      setRejectModal(false);
      setRejectPaymentId(null);
      await loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to reject payment');
    }
  };

  // Filter invoices by active tab
  const maintenanceInvoices = invoices.filter(inv => inv.invoiceType === 'ASSOCIATION_MAINTENANCE');
  const rentInvoices = invoices.filter(inv => inv.invoiceType === 'CONTRACTUAL_RENT');

  // Extract all pending verification payments across loaded invoices
  const pendingPayments = invoices.flatMap(inv => 
    (inv.payments || [])
      .filter(p => p.status === 'PENDING_VERIFICATION')
      .map(p => ({ ...p, invoice: inv }))
  );

  const displayedInvoices = activeTab === 'MAINTENANCE' ? maintenanceInvoices : rentInvoices;

  const totalOutstandingMaintenance = maintenanceInvoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.balancePaise, 0);

  const totalOutstandingRent = rentInvoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.balancePaise, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-indigo-500/30 text-indigo-200 font-bold px-2.5 py-0.5 rounded border border-indigo-400/20 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Dual-Ledger Financial Engine
            </span>
            <span className="text-xs text-indigo-200">Strict Separation: Society Dues vs Contractual Rent</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Financial Billing, Ledger & Payment Verification</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Invoices are verified authoritatively before receipts are issued. Pending verification does not prematurely reduce balance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-right">
            <p className="text-[10px] text-slate-300 uppercase font-semibold">Outstanding Dues</p>
            <p className="text-lg font-bold text-amber-300">₹ {(totalOutstandingMaintenance / 100).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-right">
            <p className="text-[10px] text-slate-300 uppercase font-semibold">Outstanding Rent</p>
            <p className="text-lg font-bold text-sky-300">₹ {(totalOutstandingRent / 100).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MAINTENANCE' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Association Maintenance Dues ({maintenanceInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RENT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RENT' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Contractual Rent Invoices ({rentInvoices.length})</span>
        </button>

        {['admin', 'landlord', 'super_admin'].includes(currentRole) && (
          <button
            onClick={() => setActiveTab('VERIFICATION_QUEUE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'VERIFICATION_QUEUE' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Payment Verification Queue ({pendingPayments.length})</span>
          </button>
        )}
      </div>

      {/* Verification Queue View */}
      {activeTab === 'VERIFICATION_QUEUE' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Pending Payment Verification Queue
            </h3>
            <p className="text-xs text-slate-500">
              Payments reported by residents/tenants awaiting administrator match against society bank statements
            </p>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Zero pending payments. All reported transactions are verified.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPayments.map((p) => (
                <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {p.invoice?.invoiceNumber}
                      </span>
                      <span className="text-xs text-slate-400">• {p.invoice?.invoiceType.replace('_', ' ')}</span>
                      {p.isSimulated && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                          SIMULATED DEMO
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      ₹ {(p.amountPaise / 100).toLocaleString('en-IN')} via {p.paymentMethod}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Reported by {p.reportedBy?.name} on {new Date(p.reportedAt).toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-slate-600">
                      Ref: <strong>{p.transactionReference}</strong> {p.proofNotes && `• Notes: "${p.proofNotes}"`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setRejectPaymentId(p.id);
                        setRejectModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleVerify(p.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify & Issue Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoices Grid */}
      {activeTab !== 'VERIFICATION_QUEUE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">{inv.invoiceNumber}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">• {inv.billingPeriod}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mt-1">
                    {inv.flat?.flatNumber} ({inv.flat?.building?.name})
                  </h4>
                  <p className="text-xs text-slate-500">Billed to: {inv.payer?.name}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Due</span>
                  <p className="font-bold text-slate-800 text-sm">₹ {(inv.amountPaise / 100).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Paid (Verified)</span>
                  <p className="font-bold text-emerald-600 text-sm">₹ {(inv.paidPaise / 100).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</span>
                  <p className={`font-bold text-sm ${inv.balancePaise > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    ₹ {(inv.balancePaise / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Verified Payments & Receipts list */}
              {inv.payments && inv.payments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment History</span>
                  {inv.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">₹ {(p.amountPaise / 100).toLocaleString('en-IN')}</span>
                        <span className="text-slate-400"> via {p.paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          p.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'PENDING_VERIFICATION' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                        {p.receiptNumber && (
                          <button
                            onClick={() => {
                              setSelectedPayment({ ...p, invoice: inv });
                              setReceiptModal(true);
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>{p.receiptNumber}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Due Date: {new Date(inv.dueDate).toLocaleDateString()}</span>
                {inv.status !== 'PAID' && (
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setPaymentForm({
                        amount: (inv.balancePaise / 100).toString(),
                        paymentMethod: 'OUTSIDE_UPI',
                        transactionReference: '',
                        isSimulated: false,
                        proofNotes: ''
                      });
                      setReportModal(true);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Report / Record Payment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Payment Modal */}
      {reportModal && selectedInvoice && (
        <Modal
          isOpen={reportModal}
          onClose={() => setReportModal(false)}
          title={`Report Payment — ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReportPayment} className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Outstanding Balance</span>
                <span className="font-bold text-base text-slate-800">
                  ₹ {(selectedInvoice.balancePaise / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {selectedInvoice.flat?.flatNumber}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Channel
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="OUTSIDE_UPI">UPI (Google Pay / PhonePe / Paytm outside app)</option>
                <option value="BANK_TRANSFER">Bank NEFT / IMPS / RTGS</option>
                <option value="CHEQUE">Society Office Cheque</option>
                <option value="CASH">Cash Paid at Counter</option>
                <option value="SIMULATED_DEMO">Simulated Demo Transaction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Bank UTR / Transaction Reference
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-2026-992381 or Cheque #49281"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="simCheck"
                checked={paymentForm.isSimulated}
                onChange={(e) => setPaymentForm({ ...paymentForm, isSimulated: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="simCheck" className="text-xs text-slate-600 select-none">
                Mark as Simulated Demo Transaction (Faculty / Interview test)
              </label>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
              >
                Submit Payment for Verification
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Payment Modal */}
      {rejectModal && (
        <Modal
          isOpen={rejectModal}
          onClose={() => setRejectModal(false)}
          title="Reject Reported Transaction"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReject} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Verifiable Receipt Modal */}
      {receiptModal && selectedPayment && (
        <Modal
          isOpen={receiptModal}
          onClose={() => setReceiptModal(false)}
          title="Official Verifiable Receipt"
          maxWidth="max-w-md"
        >
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="text-center pb-3 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">
                {selectedPayment.invoice?.community?.name || currentCommunity?.name}
              </h4>
              <p className="text-[11px] text-slate-500">Official Electronic Payment Receipt</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold font-mono">
                {selectedPayment.receiptNumber}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.invoice?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Invoice Category:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.invoice?.invoiceType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Flat Unit:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.invoice?.flat?.flatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-semibold text-slate-800">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Verification Date:</span>
                <span className="font-semibold text-slate-800">{new Date(selectedPayment.verifiedAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900 border-t-2 border-slate-200">
                <span>Verified Amount Received:</span>
                <span className="text-emerald-700">₹ {(selectedPayment.amountPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-400">
              Verified by Nexora Platform Authority • Safe Integer Audit
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
