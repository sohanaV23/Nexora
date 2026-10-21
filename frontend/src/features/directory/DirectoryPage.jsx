import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Phone, Shield, Search, AlertCircle } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { role: 'Main Gate 1 Security Desk', contact: '+91 98765 33333', desc: '24/7 Gate Guardhouse' },
  { role: 'Fire Emergency Dispatch', contact: '101 / +91 40 2345 6789', desc: 'Local Fire Station' },
  { role: 'Apollo Emergency Ambulance', contact: '108 / 1066', desc: 'Nearest Tertiary Hospital' },
  { role: 'Otis Elevator 24/7 Helpline', contact: '1800 120 120', desc: 'Emergency Lift Rescue' },
  { role: 'Senior Society Electrician (Suresh)', contact: '+91 98765 22222', desc: 'HT/LT Power Failures' }
];

const RESIDENTS_SAMPLE = [
  { name: 'Rohit Sharma', flat: 'Tower B - Flat 402', ownership: 'Owner', intercom: '2402' },
  { name: 'Kavita Reddy', flat: 'Tower A - Flat 501', ownership: 'Owner', intercom: '1501' },
  { name: 'Venkatesh Iyer', flat: 'Tower A - Flat 704', ownership: 'Tenant', intercom: '1704' },
  { name: 'Sunita Sen', flat: 'Tower A - Flat 204', ownership: 'Owner', intercom: '1204' },
  { name: 'Dr. Anand Kumar', flat: 'Tower B - Flat 301', ownership: 'Owner', intercom: '2301' }
];

export const DirectoryPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredResidents = RESIDENTS_SAMPLE.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.flat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Resident & Emergency Contacts Directory</h2>
        <p className="text-xs text-slate-500">Privacy-conscious community directory and 24/7 emergency hotlines</p>
      </div>

      {/* Emergency Hotlines Box */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <Shield className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Emergency Help Numbers</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EMERGENCY_CONTACTS.map((c, i) => (
            <div key={i} className="bg-white p-3.5 rounded-xl border border-rose-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{c.role}</p>
                <p className="text-[11px] text-slate-500">{c.desc}</p>
              </div>
              <a 
                href={`tel:${c.contact.replace(/\s+/g, '')}`} 
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Resident Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resident or flat..."
              value={search}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">Intercom extensions enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Flat Unit</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4 text-right">Intercom Extension</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredResidents.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{r.name}</td>
                  <td className="py-3 px-4">{r.flat}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {r.ownership}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                    Ext: {r.intercom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
