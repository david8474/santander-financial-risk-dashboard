import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent: 'red' | 'amber' | 'emerald' | 'blue' | 'slate';
}

const ACCENT_STYLES = {
  red: { bg: 'bg-red-500/15', text: 'text-red-300', icon: 'bg-red-500/20 text-red-400', border: 'border-red-500/20' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-300', icon: 'bg-amber-500/20 text-amber-400', border: 'border-amber-500/20' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', icon: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/20' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-300', icon: 'bg-blue-500/20 text-blue-400', border: 'border-blue-500/20' },
  slate: { bg: 'bg-slate-700/40', text: 'text-slate-300', icon: 'bg-slate-700 text-slate-400', border: 'border-slate-700/50' },
};

export default function StatCard({ label, value, subtext, icon: Icon, accent, trendLabel, trend }: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className={`bg-slate-800/60 border ${styles.border} rounded-xl p-5 hover:bg-slate-800 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${styles.icon} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {trendLabel && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-red-500/15 text-red-300' :
            trend === 'down' ? 'bg-emerald-500/15 text-emerald-300' :
            'bg-slate-700 text-slate-400'
          }`}>
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
      {subtext && <p className={`text-xs mt-1.5 ${styles.text}`}>{subtext}</p>}
    </div>
  );
}
