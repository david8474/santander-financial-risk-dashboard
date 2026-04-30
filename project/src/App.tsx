import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import RiskEngine from './pages/RiskEngine';
import Alerts from './pages/Alerts';
import Compliance from './pages/Compliance';
import AuditLogs from './pages/AuditLogs';
import SecurityControls from './pages/SecurityControls';
import AttackSimulation from './pages/AttackSimulation';
import CustomerTrust from './pages/CustomerTrust';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  transactions: 'Real-Time Transaction Monitoring',
  'risk-engine': 'AI Anomaly Detection Engine',
  alerts: 'Alert Management',
  'customer-trust': 'Customer Trust & Friction',
  compliance: 'Compliance Panel',
  'audit-logs': 'Audit Logs',
  'security-controls': 'Security Response Center',
  'attack-simulation': 'Live Attack Simulation',
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { role, setRole, alerts } = useApp();

  const openAlerts = alerts.filter(a => a.status === 'open').length;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'risk-engine': return <RiskEngine />;
      case 'alerts': return <Alerts />;
      case 'customer-trust': return <CustomerTrust />;
      case 'compliance': return <Compliance />;
      case 'audit-logs': return <AuditLogs />;
      case 'security-controls': return <SecurityControls />;
      case 'attack-simulation': return <AttackSimulation />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activePage={activePage} onNavigate={setActivePage} role={role} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          role={role}
          setRole={setRole}
          alertCount={openAlerts}
          title={PAGE_TITLES[activePage] || 'Dashboard'}
        />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
