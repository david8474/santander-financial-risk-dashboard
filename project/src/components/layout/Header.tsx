import { Bell, RefreshCw, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '../../types';

interface HeaderProps {
  role: UserRole;
  setRole: (r: UserRole) => void;
  alertCount: number;
  title: string;
}

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  analyst: { label: 'Analyst', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  manager: { label: 'Manager', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  admin: { label: 'Admin', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export default function Header({ role, setRole, alertCount, title }: HeaderProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const now = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  function handleRefresh() {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1000);
  }

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
        <p className="text-slate-500 text-xs">{now}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={15} className={spinning ? 'animate-spin' : ''} />
        </button>

        <div className="relative flex items-center">
          <button className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
            <Bell size={15} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setRoleOpen(o => !o)}
            className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white text-xs font-medium leading-tight">Demo User</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ROLE_LABELS[role].color}`}>
                {ROLE_LABELS[role].label}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {roleOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700">
                <p className="text-slate-400 text-xs">Switch Role</p>
              </div>
              {(['analyst', 'manager', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setRoleOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                    role === r ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ROLE_LABELS[r].color}`}>
                    {ROLE_LABELS[r].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
