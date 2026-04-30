import type { RiskLevel, TransactionStatus } from '../../types';

const RISK_STYLES: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const STATUS_STYLES: Record<TransactionStatus, string> = {
  normal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  suspicious: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  blocked: 'bg-red-500/15 text-red-300 border-red-500/30',
};

interface RiskBadgeProps {
  level?: RiskLevel;
  status?: TransactionStatus;
  className?: string;
}

export default function RiskBadge({ level, status, className = '' }: RiskBadgeProps) {
  const style = level ? RISK_STYLES[level] : status ? STATUS_STYLES[status] : '';
  const label = level ? level.toUpperCase() : status ? status.charAt(0).toUpperCase() + status.slice(1) : '';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide uppercase ${style} ${className}`}>
      {label}
    </span>
  );
}
