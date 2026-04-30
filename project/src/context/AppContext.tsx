import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Transaction, Alert, UserRole, AuditLog } from '../types';
import {
  generateTransactions,
  generateAlerts,
  generateDashboardStats,
  generateRiskTrend,
  generateFraudCategories,
  generateComplianceData,
  generateCustomerTrustStats,
} from '../lib/syntheticData';
import { supabase } from '../lib/supabase';

interface AppContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
  transactions: Transaction[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  dashboardStats: ReturnType<typeof generateDashboardStats>;
  riskTrend: ReturnType<typeof generateRiskTrend>;
  fraudCategories: ReturnType<typeof generateFraudCategories>;
  complianceData: ReturnType<typeof generateComplianceData>;
  customerTrustStats: ReturnType<typeof generateCustomerTrustStats>;
  refreshAuditLogs: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const TXS = generateTransactions(120);
const ALERTS = generateAlerts(TXS);
const STATS = generateDashboardStats(TXS);
const TREND = generateRiskTrend();
const FRAUD_CATS = generateFraudCategories();
const COMPLIANCE = generateComplianceData();
const TRUST_STATS = generateCustomerTrustStats(TXS);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('analyst');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  async function refreshAuditLogs() {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      setAuditLogs(
        data.map(row => ({
          id: row.id,
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id,
          performedBy: row.performed_by,
          details: row.details ?? {},
          ipAddress: row.ip_address,
          createdAt: row.created_at,
        }))
      );
    }
  }

  useEffect(() => {
    refreshAuditLogs();
  }, []);

  return (
    <AppContext.Provider value={{
      role, setRole,
      transactions: TXS,
      alerts: ALERTS,
      auditLogs,
      dashboardStats: STATS,
      riskTrend: TREND,
      fraudCategories: FRAUD_CATS,
      complianceData: COMPLIANCE,
      customerTrustStats: TRUST_STATS,
      refreshAuditLogs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
