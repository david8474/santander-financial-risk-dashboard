import {
  Activity, AlertTriangle, Ban, Flag, ShieldCheck, DollarSign,
  TrendingUp, Zap, Heart, ThumbsUp, Clock, CheckCircle,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import RiskTrendChart from '../components/charts/RiskTrendChart';
import FraudCategoryChart from '../components/charts/FraudCategoryChart';
import TransactionVolumeChart from '../components/charts/TransactionVolumeChart';
import RiskBadge from '../components/ui/RiskBadge';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { dashboardStats: s, riskTrend, fraudCategories, transactions, alerts, customerTrustStats: trust } = useApp();
  const recentHighRisk = transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Transactions"
          value={s.totalTransactions.toLocaleString()}
          icon={Activity}
          accent="blue"
          subtext="Last 72 hours"
          trend="up"
          trendLabel="+12.4%"
        />
        <StatCard
          label="Fraud Risk Score"
          value={`${s.overallRiskScore}/100`}
          icon={TrendingUp}
          accent={s.overallRiskScore > 60 ? 'red' : s.overallRiskScore > 40 ? 'amber' : 'emerald'}
          subtext="Portfolio average"
          trend={s.overallRiskScore > 50 ? 'up' : 'down'}
          trendLabel={s.overallRiskScore > 50 ? 'Elevated' : 'Normal'}
        />
        <StatCard
          label="High-Risk Alerts"
          value={s.highRiskAlerts}
          icon={AlertTriangle}
          accent="amber"
          subtext="Requires review"
          trend="up"
          trendLabel="+5 today"
        />
        <StatCard
          label="Blocked Transactions"
          value={s.blockedTransactions}
          icon={Ban}
          accent="red"
          subtext={`$${s.fraudPreventedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} prevented`}
          trend="down"
          trendLabel="Protected"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Flagged Transactions"
          value={s.flaggedTransactions}
          icon={Flag}
          accent="amber"
          subtext="Suspicious + Review"
        />
        <StatCard
          label="Compliance Score"
          value={`${s.complianceScore}%`}
          icon={ShieldCheck}
          accent="emerald"
          subtext="4 frameworks active"
          trend="neutral"
          trendLabel="Good"
        />
        <StatCard
          label="24h Volume"
          value={`$${(s.transactionVolume24h / 1000).toFixed(0)}K`}
          icon={DollarSign}
          accent="blue"
          subtext="Transaction value"
        />
        <StatCard
          label="Open Alerts"
          value={alerts.filter(a => a.status === 'open').length}
          icon={Zap}
          accent="red"
          subtext="Unresolved incidents"
          trend="up"
          trendLabel="Active"
        />
      </div>

      {/* Customer Trust & Friction Card */}
      <div className="bg-gradient-to-br from-slate-800/70 to-slate-800/40 border border-blue-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center">
            <Heart size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Customer Trust & Friction</h3>
            <p className="text-slate-400 text-xs mt-0.5">Frictionless Secure Banking Experience — live metrics</p>
          </div>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3.5 text-center">
            <Users size={14} className="text-blue-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-xl">{trust.customersProtected}</p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">Customers Protected</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3.5 text-center">
            <ThumbsUp size={14} className="text-emerald-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-xl">{trust.frictionAvoided}</p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">Friction Avoided</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3.5 text-center">
            <Clock size={14} className="text-amber-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-xl">{trust.avgVerifySeconds}s</p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">Avg. Verify Time</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3.5 text-center">
            <CheckCircle size={14} className="text-emerald-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-xl">{trust.secureApprovalsCompleted}</p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">Secure Approvals</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3.5 text-center">
            <Heart size={14} className="text-emerald-400 mx-auto mb-1.5" />
            <p className="text-white font-bold text-xl">{trust.lowFrictionRate}%</p>
            <p className="text-slate-500 text-[11px] leading-tight mt-0.5">Low Friction Rate</p>
            <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
              <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${trust.lowFrictionRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Risk Trend (30 Days)</h3>
              <p className="text-slate-400 text-xs mt-0.5">Risk score, alerts, and blocked transactions over time</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-full">Live</span>
          </div>
          <RiskTrendChart data={riskTrend} />
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">Fraud Categories</h3>
            <p className="text-slate-400 text-xs mt-0.5">Incident count by type</p>
          </div>
          <FraudCategoryChart data={fraudCategories} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">Transaction Volume (30 Days)</h3>
            <p className="text-slate-400 text-xs mt-0.5">Daily transaction count</p>
          </div>
          <TransactionVolumeChart data={riskTrend} />
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold">Recent High-Risk</h3>
            <p className="text-slate-400 text-xs mt-0.5">Latest flagged transactions</p>
          </div>
          <div className="space-y-2.5">
            {recentHighRisk.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{tx.merchant}</p>
                  <p className="text-slate-500 text-[11px]">{tx.maskedAccount}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-xs font-semibold">${tx.amount.toLocaleString()}</p>
                  <RiskBadge level={tx.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Users({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
