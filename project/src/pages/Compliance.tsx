import { ShieldCheck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ComplianceItem } from '../types';

const FRAMEWORK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'PCI-DSS': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  'GDPR': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'SOX': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'ISO 27001': { bg: 'bg-slate-600/40', text: 'text-slate-300', border: 'border-slate-600/40' },
};

const STATUS_INFO = {
  compliant: { label: 'Compliant', icon: CheckCircle, style: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  partial: { label: 'Partial', icon: Clock, style: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  non_compliant: { label: 'Non-Compliant', icon: AlertCircle, style: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function Compliance() {
  const { complianceData } = useApp();

  const frameworks = ['PCI-DSS', 'GDPR', 'SOX', 'ISO 27001'];
  const byFramework = (fw: string) => complianceData.filter(c => c.framework === fw);
  const compliantCount = (fw: string) => byFramework(fw).filter(c => c.status === 'compliant').length;
  const total = (fw: string) => byFramework(fw).length;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {frameworks.map(fw => {
          const c = compliantCount(fw);
          const t = total(fw);
          const pct = Math.round((c / t) * 100);
          const colors = FRAMEWORK_COLORS[fw];
          return (
            <div key={fw} className={`bg-slate-800/60 border ${colors.border} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>{fw}</span>
                <span className={`text-lg font-bold ${pct === 100 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full ${pct === 100 ? 'bg-emerald-400' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs">{c}/{t} controls compliant</p>
            </div>
          );
        })}
      </div>

      {frameworks.map(fw => {
        const items = byFramework(fw);
        const colors = FRAMEWORK_COLORS[fw];
        return (
          <div key={fw} className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-3">
              <ShieldCheck size={16} className={colors.text} />
              <h3 className="text-white font-semibold">{fw}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                {items.length} controls
              </span>
            </div>
            <div className="divide-y divide-slate-700/30">
              {items.map((item: ComplianceItem) => {
                const statusInfo = STATUS_INFO[item.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={item.id} className="px-5 py-4 hover:bg-slate-700/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <StatusIcon size={18} className={`${statusInfo.style} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-white font-medium text-sm">{item.control}</p>
                          <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wide ${statusInfo.bg} ${statusInfo.style}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs mb-2">{item.description}</p>
                        <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-700/40">
                          <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">Evidence</p>
                          <p className="text-slate-300 text-xs">{item.evidence}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400 text-xs">Last Audit</p>
                        <p className="text-slate-300 text-xs font-medium">{item.lastAudit}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
