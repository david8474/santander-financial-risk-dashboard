import {
  Heart, ShieldCheck, Clock, ThumbsUp, TrendingDown,
  CheckCircle, Info, ChevronRight, Sparkles, Users,
  MessageCircle, AlertCircle, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AdaptiveAuthAction, FrictionLevel } from '../types';

const FRICTION_CONFIG: Record<FrictionLevel, { label: string; color: string; bg: string; border: string; dot: string }> = {
  low: {
    label: 'Low Friction',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  medium: {
    label: 'Medium Friction',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  high: {
    label: 'High Friction',
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
  },
};

const ACTION_CONFIG: Record<AdaptiveAuthAction, { label: string; description: string; color: string; bg: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  allow: {
    label: 'Allow — No Friction',
    description: 'Transaction is within normal parameters. Approved seamlessly.',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle,
  },
  soft_verify: {
    label: 'Soft Verify',
    description: 'Light confirmation requested — tap to approve in the app.',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: MessageCircle,
  },
  step_up_mfa: {
    label: 'Step-Up MFA',
    description: 'One-time verification code required before proceeding.',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: ShieldCheck,
  },
  transaction_hold_review: {
    label: 'Hold & Review',
    description: 'Transaction paused while our team conducts a brief safety review.',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: AlertCircle,
  },
};

export default function CustomerTrust() {
  const { transactions, customerTrustStats: s } = useApp();

  const frictionBreakdown = {
    low: transactions.filter(t => t.frictionLevel === 'low').length,
    medium: transactions.filter(t => t.frictionLevel === 'medium').length,
    high: transactions.filter(t => t.frictionLevel === 'high').length,
  };

  const actionBreakdown: Record<AdaptiveAuthAction, number> = {
    allow: transactions.filter(t => t.recommendedAction === 'allow').length,
    soft_verify: transactions.filter(t => t.recommendedAction === 'soft_verify').length,
    step_up_mfa: transactions.filter(t => t.recommendedAction === 'step_up_mfa').length,
    transaction_hold_review: transactions.filter(t => t.recommendedAction === 'transaction_hold_review').length,
  };

  const recentWithFriction = transactions
    .filter(t => t.frictionLevel !== 'low')
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-white font-bold text-lg">Frictionless Secure Banking Experience</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                Active
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              Every security decision is weighted against customer experience. Our adaptive engine selects the
              safest action with the least friction — protecting customers without interrupting their day.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Customers Protected</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.customersProtected.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">Transactions with proactive security action</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <ThumbsUp size={18} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Friction Avoided</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.frictionAvoided.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">Unnecessary verification steps removed</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-amber-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Avg Verify Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.avgVerifySeconds}s</p>
          <p className="text-slate-400 text-xs mt-1">Average customer verification time</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">False Positive Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.falsePositiveRate}%</p>
          <p className="text-slate-400 text-xs mt-1">Legitimate transactions incorrectly flagged</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Secure Approvals</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.secureApprovalsCompleted.toLocaleString()}</p>
          <p className="text-slate-400 text-xs mt-1">Transactions approved with full security</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <Heart size={18} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Low Friction Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{s.lowFrictionRate}%</p>
          <p className="text-slate-400 text-xs mt-1">Transactions that required no extra steps</p>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5">
            <div className="h-1.5 bg-emerald-500 rounded-full transition-all" style={{ width: `${s.lowFrictionRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friction Score Breakdown */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-400" />
            <h3 className="text-white font-semibold">Customer Friction Score Breakdown</h3>
          </div>
          <div className="space-y-3">
            {(Object.entries(frictionBreakdown) as [FrictionLevel, number][]).map(([level, count]) => {
              const cfg = FRICTION_CONFIG[level];
              const pct = Math.round((count / transactions.length) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-bold">{count}</span>
                      <span className="text-slate-500 text-xs">({pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${cfg.dot}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-slate-400 text-xs leading-relaxed">
              Friction score measures the interruption a customer experiences. The goal is to keep as many
              transactions as possible at Low friction while not compromising security for flagged ones.
            </p>
          </div>
        </div>

        {/* Adaptive Auth Breakdown */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-blue-400" />
            <h3 className="text-white font-semibold">Adaptive Authentication Decisions</h3>
          </div>
          <div className="space-y-3">
            {(Object.entries(actionBreakdown) as [AdaptiveAuthAction, number][]).map(([action, count]) => {
              const cfg = ACTION_CONFIG[action];
              const Icon = cfg.icon;
              const pct = Math.round((count / transactions.length) * 100);
              return (
                <div key={action} className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                  <Icon size={16} className={cfg.color} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-slate-500 text-[11px] leading-tight mt-0.5">{cfg.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white text-sm font-bold">{count}</p>
                    <p className="text-slate-500 text-[11px]">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Friction Ladder Explainer */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Info size={16} className="text-slate-400" />
          <h3 className="text-white font-semibold">How Adaptive Authentication Works</h3>
          <span className="ml-auto text-xs text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-full">Risk-Proportional</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              level: 'Low Risk',
              action: 'Seamless Approval',
              message: 'Your transaction was approved instantly — everything looks just like you.',
              color: 'text-emerald-300',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
              icon: CheckCircle,
            },
            {
              level: 'Medium Risk',
              action: 'Soft Verification',
              message: 'We noticed a small change. A quick tap in your app confirms it\'s you — takes 15 seconds.',
              color: 'text-blue-300',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
              icon: MessageCircle,
            },
            {
              level: 'High Risk',
              action: 'Step-Up MFA',
              message: 'We noticed something unusual and want to confirm it\'s you. This usually takes under 30 seconds.',
              color: 'text-amber-300',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/20',
              icon: ShieldCheck,
            },
            {
              level: 'Critical Risk',
              action: 'Hold & Review',
              message: 'For your protection, our team is reviewing this. We\'ll reach out within 2 hours. Your account is safe.',
              color: 'text-orange-300',
              bg: 'bg-orange-500/10',
              border: 'border-orange-500/20',
              icon: AlertCircle,
            },
          ].map(({ level, action, message, color, bg, border, icon: Icon }) => (
            <div key={level} className={`${bg} border ${border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} className={color} />
                <span className={`text-xs font-bold ${color}`}>{level}</span>
              </div>
              <p className="text-white text-sm font-semibold mb-2">{action}</p>
              <div className={`${bg} border ${border} rounded-lg p-2.5 mb-2`}>
                <p className="text-slate-300 text-xs leading-relaxed italic">"{message}"</p>
              </div>
              <p className="text-slate-500 text-[11px]">Customer-facing message</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions With Friction */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
          <Heart size={15} className="text-blue-400" />
          <h3 className="text-white font-semibold">Recent Customer Verification Events</h3>
          <span className="ml-auto text-xs text-slate-500">{recentWithFriction.length} transactions</span>
        </div>
        <div className="divide-y divide-slate-700/20">
          {recentWithFriction.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-sm">No friction events in current dataset</div>
          ) : (
            recentWithFriction.map(tx => {
              const frictionCfg = FRICTION_CONFIG[tx.frictionLevel];
              const actionCfg = ACTION_CONFIG[tx.recommendedAction];
              const ActionIcon = actionCfg.icon;
              return (
                <div key={tx.id} className="px-5 py-4 hover:bg-slate-700/10 transition-colors">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-white text-sm font-semibold">{tx.merchant}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${frictionCfg.color} ${frictionCfg.bg} ${frictionCfg.border}`}>
                          {frictionCfg.label}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${actionCfg.color} ${actionCfg.bg} ${actionCfg.border} flex items-center gap-1`}>
                          <ActionIcon size={10} />
                          {actionCfg.label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs font-mono">{tx.maskedAccount} · {tx.customerId}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold">${tx.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 justify-end mt-0.5">
                        <span className="text-slate-500 text-xs">Risk: <span className={tx.riskScore >= 80 ? 'text-red-400' : tx.riskScore >= 60 ? 'text-orange-400' : 'text-amber-400'}>{tx.riskScore}</span></span>
                        <span className="text-slate-500 text-xs">Friction: <span className={frictionCfg.color}>{tx.frictionScore}</span></span>
                      </div>
                    </div>
                  </div>
                  {/* Customer-facing message */}
                  <div className="bg-slate-900/50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                    <MessageCircle size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300 text-xs leading-relaxed italic">"{tx.customerMessage}"</p>
                    {tx.estimatedVerifySeconds > 0 && (
                      <div className="ml-auto flex-shrink-0 flex items-center gap-1 text-slate-500 text-xs">
                        <Clock size={10} />
                        ~{tx.estimatedVerifySeconds}s
                      </div>
                    )}
                  </div>
                  {/* Why */}
                  {tx.frictionReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-slate-600 text-[10px] uppercase tracking-wide flex items-center gap-1">
                        <Info size={9} /> Why:
                      </span>
                      {tx.frictionReasons.slice(0, 3).map((r, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full border border-slate-700/50">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security Commitment */}
      <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold mb-1.5">Our Commitment: Safe and Calm</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              We never use scary or aggressive language with customers. Every verification request explains why
              it is needed, how long it takes, and reassures the customer their account is being protected —
              not punished. Security decisions are proportional, reversible, and always logged for compliance review.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['PCI-DSS', 'GDPR', 'SOX', 'ISO 27001'].map(f => (
                <span key={f} className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full font-medium">
                  {f}
                </span>
              ))}
              <span className="text-xs px-2.5 py-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-full font-medium flex items-center gap-1">
                <CheckCircle size={10} />
                No Permanent Lockouts
              </span>
              <span className="text-xs px-2.5 py-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-full font-medium flex items-center gap-1">
                <CheckCircle size={10} />
                All Actions Audited
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
