import { useEffect } from 'react';
import { ClipboardList, RefreshCw, User, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ROLE_COLORS = {
  analyst: 'bg-blue-500/15 text-blue-300',
  manager: 'bg-amber-500/15 text-amber-300',
  admin: 'bg-red-500/15 text-red-300',
};

export default function AuditLogs() {
  const { auditLogs, refreshAuditLogs } = useApp();

  useEffect(() => {
    refreshAuditLogs();
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Immutable Audit Trail</h2>
          <p className="text-slate-400 text-xs mt-0.5">SOX-compliant change tracking — all actions are permanently logged</p>
        </div>
        <button
          onClick={refreshAuditLogs}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
            <ClipboardList size={32} className="opacity-30" />
            <p className="text-sm">No audit logs yet. Actions performed in the Security Controls page will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Performed By', 'IP Address', 'Details'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={11} />
                        {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white max-w-[240px]">
                      <p className="truncate">{log.action}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap capitalize">{log.entityType}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">{log.entityId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[log.performedBy as keyof typeof ROLE_COLORS] || 'bg-slate-700 text-slate-300'}`}>
                        {log.performedBy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px]">
                      <pre className="text-[10px] bg-slate-900/50 rounded px-2 py-1 overflow-x-auto max-w-[180px]">
                        {JSON.stringify(log.details, null, 1).slice(0, 80)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <User size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-slate-300 text-xs leading-relaxed">
          <span className="text-blue-300 font-semibold">SOX Compliance Note:</span>{' '}
          All entries in this audit trail are immutable and tamper-evident. Records are retained for a minimum of 7 years per
          SOX Section 802 requirements. Each entry captures: action, actor role, entity, timestamp, and source IP (masked for privacy).
        </p>
      </div>
    </div>
  );
}
