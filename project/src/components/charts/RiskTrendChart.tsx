import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { RiskTrendPoint } from '../../types';

interface Props {
  data: RiskTrendPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400 capitalize">{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function RiskTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#1e293b' }}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 10 }}
        />
        <Line
          type="monotone" dataKey="riskScore" name="Risk Score"
          stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
        />
        <Line
          type="monotone" dataKey="alerts" name="Alerts"
          stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
        />
        <Line
          type="monotone" dataKey="blocked" name="Blocked"
          stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
