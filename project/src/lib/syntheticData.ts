import type {
  Transaction,
  Alert,
  ComplianceItem,
  RiskTrendPoint,
  FraudCategory,
  DashboardStats,
  RiskLevel,
  TransactionStatus,
  FrictionLevel,
  AdaptiveAuthAction,
  CustomerTrustStats,
} from '../types';

const MERCHANTS = [
  { name: 'Amazon', category: 'E-commerce' },
  { name: 'Walmart', category: 'Retail' },
  { name: 'Shell Gas', category: 'Fuel' },
  { name: 'Netflix', category: 'Subscription' },
  { name: 'Uber', category: 'Transport' },
  { name: 'Binance', category: 'Crypto Exchange' },
  { name: 'Coinbase', category: 'Crypto Exchange' },
  { name: 'Western Union', category: 'Wire Transfer' },
  { name: 'Transferwise', category: 'Wire Transfer' },
  { name: 'Target', category: 'Retail' },
  { name: 'Best Buy', category: 'Electronics' },
  { name: 'Steam', category: 'Gaming' },
  { name: 'Apple Store', category: 'Electronics' },
  { name: 'PayPal', category: 'Payment Processor' },
  { name: 'Venmo', category: 'P2P Transfer' },
  { name: 'Casino Royal', category: 'Gambling' },
  { name: 'Luxury Jewels', category: 'Jewelry' },
  { name: 'FX Trade Pro', category: 'Forex' },
];

const COUNTRIES = ['US', 'UK', 'DE', 'FR', 'ES', 'RU', 'CN', 'NG', 'BR', 'MX', 'UA', 'TR'];
const HIGH_RISK_COUNTRIES = ['RU', 'NG', 'UA', 'TR'];
const CITIES: Record<string, string[]> = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  UK: ['London', 'Manchester', 'Birmingham'],
  DE: ['Berlin', 'Munich', 'Hamburg'],
  FR: ['Paris', 'Lyon', 'Marseille'],
  ES: ['Madrid', 'Barcelona', 'Valencia'],
  RU: ['Moscow', 'St Petersburg'],
  CN: ['Beijing', 'Shanghai', 'Shenzhen'],
  NG: ['Lagos', 'Abuja'],
  BR: ['São Paulo', 'Rio de Janeiro'],
  MX: ['Mexico City', 'Guadalajara'],
  UA: ['Kyiv', 'Kharkiv'],
  TR: ['Istanbul', 'Ankara'],
};

const DEVICES = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro', 'Windows PC', 'iPad Air', 'Unknown Device', 'Tor Browser'];
const RISK_REASONS = [
  'Unusual transaction amount',
  'Geographic anomaly detected',
  'Multiple failed MFA attempts',
  'Rapid transaction velocity',
  'Known high-risk merchant category',
  'New device fingerprint',
  'Unusual login time (3:00 AM)',
  'IP geolocation mismatch',
  'Account dormancy followed by high activity',
  'Transaction pattern deviation',
  'High-risk country transfer',
  'Credential stuffing pattern detected',
];

// Customer-friendly messages mapped to recommended actions
const CUSTOMER_MESSAGES: Record<AdaptiveAuthAction, string> = {
  allow: 'Your transaction looks great. Everything is within your normal activity range.',
  soft_verify: 'We noticed a small change in your activity. A quick confirmation keeps your account safe — this takes less than 15 seconds.',
  step_up_mfa: 'We noticed something unusual and want to confirm it\'s you. This quick verification usually takes less than 30 seconds and keeps your account protected.',
  transaction_hold_review: 'For your protection, we\'re taking a closer look at this transaction. Our team will review it and reach out within 2 hours. Your account remains fully accessible.',
};

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maskAccount(num: string): string {
  return `****-****-****-${num.slice(-4)}`;
}

function genAccountNum(): string {
  return Array.from({ length: 16 }, () => rnd(0, 9)).join('');
}

function genCustomerId(): string {
  return `CUS-${rnd(100000, 999999)}`;
}

function genTransactionId(): string {
  return `TXN-${Date.now()}-${rnd(1000, 9999)}`;
}

function computeRiskScore(tx: Partial<Transaction>): { score: number; reasons: string[]; level: RiskLevel; status: TransactionStatus } {
  let score = 0;
  const reasons: string[] = [];

  if (tx.amount && tx.amount > 10000) { score += 30; reasons.push('Unusual transaction amount'); }
  else if (tx.amount && tx.amount > 5000) { score += 15; reasons.push('Large transaction amount'); }

  if (tx.country && HIGH_RISK_COUNTRIES.includes(tx.country)) { score += 25; reasons.push('High-risk country transfer'); }

  if (tx.mfaPassed === false) { score += 20; reasons.push('Multiple failed MFA attempts'); }

  if (tx.velocityFlag) { score += 20; reasons.push('Rapid transaction velocity'); }

  if (tx.geoAnomalyFlag) { score += 15; reasons.push('Geographic anomaly detected'); }

  if (tx.device === 'Unknown Device' || tx.device === 'Tor Browser') { score += 20; reasons.push('Suspicious device detected'); }

  if (tx.merchantCategory === 'Crypto Exchange' || tx.merchantCategory === 'Gambling') {
    score += 15; reasons.push('Known high-risk merchant category');
  }

  if (tx.merchantCategory === 'Wire Transfer') { score += 10; reasons.push('Wire transfer to external entity'); }

  const noise = rnd(-5, 10);
  score = Math.min(100, Math.max(0, score + noise));

  let level: RiskLevel = 'low';
  let status: TransactionStatus = 'normal';

  if (score >= 80) { level = 'critical'; status = 'blocked'; }
  else if (score >= 60) { level = 'high'; status = 'suspicious'; }
  else if (score >= 40) { level = 'medium'; status = 'review'; }
  else { level = 'low'; status = 'normal'; }

  return { score, reasons, level, status };
}

function computeFriction(
  riskScore: number,
  riskReasons: string[],
  mfaPassed: boolean,
  geoAnomalyFlag: boolean,
  velocityFlag: boolean
): { frictionScore: number; frictionLevel: FrictionLevel; frictionReasons: string[]; recommendedAction: AdaptiveAuthAction; customerMessage: string; estimatedVerifySeconds: number } {
  let frictionScore = 0;
  const frictionReasons: string[] = [];

  // Friction only triggers when security signals are genuinely concerning
  if (riskScore >= 80) { frictionScore += 40; frictionReasons.push('Critical risk level requires identity confirmation'); }
  else if (riskScore >= 60) { frictionScore += 25; frictionReasons.push('Elevated risk signals detected'); }
  else if (riskScore >= 40) { frictionScore += 10; frictionReasons.push('Mild anomaly pattern observed'); }

  if (!mfaPassed) { frictionScore += 20; frictionReasons.push('Recent MFA challenge was not completed'); }
  if (geoAnomalyFlag) { frictionScore += 15; frictionReasons.push('Location differs from your usual pattern'); }
  if (velocityFlag) { frictionScore += 10; frictionReasons.push('Multiple transactions in a short window'); }

  if (riskReasons.includes('Suspicious device detected')) {
    frictionScore += 15; frictionReasons.push('Unrecognized device accessing account');
  }

  frictionScore = Math.min(100, frictionScore);

  let frictionLevel: FrictionLevel = 'low';
  let recommendedAction: AdaptiveAuthAction = 'allow';
  let estimatedVerifySeconds = 0;

  if (frictionScore >= 60) {
    frictionLevel = 'high';
    recommendedAction = riskScore >= 80 ? 'transaction_hold_review' : 'step_up_mfa';
    estimatedVerifySeconds = riskScore >= 80 ? 120 : 30;
  } else if (frictionScore >= 25) {
    frictionLevel = 'medium';
    recommendedAction = 'soft_verify';
    estimatedVerifySeconds = 15;
  } else {
    frictionLevel = 'low';
    recommendedAction = 'allow';
    estimatedVerifySeconds = 0;
  }

  return {
    frictionScore,
    frictionLevel,
    frictionReasons: frictionReasons.length > 0 ? frictionReasons : ['Activity within normal range'],
    recommendedAction,
    customerMessage: CUSTOMER_MESSAGES[recommendedAction],
    estimatedVerifySeconds,
  };
}

export function generateTransactions(count = 100): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const merchant = pick(MERCHANTS);
    const country = pick(COUNTRIES);
    const cities = CITIES[country] || ['Unknown'];
    const amount = pick([
      rnd(10, 500),
      rnd(500, 5000),
      rnd(5000, 50000),
    ]);
    const mfaPassed = Math.random() > 0.15;
    const velocityFlag = Math.random() > 0.85;
    const geoAnomalyFlag = Math.random() > 0.8;
    const device = pick(DEVICES);
    const accountNum = genAccountNum();
    const timestamp = new Date(now.getTime() - rnd(0, 72 * 60 * 60 * 1000)).toISOString();

    const partial: Partial<Transaction> = {
      amount, country, mfaPassed, velocityFlag, geoAnomalyFlag, device,
      merchantCategory: merchant.category,
    };

    const { score, reasons, level, status } = computeRiskScore(partial);
    const friction = computeFriction(score, reasons, mfaPassed, geoAnomalyFlag, velocityFlag);

    transactions.push({
      id: genTransactionId(),
      customerId: genCustomerId(),
      maskedAccount: maskAccount(accountNum),
      amount,
      currency: 'USD',
      merchant: merchant.name,
      merchantCategory: merchant.category,
      country,
      city: pick(cities),
      device,
      deviceFingerprint: `FP-${rnd(10000, 99999)}`,
      riskScore: score,
      riskLevel: level,
      riskReasons: reasons.length > 0 ? reasons : ['Transaction within normal parameters'],
      status,
      timestamp,
      ipAddress: `${rnd(1, 255)}.${rnd(1, 255)}.***.***.`,
      mfaPassed,
      velocityFlag,
      geoAnomalyFlag,
      ...friction,
    });
  }

  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateAlerts(transactions: Transaction[]): Alert[] {
  const alertTypes = [
    'Account Takeover Attempt',
    'Unusual Geographic Pattern',
    'Rapid Transaction Velocity',
    'High-Value Crypto Transfer',
    'MFA Bypass Attempt',
    'Credential Stuffing Detected',
    'Wire Transfer Anomaly',
    'Device Fingerprint Mismatch',
  ];

  return transactions
    .filter(tx => tx.riskLevel === 'high' || tx.riskLevel === 'critical')
    .slice(0, 40)
    .map(tx => ({
      id: `ALT-${rnd(10000, 99999)}`,
      transactionId: tx.id,
      customerId: tx.customerId,
      maskedAccount: tx.maskedAccount,
      alertType: pick(alertTypes),
      severity: tx.riskLevel,
      description: tx.riskReasons[0] || 'Anomalous behavior detected',
      riskScore: tx.riskScore,
      timestamp: tx.timestamp,
      status: pick(['open', 'investigating', 'resolved', 'false_positive'] as const),
      assignedTo: pick(['analyst', 'manager', 'admin']),
    }));
}

export function generateRiskTrend(): RiskTrendPoint[] {
  const points: RiskTrendPoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const base = 35 + Math.sin(i / 5) * 15;
    points.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      riskScore: Math.round(base + rnd(-8, 8)),
      transactions: rnd(800, 2400),
      alerts: rnd(5, 45),
      blocked: rnd(2, 20),
    });
  }

  return points;
}

export function generateFraudCategories(): FraudCategory[] {
  return [
    { category: 'Account Takeover', count: rnd(30, 80), amount: rnd(150000, 500000) },
    { category: 'Card Fraud', count: rnd(50, 120), amount: rnd(80000, 300000) },
    { category: 'Wire Fraud', count: rnd(10, 40), amount: rnd(500000, 2000000) },
    { category: 'Phishing', count: rnd(20, 60), amount: rnd(50000, 200000) },
    { category: 'Crypto Scam', count: rnd(15, 50), amount: rnd(100000, 800000) },
    { category: 'Insider Threat', count: rnd(5, 20), amount: rnd(200000, 1000000) },
  ];
}

export function generateDashboardStats(transactions: Transaction[]): DashboardStats {
  const blocked = transactions.filter(t => t.status === 'blocked').length;
  const flagged = transactions.filter(t => t.status === 'suspicious' || t.status === 'review').length;
  const highRisk = transactions.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').length;
  const avgRisk = transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length;
  const blockedAmount = transactions.filter(t => t.status === 'blocked').reduce((sum, t) => sum + t.amount, 0);

  return {
    totalTransactions: transactions.length,
    overallRiskScore: Math.round(avgRisk),
    highRiskAlerts: highRisk,
    blockedTransactions: blocked,
    flaggedTransactions: flagged,
    complianceScore: rnd(88, 97),
    transactionVolume24h: transactions.filter(t => {
      const ts = new Date(t.timestamp);
      return Date.now() - ts.getTime() < 24 * 60 * 60 * 1000;
    }).reduce((sum, t) => sum + t.amount, 0),
    fraudPreventedAmount: blockedAmount,
  };
}

export function generateCustomerTrustStats(transactions: Transaction[]): CustomerTrustStats {
  const lowFriction = transactions.filter(t => t.frictionLevel === 'low').length;
  const mediumFriction = transactions.filter(t => t.frictionLevel === 'medium').length;
  const highFriction = transactions.filter(t => t.frictionLevel === 'high').length;
  const softVerify = transactions.filter(t => t.recommendedAction === 'soft_verify').length;
  const allowed = transactions.filter(t => t.recommendedAction === 'allow').length;
  const stepUpMfa = transactions.filter(t => t.recommendedAction === 'step_up_mfa').length;

  const avgVerify = transactions
    .filter(t => t.estimatedVerifySeconds > 0)
    .reduce((sum, t) => sum + t.estimatedVerifySeconds, 0) /
    Math.max(1, transactions.filter(t => t.estimatedVerifySeconds > 0).length);

  return {
    customersProtected: transactions.filter(t => t.frictionLevel !== 'low').length,
    frictionAvoided: lowFriction + Math.floor(mediumFriction * 0.6),
    avgVerifySeconds: Math.round(avgVerify),
    falsePositiveRate: Math.round((softVerify / Math.max(1, highFriction + softVerify)) * 100 * 0.12),
    secureApprovalsCompleted: allowed + stepUpMfa,
    lowFrictionRate: Math.round((lowFriction / transactions.length) * 100),
  };
}

export function generateComplianceData(): ComplianceItem[] {
  return [
    {
      id: 'PCI-1', framework: 'PCI-DSS', control: 'Requirement 3',
      description: 'Protect stored cardholder data with encryption and tokenization',
      status: 'compliant', lastAudit: '2026-03-15',
      evidence: 'AES-256 encryption active; card data tokenized via vault',
    },
    {
      id: 'PCI-2', framework: 'PCI-DSS', control: 'Requirement 6',
      description: 'Develop and maintain secure systems and software',
      status: 'compliant', lastAudit: '2026-03-15',
      evidence: 'SAST/DAST scans passing; CVE patching SLA met',
    },
    {
      id: 'PCI-3', framework: 'PCI-DSS', control: 'Requirement 10',
      description: 'Log and monitor all access to network resources',
      status: 'partial', lastAudit: '2026-04-01',
      evidence: 'Audit logs active; log retention policy under review',
    },
    {
      id: 'GDPR-1', framework: 'GDPR', control: 'Article 25',
      description: 'Data protection by design and by default',
      status: 'compliant', lastAudit: '2026-02-20',
      evidence: 'PII minimization applied; only last 4 digits shown',
    },
    {
      id: 'GDPR-2', framework: 'GDPR', control: 'Article 32',
      description: 'Security of processing — encryption and pseudonymization',
      status: 'compliant', lastAudit: '2026-02-20',
      evidence: 'TLS 1.3 in transit; fields pseudonymized at rest',
    },
    {
      id: 'GDPR-3', framework: 'GDPR', control: 'Article 17',
      description: 'Right to erasure — data deletion upon request',
      status: 'partial', lastAudit: '2026-04-10',
      evidence: 'Deletion workflow implemented; audit trail exclusion pending',
    },
    {
      id: 'SOX-1', framework: 'SOX', control: 'Section 302',
      description: 'Corporate responsibility for financial reports',
      status: 'compliant', lastAudit: '2026-01-30',
      evidence: 'Change tracking active; immutable audit log maintained',
    },
    {
      id: 'SOX-2', framework: 'SOX', control: 'Section 404',
      description: 'Management assessment of internal controls',
      status: 'compliant', lastAudit: '2026-01-30',
      evidence: 'ITGC controls tested quarterly; no exceptions noted',
    },
    {
      id: 'ISO-1', framework: 'ISO 27001', control: 'A.9.1',
      description: 'Access control policy and user access management',
      status: 'compliant', lastAudit: '2026-03-01',
      evidence: 'RBAC enforced; privileged access reviewed monthly',
    },
    {
      id: 'ISO-2', framework: 'ISO 27001', control: 'A.12.4',
      description: 'Logging and monitoring of system events',
      status: 'compliant', lastAudit: '2026-03-01',
      evidence: 'SIEM alerts active; anomaly detection engine running',
    },
    {
      id: 'ISO-3', framework: 'ISO 27001', control: 'A.16.1',
      description: 'Management of information security incidents',
      status: 'partial', lastAudit: '2026-04-15',
      evidence: 'Incident response plan active; tabletop exercise scheduled',
    },
  ];
}

// Re-export RISK_REASONS so it can be used elsewhere if needed
export { RISK_REASONS };
