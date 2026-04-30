import { Brain, MapPin, Zap, Shield, AlertTriangle, Clock, Smartphone, Globe, MessageCircle, Info, ChevronRight } from 'lucide-react';
import RiskBadge from '../components/ui/RiskBadge';
import { useApp } from '../context/AppContext';
import type { AdaptiveAuthAction, FrictionLevel } from '../types';

const RULE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Unusual transaction amount': AlertTriangle,
  'Large transaction amount': AlertTriangle,
  'High-risk country transfer': Globe,
  'Multiple failed MFA attempts': Shield,
  'Rapid transaction velocity': Zap,
  'Geographic anomaly detected': MapPin,
  'Suspicious device detected': Smartphone,
  'Known high-risk merchant category': Brain,
  'Wire transfer to external entity': Globe,
  'Transaction within normal parameters': Shield,
};

const RULE_DESCRIPTIONS: Record<string, string> = {
  'Unusual transaction amount': 'Transaction exceeds 3σ from customer baseline — pattern deviation detected',
  'Large transaction amount': 'Transaction value exceeds $5,000 threshold — elevated monitoring applied',
  'High-risk country transfer': 'Destination country flagged in FATF high-risk jurisdiction list',
  'Multiple failed MFA attempts': 'Account experienced ≥3 failed MFA challenges in the last 30 minutes',
  'Rapid transaction velocity': 'More than 5 transactions detected within a 10-minute window',
  'Geographic anomaly detected': 'Transaction location inconsistent with customer travel pattern',
  'Suspicious device detected': 'Unrecognized or anonymizing device (Tor, VPN) used for authentication',
  'Known high-risk merchant category': 'Merchant category (crypto, gambling) presents elevated money laundering risk',
  'Wire transfer to external entity': 'Outbound wire transfer to non-enrolled external account',
};

const FRICTION_LABELS: Record<FrictionLevel, { label: string; color: string; bg: string; border: string }> = {
  low: { label: 'Low', color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  high: { label: 'High', color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const ACTION_LABELS: Record<AdaptiveAuthAction, { label: string; color: string; softer?: string }> = {
  allow: { label: 'Allow', color: 'text-emerald-300' },
  soft_verify: { label: 'Soft Verify', color: 'text-blue-300', softer: 'Consider soft verify over step-up MFA' },
  step_up_mfa: { label: 'Step-Up MFA', color: 'text-amber-300', softer: 'Step-Up MFA is preferred over transaction hold' },
  transaction_hold_review: { label: 'Hold & Review', color: 'text-orange-300' },
};

export default function RiskEngine() {
  const { transactions } = useApp();
  const highRisk = transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical');

  const ruleStats = [
    { rule: 'Unusual transaction amount', count: transactions.filter(t => t.riskReasons.includes('Unusual transaction amount')).length },
    { rule: 'Geographic anomaly detected', count: transactions.filter(t => t.geoAnomalyFlag).length },
    { rule: 'Multiple failed MFA attempts', count: transactions.filter(t => !t.mfaPassed).length },
    { rule: 'Rapid transaction velocity', count: transactions.filter(t => t.velocityFlag).length },
    { rule: 'High-risk country transfer', count: transactions.filter(t => ['RU', 'NG', 'UA', 'TR'].includes(t.country)).length },
    { rule: 'Suspicious device detected', count: transactions.filter(t => t.device === 'Unknown Device' || t.device === 'Tor Browser').length },
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/15 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Anomaly Detection Engine</h3>
            <p className="text-slate-400 text-xs">Rule-based ML scoring with multi-signal correlation</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-medium">Engine Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ruleStats.map(({ rule, count }) => {
            const Icon = RULE_ICONS[rule] || AlertTriangle;
            return (
              <div key={rule} className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-700/40">
                <div className="flex items-start justify-between mb-2">
                  <Icon size={15} className="text-red-400 mt-0.5" />
                  <span className="text-xl font-bold text-white">{count}</span>
                </div>
                <p className="text-slate-300 text-xs leading-tight">{rule}</p>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
                  <div
                    className="h-1 bg-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (count / transactions.length) * 100 * 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
          <div className="flex-1">
            <h3 className="text-white font-semibold">Security Decision Engine</h3>
            <p className="text-slate-400 text-xs mt-0.5">{highRisk.length} transactions — Risk Score + Friction Score + Recommended Action</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info size={12} />
            <span>Safest action with least customer friction</span>
          </div>
        </div>

        <div className="divide-y divide-slate-700/30">
          {highRisk.slice(0, 30).map(tx => {
            const frictionCfg = FRICTION_LABELS[tx.frictionLevel];
            const actionCfg = ACTION_LABELS[tx.recommendedAction];
            return (
              <div key={tx.id} className="px-5 py-4 hover:bg-slate-700/20 transition-colors">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-medium text-sm">{tx.merchant}</p>
                      <RiskBadge level={tx.riskLevel} />
                      <RiskBadge status={tx.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono">{tx.id}</span>
                      <span>·</span>
                      <span>{tx.maskedAccount}</span>
                      <span>·</span>
                      <Clock size={11} />
                      <span>{new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-lg">${tx.amount.toLocaleString()}</p>
                    {/* Dual Score Display */}
                    <div className="flex items-center gap-3 justify-end mt-1.5">
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Risk Score</span>
                        <span className={`text-sm font-bold ${tx.riskScore >= 80 ? 'text-red-400' : tx.riskScore >= 60 ? 'text-orange-400' : 'text-amber-400'}`}>
                          {tx.riskScore}/100
                        </span>
                      </div>
                      <div className="w-px h-8 bg-slate-700" />
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block">Friction Score</span>
                        <span className={`text-sm font-bold ${frictionCfg.color}`}>
                          {tx.frictionScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Action Banner */}
                <div className={`flex items-center gap-3 ${frictionCfg.bg} border ${frictionCfg.border} rounded-lg px-3 py-2.5 mb-3`}>
                  <ChevronRight size={13} className={actionCfg.color} />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 text-xs">Recommended: </span>
                    <span className={`text-xs font-semibold ${actionCfg.color}`}>{actionCfg.label}</span>
                    {actionCfg.softer && (
                      <span className="text-slate-500 text-xs ml-2">— {actionCfg.softer}</span>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${frictionCfg.color} ${frictionCfg.bg} ${frictionCfg.border}`}>
                    {frictionCfg.label} Friction
                  </span>
                </div>

                {/* Customer Message */}
                <div className="flex items-start gap-2 bg-slate-900/40 rounded-lg px-3 py-2 mb-3">
                  <MessageCircle size={11} className="text-slate-500 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-400 text-xs italic leading-relaxed">"{tx.customerMessage}"</p>
                  {tx.estimatedVerifySeconds > 0 && (
                    <div className="ml-auto flex-shrink-0 flex items-center gap-1 text-slate-600 text-xs">
                      <Clock size={10} />
                      ~{tx.estimatedVerifySeconds}s
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {tx.riskReasons.map((reason, i) => {
                    const Icon = RULE_ICONS[reason] || AlertTriangle;
                    const desc = RULE_DESCRIPTIONS[reason];
                    return (
                      <div key={i} className="group relative">
                        <div className="flex items-center gap-1.5 bg-slate-900/70 border border-red-500/20 rounded-md px-2.5 py-1.5 text-xs text-red-300 cursor-help">
                          <Icon size={11} />
                          <span>{reason}</span>
                        </div>
                        {desc && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 leading-relaxed shadow-xl z-10 hidden group-hover:block">
                            {desc}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span><MapPin size={11} className="inline mr-1" />{tx.city}, {tx.country}</span>
                  <span><Smartphone size={11} className="inline mr-1" />{tx.device}</span>
                  <span>MFA: <span className={tx.mfaPassed ? 'text-emerald-400' : 'text-red-400'}>{tx.mfaPassed ? 'Passed' : 'Failed'}</span></span>
                  <span>Velocity: <span className={tx.velocityFlag ? 'text-red-400' : 'text-emerald-400'}>{tx.velocityFlag ? 'Flagged' : 'Normal'}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
