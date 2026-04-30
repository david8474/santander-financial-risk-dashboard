import { useState } from 'react';
import { Search, Filter, MapPin, Monitor, AlertCircle } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge';
import { useApp } from '../context/AppContext';
import type { RiskLevel, TransactionStatus } from '../types';

type FilterLevel = 'all' | RiskLevel;
type FilterStatus = 'all' | TransactionStatus;

export default function Transactions() {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = transactions.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q || tx.merchant.toLowerCase().includes(q)
      || tx.maskedAccount.includes(q)
      || tx.customerId.toLowerCase().includes(q)
      || tx.country.toLowerCase().includes(q);
    const matchLevel = filterLevel === 'all' || tx.riskLevel === filterLevel;
    const matchStatus = filterStatus === 'all' || tx.status === filterStatus;
    return matchSearch && matchLevel && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange() {
    setPage(1);
  }

  const RISK_LEVELS: FilterLevel[] = ['all', 'low', 'medium', 'high', 'critical'];
  const STATUSES: FilterStatus[] = ['all', 'normal', 'suspicious', 'review', 'blocked'];

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by merchant, account, customer ID, or country..."
            value={search}
            onChange={e => { setSearch(e.target.value); handleFilterChange(); }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <select
              value={filterLevel}
              onChange={e => { setFilterLevel(e.target.value as FilterLevel); handleFilterChange(); }}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
            >
              {RISK_LEVELS.map(l => (
                <option key={l} value={l}>{l === 'all' ? 'All Risk Levels' : l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as FilterStatus); handleFilterChange(); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center justify-between">
          <p className="text-white font-medium text-sm">{filtered.length} transactions</p>
          <p className="text-slate-400 text-xs">Page {page} of {totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Transaction ID', 'Account', 'Merchant', 'Amount', 'Country', 'Device', 'Risk Score', 'Status', 'Risk Level', 'Time'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {paginated.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">{tx.id}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">{tx.maskedAccount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-white font-medium">{tx.merchant}</p>
                      <p className="text-[11px] text-slate-500">{tx.merchantCategory}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-slate-500" />
                      <span className="text-xs text-slate-300">{tx.country} · {tx.city}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Monitor size={11} className="text-slate-500" />
                      <span className="text-xs text-slate-300 truncate max-w-[120px]">{tx.device}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tx.riskScore >= 80 ? 'bg-red-500' : tx.riskScore >= 60 ? 'bg-orange-400' : tx.riskScore >= 40 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${tx.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white">{tx.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge level={tx.riskLevel} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-700/50 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-600 transition-colors"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-slate-300 text-xs leading-relaxed">
          <span className="text-amber-300 font-semibold">Data Privacy Notice:</span>{' '}
          All account numbers are masked per PCI-DSS Requirement 3.4. Only the last 4 digits are displayed.
          Full account data is encrypted at rest using AES-256 and accessible only to authorized systems.
        </p>
      </div>
    </div>
  );
}
