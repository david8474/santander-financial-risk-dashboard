export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TransactionStatus = 'normal' | 'suspicious' | 'blocked' | 'review';
export type UserRole = 'analyst' | 'manager' | 'admin';
export type ActionType = 'step_up_mfa' | 'transaction_hold' | 'account_review' | 'session_revoke';
export type ActionStatus = 'pending' | 'completed' | 'resolved';
export type FrictionLevel = 'low' | 'medium' | 'high';
export type AdaptiveAuthAction = 'allow' | 'soft_verify' | 'step_up_mfa' | 'transaction_hold_review';

export interface Transaction {
  id: string;
  customerId: string;
  maskedAccount: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  country: string;
  city: string;
  device: string;
  deviceFingerprint: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  status: TransactionStatus;
  timestamp: string;
  ipAddress: string;
  mfaPassed: boolean;
  velocityFlag: boolean;
  geoAnomalyFlag: boolean;
  frictionScore: number;
  frictionLevel: FrictionLevel;
  frictionReasons: string[];
  recommendedAction: AdaptiveAuthAction;
  customerMessage: string;
  estimatedVerifySeconds: number;
}

export interface Alert {
  id: string;
  transactionId: string;
  customerId: string;
  maskedAccount: string;
  alertType: string;
  severity: RiskLevel;
  description: string;
  riskScore: number;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface SecurityAction {
  id: string;
  actionType: ActionType;
  accountId: string;
  transactionId?: string;
  reason: string;
  performedBy: string;
  status: ActionStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface ComplianceItem {
  id: string;
  framework: string;
  control: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  lastAudit: string;
  evidence: string;
}

export interface RiskTrendPoint {
  date: string;
  riskScore: number;
  transactions: number;
  alerts: number;
  blocked: number;
}

export interface FraudCategory {
  category: string;
  count: number;
  amount: number;
}

export interface DashboardStats {
  totalTransactions: number;
  overallRiskScore: number;
  highRiskAlerts: number;
  blockedTransactions: number;
  flaggedTransactions: number;
  complianceScore: number;
  transactionVolume24h: number;
  fraudPreventedAmount: number;
}

export interface CustomerTrustStats {
  customersProtected: number;
  frictionAvoided: number;
  avgVerifySeconds: number;
  falsePositiveRate: number;
  secureApprovalsCompleted: number;
  lowFrictionRate: number;
}
