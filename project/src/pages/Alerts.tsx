import { useState } from 'react';
import { Bell, Clock, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge';
import { useApp } from '../context/AppContext';
import type { Alert } from '../types';

const STATUS_LABELS = {
  open: { label: 'Open', style: 'bg-red-500/15 text-red-300 border-red-500/30' },
  investigating: { label: 'Investigating', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  resolved: { label: 'Resolved', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  false_positive: { label: 'False Positive', style: 'bg-slate-600/40 text-slate-400 border-slate-600/30' },
};

export default function Alerts() {
  const { alerts } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | Alert['status']>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | Alert['severity']>('all');

  const filtered = alerts.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSev = filterSeverity === 'all' || a.severity === filterSeverity;
    return matchStatus && matchSev;
  });

  const openCount = alerts.filter(a => a.status === 'open').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: openCount, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Investigating', count: alerts.filter(a => a.status === 'investigating').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Critical', count: criticalCount, color: 'text-red-300', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`bg-slate-800/60 border ${bg} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-slate-400 text-sm mt-0.5">{label} Alerts</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="false_positive">False Positive</option>
        </select>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value as typeof filterSeverity)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <div className="flex-1" />
        <p className="text-slate-400 text-sm self-center">{filtered.length} alerts</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700/30">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
              <Bell size={32} className="opacity-30" />
              <p className="text-sm">No alerts match the current filters</p>
            </div>
          ) : filtered.map(alert => {
            const statusInfo = STATUS_LABELS[alert.status];
            return (
              <div key={alert.id} className="px-5 py-4 hover:bg-slate-700/20 transition-colors">
                <div className="flex flex-wrap items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-500/20' :
                    alert.severity === 'high' ? 'bg-orange-500/20' :
                    'bg-amber-500/20'
                  }`}>
                    <AlertTriangle size={18} className={
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      'text-amber-400'
                    } />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{alert.alertType}</p>
                      <RiskBadge level={alert.severity} />
                      <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold uppercase tracking-wide ${statusInfo.style}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mb-2">{alert.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="font-mono">{alert.id}</span>
                      <span>·</span>
                      <span>{alert.maskedAccount}</span>
                      <span>·</span>
                      <span>{alert.customerId}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">{alert.riskScore}/100</p>
                    <p className="text-slate-500 text-xs">Risk Score</p>
                    <p className="text-slate-400 text-xs mt-1 capitalize">Assigned: {alert.assignedTo}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-xs transition-colors">
                    <Eye size={11} /> Investigate
                  </button>
                  {alert.status !== 'resolved' && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-md text-xs transition-colors border border-emerald-500/20">
                      <CheckCircle size={11} /> Mark Resolved
                    </button>
                  )}
                  {alert.status === 'open' && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-md text-xs transition-colors">
                      <XCircle size={11} /> False Positive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
