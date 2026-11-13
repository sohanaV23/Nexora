import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Phone, 
  Shield, 
  Search, 
  AlertCircle, 
  Building2, 
  PhoneCall, 
  CheckCircle2, 
  Wrench,
  Key,
  Home,
  MessageSquare
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';

const EMERGENCY_CONTACTS = [
  { role: 'Main Gate 1 Security Desk', contact: '+91 98765 33333', desc: '24/7 Gate Guardhouse', category: 'EMERGENCY', isHotline: true },
  { role: 'Fire Emergency Dispatch', contact: '101 / +91 40 2345 6789', desc: 'Local Fire Station Station 14', category: 'EMERGENCY', isHotline: true },
  { role: 'Apollo Emergency Ambulance', contact: '108 / 1066', desc: 'Nearest Tertiary Hospital (HITEC City)', category: 'EMERGENCY', isHotline: true },
  { role: 'Otis Elevator 24/7 Helpline', contact: '1800 120 120', desc: 'Emergency Lift Passenger Rescue', category: 'STAFF', isHotline: true },
  { role: 'Senior Society Electrician (Suresh)', contact: '+91 98765 22222', desc: 'HT/LT Power & Substation Support', category: 'STAFF', isHotline: false },
  { role: 'Emergency Plumbing Response', contact: '+91 98765 22223', desc: 'Hydro-pneumatic & Main Valve Leaks', category: 'STAFF', isHotline: false },
  { role: 'RWA President Desk (Ananya Rao)', contact: '+91 98765 11111', desc: 'Association Executive Inquiries', category: 'MANAGEMENT', isHotline: false },
  { role: 'Society Management Office', contact: '+91 40 4000 8899', desc: 'Maintenance Billing & Invoicing Desk', category: 'MANAGEMENT', isHotline: false }
];

const RESIDENTS_SAMPLE = [
  { name: 'Rohit Sharma', flat: 'Tower B - Flat 402', ownership: 'Owner', intercom: '2402', phone: '+91 98765 43210', email: 'rohit.resident@nexora.local' },
  { name: 'Priya Sundaram', flat: 'Tower A - Flat 204', ownership: 'Tenant', intercom: '1204', phone: '+91 98765 55555', email: 'priya.tenant@nexora.local' },
  { name: 'Dr. Anand Kumar', flat: 'Tower B - Flat 301', ownership: 'Owner / Landlord', intercom: '2301', phone: '+91 98765 44444', email: 'anand.landlord@nexora.local' },
  { name: 'Kavita Reddy', flat: 'Tower A - Flat 501', ownership: 'Owner', intercom: '1501', phone: '+91 98765 67890', email: 'kavita.reddy@nexora.local' },
  { name: 'Venkatesh Iyer', flat: 'Tower A - Flat 704', ownership: 'Tenant', intercom: '1704', phone: '+91 98765 78901', email: 'venkatesh.iyer@nexora.local' },
  { name: 'Sunita Sen', flat: 'Tower B - Flat 104', ownership: 'Owner', intercom: '2104', phone: '+91 98765 89012', email: 'sunita.sen@nexora.local' },
  { name: 'Vikram Joshi', flat: 'Tower A - Flat 602', ownership: 'Owner', intercom: '1602', phone: '+91 98765 11112', email: 'vikram.admin@nexora.local' }
];

export const DirectoryPage = () => {
  const { t } = useTranslation();
  const { currentCommunity } = useDemoAuth();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'RESIDENTS' | 'EMERGENCY' | 'STAFF'
  const [search, setSearch] = useState('');
  const [callAlert, setCallAlert] = useState(null);

  const filteredResidents = RESIDENTS_SAMPLE.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.flat.toLowerCase().includes(search.toLowerCase()) ||
    r.intercom.includes(search)
  );

  const filteredEmergency = EMERGENCY_CONTACTS.filter(c =>
    (activeTab === 'ALL' || (activeTab === 'EMERGENCY' && c.category === 'EMERGENCY') || (activeTab === 'STAFF' && (c.category === 'STAFF' || c.category === 'MANAGEMENT'))) &&
    (c.role.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase()) || c.contact.includes(search))
  );

  const triggerCallSimulation = (name, number, type = 'phone') => {
    setCallAlert({ name, number, type });
    setTimeout(() => {
      setCallAlert(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Resident & Community Contacts Directory</h2>
          <p className="text-xs text-slate-500">
            Privacy-conscious community directory, intercom extensions, and 24/7 emergency hotlines for {currentCommunity?.name || 'Greenwood Heights'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Intercom System Online
          </span>
        </div>
      </div>

      {/* Simulated Call Notification Toast */}
      {callAlert && (
        <div className="p-4 rounded-2xl bg-indigo-900 text-white shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center animate-bounce">
              <PhoneCall className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-medium">
                {callAlert.type === 'intercom' ? 'Simulating Intercom Ringing' : 'Connecting External Telephony Call'}
              </p>
              <h4 className="text-sm font-bold text-white">
                {callAlert.name} ({callAlert.number})
              </h4>
            </div>
          </div>
          <button 
            onClick={() => setCallAlert(null)}
            className="px-3 py-1.5 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-xs font-semibold text-indigo-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Registered Units</p>
            <h4 className="text-lg font-bold text-slate-800">{RESIDENTS_SAMPLE.length} Flats Connected</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Emergency Hotlines</p>
            <h4 className="text-lg font-bold text-slate-800">{EMERGENCY_CONTACTS.filter(c => c.isHotline).length} Ready 24/7</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Support & AMC Staff</p>
            <h4 className="text-lg font-bold text-slate-800">{EMERGENCY_CONTACTS.filter(c => !c.isHotline).length} Dispatched Leads</h4>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Box */}
      <div className="bg-gradient-to-r from-rose-50 via-rose-50/60 to-white border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800">
            <Shield className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Priority Emergency Help Numbers</h3>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-full">
            Zero Delay Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMERGENCY_CONTACTS.filter(c => c.isHotline).map((c, i) => (
            <div key={i} className="bg-white p-3.5 rounded-xl border border-rose-100 hover:border-rose-300 transition-all flex flex-col justify-between space-y-2">
              <div>
                <p className="text-xs font-bold text-slate-800">{c.role}</p>
                <p className="text-[11px] text-slate-500">{c.desc}</p>
              </div>
              <button
                onClick={() => triggerCallSimulation(c.role, c.contact, 'phone')}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 py-1.5 rounded-lg transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {c.contact.split('/')[0].trim()}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Directory Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {[
              { id: 'ALL', label: 'All Contacts' },
              { id: 'RESIDENTS', label: 'Residents & Units' },
              { id: 'EMERGENCY', label: 'Emergency Hotlines' },
              { id: 'STAFF', label: 'Facility Staff & AMC' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resident, flat, phone, or extension..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content Table / Grid */}
        {(activeTab === 'ALL' || activeTab === 'RESIDENTS') && (
          <div className="overflow-x-auto">
            <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Resident Directory ({filteredResidents.length} Records)</span>
              <span>Direct Intercom dialing enabled</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Flat Unit</th>
                  <th className="py-3 px-4">Tenancy Type</th>
                  <th className="py-3 px-4">Intercom Ext</th>
                  <th className="py-3 px-4 text-right">Instant Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResidents.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{r.flat}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.ownership.includes('Owner') 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {r.ownership}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      Ext: {r.intercom}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => triggerCallSimulation(r.name, `Ext ${r.intercom}`, 'intercom')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        title="Ring flat intercom"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Dial Ext</span>
                      </button>
                      <button
                        onClick={() => triggerCallSimulation(r.name, r.phone, 'phone')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        title="Call registered mobile"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Staff & Emergency Table */}
        {(activeTab === 'ALL' || activeTab === 'EMERGENCY' || activeTab === 'STAFF') && filteredEmergency.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Support Staff & Helplines ({filteredEmergency.length} Contacts)</span>
              <span>Direct lines</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEmergency.map((c, i) => (
                <div key={i} className="bg-slate-50/60 p-3 rounded-xl border border-slate-200 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {c.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">{c.role}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                    <p className="text-xs font-mono font-semibold text-indigo-600 mt-1">{c.contact}</p>
                  </div>
                  <button
                    onClick={() => triggerCallSimulation(c.role, c.contact, 'phone')}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shrink-0 shadow-2xs"
                    title={`Call ${c.role}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
