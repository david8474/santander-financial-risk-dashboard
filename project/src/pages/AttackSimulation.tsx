import { useState, useRef, useEffect } from 'react';
import {
  Play, RotateCcw, Shield, AlertTriangle, Zap, UserX, Lock,
  CheckCircle, Clock, ChevronRight, Activity, Eye, FileText,
  ShieldAlert, PauseCircle, UserCheck, LogOut, Wifi,
  MessageCircle, Heart, TrendingDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { logAction, saveSecurityAction } from '../lib/auditLogger';

interface StageEvent {
  time: number;
  message: string;
  customerMessage?: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  frictionDelta?: number;
}

interface Stage {
  id: number;
  label: string;
  description: string;
  riskScore: number;
  frictionScore: number;
  duration: number;
  events: StageEvent[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STAGES: Stage[] = [
  {
    id: 1,
    label: 'Suspicious Login',
    description: 'Attacker probes the account with an unrecognized device from a high-risk country',
    riskScore: 45,
    frictionScore: 20,
    duration: 4000,
    icon: Eye,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    events: [
      { time: 0, message: 'Login attempt detected from unknown device: "Tor Browser v13.0"', type: 'warning', icon: Wifi, frictionDelta: 5 },
      { time: 800, message: 'Geolocation anomaly: expected US, received Lagos, NG', type: 'warning', icon: AlertTriangle, frictionDelta: 8 },
      { time: 1800, message: 'MFA challenge issued — response failed (attempt 1/3)', customerMessage: 'We noticed a login from an unfamiliar location. To protect your account, we\'ve sent a verification code to your registered device.', type: 'danger', icon: Shield, frictionDelta: 7 },
      { time: 2800, message: 'Risk score elevated: 12 → 45 (threshold breach)', type: 'danger', icon: Activity },
    ],
  },
  {
    id: 2,
    label: 'Account Takeover Pattern',
    description: 'Credential stuffing escalates with rapid retry attempts and fingerprint mismatch',
    riskScore: 68,
    frictionScore: 45,
    duration: 4500,
    icon: UserX,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    events: [
      { time: 0, message: '7 rapid login attempts in 4 minutes — velocity threshold exceeded', type: 'danger', icon: Zap, frictionDelta: 12 },
      { time: 900, message: 'Device fingerprint mismatch: stored FP-84210 vs presented FP-00193', type: 'danger', icon: AlertTriangle, frictionDelta: 8 },
      { time: 1900, message: 'Session cookie replay attempt detected and blocked', type: 'danger', icon: Shield },
      { time: 3200, message: 'Risk score elevated: 45 → 68 — Account Takeover pattern confirmed', type: 'danger', icon: Activity },
    ],
  },
  {
    id: 3,
    label: 'Fraud Transaction Attempt',
    description: 'Attacker gains partial access and attempts a large outbound wire transfer',
    riskScore: 87,
    frictionScore: 75,
    duration: 4000,
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    events: [
      { time: 0, message: 'Wire transfer initiated: $48,500 → FX Trade Pro (Cayman Islands)', customerMessage: 'We noticed an unusual transfer request on your account. For your protection, we\'re reviewing this transaction. This usually takes less than 2 minutes.', type: 'danger', icon: AlertTriangle, frictionDelta: 20 },
      { time: 900, message: 'Beneficiary flagged: new payee, never transacted, high-risk jurisdiction', type: 'danger', icon: AlertTriangle },
      { time: 1800, message: 'Merchant category "Forex" triggers enhanced scrutiny rule R-4412', type: 'danger', icon: Zap },
      { time: 2800, message: 'Risk score elevated: 68 → 87 — CRITICAL: Transaction blocked pending review', type: 'danger', icon: Activity },
    ],
  },
  {
    id: 4,
    label: 'Automated Safe Response',
    description: 'SOC controls activate to contain the threat without permanent account lockout',
    riskScore: 87,
    frictionScore: 75,
    duration: 5000,
    icon: Shield,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    events: [
      { time: 0, message: 'CONTROL: Step-Up MFA triggered — push notification sent to registered device', customerMessage: 'We noticed something unusual and want to confirm it\'s you. This quick verification usually takes less than 30 seconds and keeps your account protected.', type: 'info', icon: ShieldAlert },
      { time: 1200, message: 'CONTROL: Temporary transaction hold applied — 24-hour window', customerMessage: 'For your protection, outbound transfers are temporarily paused. Your account remains fully accessible. We\'ll reach out within 2 hours.', type: 'info', icon: PauseCircle },
      { time: 2400, message: 'CONTROL: Account flagged for enhanced due diligence review', customerMessage: 'Your account is being reviewed as part of our security process. No action needed from you.', type: 'info', icon: UserCheck },
      { time: 3600, message: 'CONTROL: All active sessions revoked — user forced to re-authenticate', customerMessage: 'For your security, you\'ve been signed out of all devices. Please sign in again. Contact us if you need help.', type: 'info', icon: LogOut },
    ],
  },
  {
    id: 5,
    label: 'Compliance Audit Trail',
    description: 'Every action is logged with timestamp, actor, risk delta, friction delta, and compliance mapping',
    riskScore: 87,
    frictionScore: 60,
    duration: 3500,
    icon: FileText,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    events: [
      { time: 0, message: 'PCI-DSS Req. 10.2: Access attempts logged with user ID, IP, and timestamp', type: 'success', icon: CheckCircle },
      { time: 800, message: 'GDPR Art. 32: Anomaly detection evidence preserved; no PII exposed in logs', type: 'success', icon: CheckCircle },
      { time: 1800, message: 'SOX S.302: Immutable audit entries created — change tracking complete', type: 'success', icon: CheckCircle },
      { time: 2800, message: 'ISO 27001 A.16.1: Incident record created; friction minimization applied where possible', type: 'success', icon: CheckCircle },
    ],
  },
];

const SIMULATED_TX = {
  id: 'TXN-SIM-48291',
  maskedAccount: '****-****-****-7741',
  customerId: 'CUS-SIM-384920',
  amount: 48500,
  merchant: 'FX Trade Pro',
  category: 'Forex / Wire Transfer',
  country: 'KY (Cayman Islands)',
  device: 'Tor Browser v13.0',
  ip: '185.220.***.***',
  mfa: 'Failed',
};

type SimStatus = 'idle' | 'running' | 'paused' | 'complete';

const EVENT_TYPE_STYLES = {
  info: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  warning: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  danger: 'text-red-300 bg-red-500/10 border-red-500/20',
  success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
};

export default function AttackSimulation() {
  const { role, refreshAuditLogs } = useApp();
  const [status, setStatus] = useState<SimStatus>('idle');
  const [currentStage, setCurrentStage] = useState(0);
  const [riskScore, setRiskScore] = useState(12);
  const [frictionScore, setFrictionScore] = useState(5);
  const [displayedEvents, setDisplayedEvents] = useState<Array<{ stageId: number; event: StageEvent; ts: string }>>([]);
  const [auditPreview, setAuditPreview] = useState<Array<{ action: string; compliance: string; ts: string }>>([]);
  const [stageProgress, setStageProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logPanelRef = useRef<HTMLDivElement>(null);

  function clearTimers() {
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function reset() {
    clearTimers();
    setStatus('idle');
    setCurrentStage(0);
    setRiskScore(12);
    setFrictionScore(5);
    setDisplayedEvents([]);
    setAuditPreview([]);
    setStageProgress(0);
  }

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (logPanelRef.current) {
      logPanelRef.current.scrollTop = logPanelRef.current.scrollHeight;
    }
  }, [displayedEvents]);

  async function runStage(stageIdx: number): Promise<void> {
    if (stageIdx >= STAGES.length) {
      setStatus('complete');
      await refreshAuditLogs();
      return;
    }

    const stage = STAGES[stageIdx];
    setCurrentStage(stageIdx);
    setStageProgress(0);

    const progressStart = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStart;
      setStageProgress(Math.min(100, Math.round((elapsed / stage.duration) * 100)));
    }, 50);

    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      timerRef.current.push(id);
      return id;
    };

    stage.events.forEach(event => {
      t(event.time, () => {
        const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDisplayedEvents(prev => [...prev, { stageId: stage.id, event, ts }]);
        if (event.frictionDelta) {
          setFrictionScore(prev => Math.min(100, prev + event.frictionDelta!));
        }
      });
    });

    t(stage.duration * 0.6, () => {
      setRiskScore(stage.riskScore);
      setFrictionScore(stage.frictionScore);
    });

    if (stageIdx === 3) {
      const actions: Array<{ type: string; label: string }> = [
        { type: 'step_up_mfa', label: 'Step-Up MFA triggered' },
        { type: 'transaction_hold', label: 'Transaction hold applied' },
        { type: 'account_review', label: 'Account review opened' },
        ...(role === 'admin' ? [{ type: 'session_revoke', label: 'Sessions revoked' }] : []),
      ];

      for (let i = 0; i < actions.length; i++) {
        t(800 + i * 1200, async () => {
          await saveSecurityAction(
            actions[i].type,
            SIMULATED_TX.maskedAccount,
            'Live Attack Simulation — automated SOC response',
            role,
            SIMULATED_TX.id
          );
        });
      }
    }

    if (stageIdx === 4) {
      const complianceEntries = [
        { action: 'Anomaly detection event logged', compliance: 'PCI-DSS Req. 10.2', delay: 100 },
        { action: 'Privacy-safe evidence preserved', compliance: 'GDPR Art. 32', delay: 900 },
        { action: 'Immutable audit entry created', compliance: 'SOX Section 302', delay: 1900 },
        { action: 'Incident case opened — friction minimized', compliance: 'ISO 27001 A.16.1', delay: 2900 },
      ];

      for (const entry of complianceEntries) {
        t(entry.delay, async () => {
          const ts = new Date().toISOString();
          const previewTs = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setAuditPreview(prev => [...prev, { action: entry.action, compliance: entry.compliance, ts: previewTs }]);

          await logAction(
            entry.action,
            'simulation',
            SIMULATED_TX.id,
            role,
            {
              compliance: entry.compliance,
              account: SIMULATED_TX.maskedAccount,
              riskScoreBefore: STAGES[stageIdx - 1]?.riskScore ?? 12,
              riskScoreAfter: STAGES[stageIdx].riskScore,
              frictionScoreBefore: STAGES[stageIdx - 1]?.frictionScore ?? 5,
              frictionScoreAfter: STAGES[stageIdx].frictionScore,
              simulationMode: true,
              timestamp: ts,
            }
          );
        });
      }
    }

    await new Promise<void>(resolve => {
      const id = setTimeout(async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStageProgress(100);
        await runStage(stageIdx + 1);
        resolve();
      }, stage.duration);
      timerRef.current.push(id);
    });
  }

  async function startSimulation() {
    reset();
    await new Promise(r => setTimeout(r, 50));
    setStatus('running');

    await logAction(
      'Live Attack Simulation started',
      'simulation',
      SIMULATED_TX.id,
      role,
      { account: SIMULATED_TX.maskedAccount, simulationMode: true }
    );

    runStage(0);
  }

  const riskColor = riskScore >= 80 ? 'text-red-400' : riskScore >= 60 ? 'text-orange-400' : riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400';
  const riskBarColor = riskScore >= 80 ? 'bg-red-500' : riskScore >= 60 ? 'bg-orange-400' : riskScore >= 40 ? 'bg-amber-400' : 'bg-emerald-400';
  const riskLabel = riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';

  const frictionColor = frictionScore >= 60 ? 'text-red-400' : frictionScore >= 25 ? 'text-amber-400' : 'text-emerald-400';
  const frictionBarColor = frictionScore >= 60 ? 'bg-red-500' : frictionScore >= 25 ? 'bg-amber-400' : 'bg-emerald-400';
  const frictionLabel = frictionScore >= 60 ? 'HIGH' : frictionScore >= 25 ? 'MEDIUM' : 'LOW';

  // Latest customer-facing message from the most recent event that has one
  const latestCustomerMsg = [...displayedEvents].reverse().find(e => e.event.customerMessage)?.event.customerMessage;

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 border border-red-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={24} className="text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-white font-bold text-lg">Live Attack Simulation</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                SAFE SIMULATION MODE
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              This safe simulation demonstrates how a banking SOC could detect account takeover behavior, escalate risk,
              trigger controlled response actions, and preserve audit evidence for PCI, GDPR, and SOX review.
              Includes live friction scoring and customer-friendly security messages. All data is synthetic.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {status !== 'idle' && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
            <button
              onClick={startSimulation}
              disabled={status === 'running'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                status === 'running'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 active:scale-95'
              }`}
            >
              {status === 'running' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Simulation Running...
                </>
              ) : status === 'complete' ? (
                <><Play size={14} /> Replay Simulation</>
              ) : (
                <><Play size={14} /> Start Attack Simulation</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer-Facing Message Banner (appears during simulation) */}
      {latestCustomerMsg && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={12} className="text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Customer-Facing Message</span>
                <span className="text-xs text-slate-500 ml-auto">What the customer sees</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed italic">"{latestCustomerMsg}"</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Timeline */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-white font-semibold text-sm px-1">Attack Timeline</h3>
          <div className="space-y-2">
            {STAGES.map((stage, idx) => {
              const done = status !== 'idle' && idx < currentStage;
              const active = status === 'running' && idx === currentStage;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`relative border rounded-xl p-4 transition-all duration-500 ${
                    active
                      ? `${stage.bgColor} ${stage.borderColor} shadow-lg`
                      : done
                        ? 'bg-slate-800/80 border-slate-600/50'
                        : 'bg-slate-800/30 border-slate-700/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      done ? 'bg-emerald-500/20' : active ? stage.bgColor : 'bg-slate-700/50'
                    }`}>
                      {done ? (
                        <CheckCircle size={16} className="text-emerald-400" />
                      ) : (
                        <Icon size={16} className={active ? stage.color : 'text-slate-500'} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">Stage {stage.id}</span>
                        {active && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-semibold leading-tight ${active ? 'text-white' : done ? 'text-slate-300' : 'text-slate-500'}`}>
                        {stage.label}
                      </p>
                    </div>
                    {active && (
                      <ChevronRight size={14} className={stage.color} />
                    )}
                  </div>

                  {/* Show risk + friction for active/done stages */}
                  {(active || done) && (
                    <div className="flex items-center gap-3 mt-1 mb-1">
                      <span className="text-[10px] text-slate-500">Risk: <span className="text-slate-300 font-medium">{stage.riskScore}</span></span>
                      <span className="text-[10px] text-slate-500">Friction: <span className="text-slate-300 font-medium">{stage.frictionScore}</span></span>
                    </div>
                  )}

                  {active && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-700/50 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-100 ${stage.color.replace('text-', 'bg-')}`}
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Risk Meter + Friction Meter + Transaction + Events */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dual Score Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Risk Score Meter */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Live Risk Score</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold tracking-wide ${
                  riskScore >= 80 ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                  riskScore >= 60 ? 'bg-orange-500/15 text-orange-300 border-orange-500/30' :
                  riskScore >= 40 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {riskLabel}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-5xl font-bold tabular-nums transition-all duration-700 ${riskColor}`}>{riskScore}</span>
                <span className="text-slate-500 text-base pb-1">/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${riskBarColor}`} style={{ width: `${riskScore}%` }} />
              </div>
            </div>

            {/* Friction Score Meter */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">Customer Friction</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold tracking-wide ${
                  frictionScore >= 60 ? 'bg-red-500/15 text-red-300 border-red-500/30' :
                  frictionScore >= 25 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {frictionLabel}
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-5xl font-bold tabular-nums transition-all duration-700 ${frictionColor}`}>{frictionScore}</span>
                <span className="text-slate-500 text-base pb-1">/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${frictionBarColor}`} style={{ width: `${frictionScore}%` }} />
              </div>
              <p className="text-slate-600 text-[10px] mt-1.5 flex items-center gap-1">
                <TrendingDown size={9} />
                Lower is better — less customer interruption
              </p>
            </div>
          </div>

          {/* Simulated Transaction Card */}
          <div className={`bg-slate-800/60 border rounded-xl p-5 transition-all duration-500 ${
            status !== 'idle' && currentStage >= 2
              ? 'border-red-500/30 shadow-lg shadow-red-900/10'
              : 'border-slate-700/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Simulated Transaction</h3>
              {status !== 'idle' && currentStage >= 2 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 font-bold animate-pulse">
                  BLOCKED
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Transaction ID', value: SIMULATED_TX.id, mono: true },
                { label: 'Account', value: SIMULATED_TX.maskedAccount, mono: true },
                { label: 'Customer', value: SIMULATED_TX.customerId, mono: true },
                { label: 'Amount', value: `$${SIMULATED_TX.amount.toLocaleString()}`, highlight: true },
                { label: 'Merchant', value: SIMULATED_TX.merchant },
                { label: 'Category', value: SIMULATED_TX.category },
                { label: 'Country', value: SIMULATED_TX.country },
                { label: 'Device', value: SIMULATED_TX.device },
                { label: 'MFA Result', value: SIMULATED_TX.mfa, danger: true },
              ].map(f => (
                <div key={f.label} className="bg-slate-900/50 rounded-lg p-2.5">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-0.5">{f.label}</p>
                  <p className={`text-xs font-medium ${f.mono ? 'font-mono' : ''} ${f.highlight ? 'text-red-300 font-bold' : f.danger ? 'text-red-400' : 'text-slate-200'}`}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Event Feed */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
              <Activity size={15} className="text-slate-400" />
              <h3 className="text-white font-semibold">Live Event Feed</h3>
              {status === 'running' && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-red-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Recording
                </div>
              )}
            </div>

            <div ref={logPanelRef} className="max-h-72 overflow-y-auto divide-y divide-slate-700/20">
              {displayedEvents.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-slate-600">
                  <Activity size={28} className="opacity-30" />
                  <p className="text-sm">Start the simulation to see live events</p>
                </div>
              ) : (
                displayedEvents.map((e, i) => {
                  const Icon = e.event.icon;
                  const styles = EVENT_TYPE_STYLES[e.event.type];
                  return (
                    <div key={i} className={`flex items-start gap-3 px-5 py-3 border-l-2 ${
                      e.event.type === 'danger' ? 'border-red-500/50' :
                      e.event.type === 'warning' ? 'border-amber-500/50' :
                      e.event.type === 'success' ? 'border-emerald-500/50' :
                      'border-blue-500/50'
                    }`}>
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border ${styles}`}>
                        <Icon size={12} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 text-xs leading-relaxed">{e.event.message}</p>
                        {e.event.customerMessage && (
                          <div className="flex items-start gap-1.5 mt-1.5 bg-blue-500/5 border border-blue-500/15 rounded px-2 py-1.5">
                            <MessageCircle size={9} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-200/70 text-[10px] italic leading-relaxed">{e.event.customerMessage}</p>
                          </div>
                        )}
                        <p className="text-slate-600 text-[10px] mt-0.5">Stage {e.stageId} · {e.ts}</p>
                      </div>
                      {e.event.frictionDelta && (
                        <span className="text-amber-400 text-[10px] font-medium flex-shrink-0">+{e.event.frictionDelta} friction</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Preview */}
      {auditPreview.length > 0 && (
        <div className="bg-slate-800/60 border border-emerald-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
            <FileText size={15} className="text-emerald-400" />
            <h3 className="text-white font-semibold">Compliance Audit Trail (Live)</h3>
            <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Written to Supabase</span>
          </div>
          <div className="divide-y divide-slate-700/20">
            {auditPreview.map((entry, i) => (
              <div key={i} className="px-5 py-3.5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={11} />
                  {entry.ts}
                </div>
                <p className="text-slate-200 text-sm flex-1">{entry.action}</p>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                  {entry.compliance}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono capitalize">
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete State */}
      {status === 'complete' && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold mb-1">Simulation Complete</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                The full attack lifecycle was simulated and mitigated. Security controls were applied proportionally —
                Step-Up MFA was preferred over permanent lockout, keeping customer friction as low as possible while
                stopping the threat. All 4 compliance audit entries (including friction delta) have been written to
                the Supabase audit_logs table. Navigate to <strong className="text-white">Audit Logs</strong> to review the persisted records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-start gap-3">
        <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-slate-500 text-xs leading-relaxed">
          <strong className="text-slate-400">Safe Simulation Mode:</strong> This feature uses entirely synthetic data.
          No real Santander systems, customer accounts, or financial infrastructure are involved. All transaction
          IDs, account numbers, amounts, and behavioral signals are procedurally generated for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
