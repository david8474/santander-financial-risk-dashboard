import {
  LayoutDashboard, CreditCard, Brain, Bell, ShieldCheck,
  ClipboardList, Lock, ChevronRight, Shield, Zap, Heart,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['analyst', 'manager', 'admin'] },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, roles: ['analyst', 'manager', 'admin'] },
  { id: 'risk-engine', label: 'Risk Engine', icon: Brain, roles: ['analyst', 'manager', 'admin'] },
  { id: 'alerts', label: 'Alerts', icon: Bell, roles: ['analyst', 'manager', 'admin'] },
  { id: 'customer-trust', label: 'Customer Trust', icon: Heart, roles: ['analyst', 'manager', 'admin'] },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck, roles: ['manager', 'admin'] },
  { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList, roles: ['manager', 'admin'] },
  { id: 'security-controls', label: 'Security Controls', icon: Lock, roles: ['admin'] },
  { id: 'attack-simulation', label: 'Attack Simulation', icon: Zap, roles: ['analyst', 'manager', 'admin'] },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activePage, onNavigate, role, collapsed, onToggle }: SidebarProps) {
  const visible = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside
      className={`bg-slate-900 min-h-screen flex flex-col border-r border-slate-800 transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo + toggle */}
      <div className={`py-5 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Santander</p>
              <p className="text-slate-400 text-xs">Risk Intelligence</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors flex-shrink-0 ${collapsed ? 'mt-3' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {visible.map(item => {
          const active = activePage === item.id;
          const isCustomerTrust = item.id === 'customer-trust';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
              } ${
                active
                  ? isCustomerTrust
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={17} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {active && <ChevronRight size={14} className="opacity-70" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg px-3 py-2.5">
            <p className="text-slate-400 text-xs mb-1">Active Role</p>
            <p className="text-white text-sm font-semibold capitalize">{role}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">System Online</span>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="px-2 py-4 border-t border-slate-800 flex justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>
      )}
    </aside>
  );
}
