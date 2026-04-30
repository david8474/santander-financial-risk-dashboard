import { useState } from 'react';
import {
  Lock, ShieldAlert, PauseCircle, UserCheck, LogOut,
  CheckCircle, AlertTriangle, Info, MessageCircle, ChevronRight,
  Shield, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logAction, saveSecurityAction } from '../lib/auditLogger';
import type { ActionType } from '../types';

interface ActionDef {
  type: ActionType;
  label: string;
  description: string;
  customerImpact: string;
  customerMessage: string;
  frictionLevel: 'Low' | 'Medium' | 'High';
  estimatedTime: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
  requiresRole: string[];
  warning?: string;
}

const ACTIONS: ActionDef[] = [
  {
    type: 'step_up_mfa',
    label: 'Step-Up MFA',
    description: 'Require the account holder to complete an additional MFA challenge before the next transaction proceeds.',
    customerImpact: 'Customer is asked to verify their identity once. Low disruption.',
    customerMessage: 'We noticed something unusual and want to confirm it\'s you. This quick verification usually takes less than 30 seconds.',
    frictionLevel: 'Low',
    estimatedTime: '~30 seconds',
    icon: ShieldAlert,
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    requiresRole: ['analyst', 'manager', 'admin'],
  },
  {
    type: 'transaction_hold',
    label: 'Temporary Transaction Hold',
    description: 'Place a temporary hold on all outbound transactions for this account. Hold expires after 24 hours or manual release.',
    customerImpact: 'Outbound transactions paused. Customer can still view their account. Team reaches out within 2 hours.',
    customerMessage: 'For your protection, we\'re taking a closer look at this transaction. Our team will review it and reach out within 2 hours. Your account remains fully accessible.',
    frictionLevel: 'High',
    estimatedTime: 'Up to 2 hours review',
    icon: PauseCircle,
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    requiresRole: ['manager', 'admin'],
    warning: 'Outbound transactions will be paused. Notify the customer promptly.',
  },
  {
    type: 'account_review',
    label: 'Account Review',
    description: 'Flag the account for enhanced due diligence review. A case is created and assigned to compliance.',
    customerImpact: 'Account operates normally. Our team reviews activity quietly in the background.',
    customerMessage: 'Your account is being reviewed as part of our routine security process. There is no action needed from you at this time.',
    frictionLevel: 'Low',
    estimatedTime: 'No customer interruption',
    icon: UserCheck,
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    requiresRole: ['analyst', 'manager', 'admin'],
  },
  {
    type: 'session_revoke',
    label: 'Revoke Active Sessions',
    description: 'Immediately invalidate all active sessions for this account, forcing re-authentication on all devices.',
    customerImpact: 'Customer is logged out of all devices and must sign in again. Use only when account takeover is confirmed.',
    customerMessage: 'For your security, you have been signed out of all devices. Please sign in again to continue. Contact us if you did not request this.',
    frictionLevel: 'High',
    estimatedTime: 'Immediate — customer must re-login',
    icon: LogOut,
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    requiresRole: ['admin'],
    warning: 'This will log out the user from all devices immediately.',
  },
];

const FRICTION_COLORS: Record<string, string> = {
  Low: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  High: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
};

export default function SecurityControls() {
  const { role, transactions, refreshAuditLogs } = useApp();
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState<ActionType | null>(null);
  const [success, setSuccess] = useState<ActionType | null>(null);
  const [error, setError] = useState('');

  const highRiskTxs = transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').slice(0, 30);

  // Get context for selected transaction to show adaptive recommendation
  const selectedTx = highRiskTxs.find(t => t.id === selectedTransaction);

  async function handleAction(actionType: ActionType) {
    if (!selectedAccount) { setError('Please select an account'); return; }
    if (!reason.trim()) { setError('Please provide a reason for this action'); return; }
    setError('');
    setLoading(actionType);

    try {
      await saveSecurityAction(actionType, selectedAccount, reason, role, selectedTransaction || undefined);
      await logAction(
        `Initiated: ${actionType.replace(/_/g, ' ')}`,
        'account',
        selectedAccount,
        role,
        { reason, transactionId: selectedTransaction }
      );
      await refreshAuditLogs();
      setSuccess(actionType);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to execute action. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Adaptive Auth Recommendation Banner (shown when transaction selected) */}
      {selectedTx && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-1">Adaptive Recommendation for this Transaction</p>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-slate-300 text-xs">Risk Score: <span className={`font-bold ${selectedTx.riskScore >= 80 ? 'text-red-400' : selectedTx.riskScore >= 60 ? 'text-orange-400' : 'text-amber-400'}`}>{selectedTx.riskScore}/100</span></span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300 text-xs">Friction Score: <span className="font-bold text-blue-300">{selectedTx.frictionScore}/100</span></span>
                <span className="text-slate-600">·</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${FRICTION_COLORS[selectedTx.frictionLevel === 'low' ? 'Low' : selectedTx.frictionLevel === 'medium' ? 'Medium' : 'High']}`}>
                  {selectedTx.frictionLevel} friction
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ChevronRight size={12} className="text-blue-400" />
                <span>Recommended: </span>
                <span className="font-semibold text-blue-300">
                  {selectedTx.recommendedAction === 'allow' ? 'Allow — No action needed' :
                   selectedTx.recommendedAction === 'soft_verify' ? 'Soft Verify' :
                   selectedTx.recommendedAction === 'step_up_mfa' ? 'Step-Up MFA' : 'Hold & Review'}
                </span>
                <span className="text-slate-500">— safest action with least customer friction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-500/15 rounded-lg flex items-center justify-center">
            <Lock size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Security Response Center</h3>
            <p className="text-slate-400 text-xs">All actions are logged in the immutable audit trail</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Target Account *</label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select account...</option>
              {[...new Set(highRiskTxs.map(t => t.maskedAccount))].map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">Related Transaction (Optional)</label>
            <select
              value={selectedTransaction}
              onChange={e => setSelectedTransaction(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select transaction...</option>
              {highRiskTxs
                .filter(t => !selectedAccount || t.maskedAccount === selectedAccount)
                .slice(0, 10)
                .map(tx => (
                  <option key={tx.id} value={tx.id}>{tx.id} — ${tx.amount.toLocaleString()}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-slate-300 text-xs font-medium mb-1.5">Reason / Justification *</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Describe the reason for this security action (required for audit compliance)..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
          />
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-red-300 text-sm">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTIONS.map(action => {
            const canUse = action.requiresRole.includes(role);
            const isLoading = loading === action.type;
            const isSuccess = success === action.type;
            const Icon = action.icon;

            return (
              <div key={action.type} className={`border rounded-xl p-4 transition-all ${canUse ? action.border + ' ' + action.bg : 'border-slate-700/30 bg-slate-800/30 opacity-50'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <Icon size={18} className={canUse ? action.color : 'text-slate-500'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`text-sm font-semibold ${canUse ? 'text-white' : 'text-slate-500'}`}>{action.label}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${FRICTION_COLORS[action.frictionLevel]}`}>
                        {action.frictionLevel} Friction
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{action.description}</p>
                    {canUse && (
                      <>
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                          <Clock size={10} className="mt-0.5 flex-shrink-0" />
                          <span>{action.estimatedTime}</span>
                        </div>
                        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-400">
                          <Info size={10} className="mt-0.5 flex-shrink-0 text-blue-400" />
                          <span>{action.customerImpact}</span>
                        </div>
                      </>
                    )}
                    {action.warning && canUse && (
                      <p className="text-amber-400 text-xs mt-1.5 flex items-start gap-1">
                        <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" />
                        {action.warning}
                      </p>
                    )}
                    {!canUse && (
                      <p className="text-slate-500 text-xs mt-1.5">
                        Requires role: {action.requiresRole.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer-facing message preview */}
                {canUse && (
                  <div className="mb-3 flex items-start gap-2 bg-slate-900/50 rounded-lg px-2.5 py-2">
                    <MessageCircle size={10} className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-500 text-[11px] italic leading-relaxed">"{action.customerMessage}"</p>
                  </div>
                )}

                <button
                  onClick={() => handleAction(action.type)}
                  disabled={!canUse || isLoading || !!success}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    isSuccess
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/20'
                      : canUse
                        ? `${action.bg} ${action.color} border ${action.border} hover:opacity-80 active:scale-95`
                        : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Executing...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={14} />
                      Action Logged
                    </span>
                  ) : canUse ? (
                    `Execute: ${action.label}`
                  ) : (
                    'Insufficient Permissions'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Lock size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs leading-relaxed text-slate-300">
          <p className="text-blue-300 font-semibold mb-1">Customer-First Security Principle</p>
          <p>
            Actions are chosen to protect customers with the least disruption. Step-Up MFA is preferred over holds;
            holds are preferred over session revocation. Permanent account closures must follow the standard banking
            workflow with dual authorization and customer notification per Regulation E.
            All actions taken here are reversible and require human review.
          </p>
        </div>
      </div>
    </div>
  );
}
