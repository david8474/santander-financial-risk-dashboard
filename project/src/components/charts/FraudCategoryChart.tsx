import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { FraudCategory } from '../../types';

interface Props {
  data: FraudCategory[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-400">Incidents:</span>
        <span className="text-white font-medium">{payload[0]?.value}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Amount:</span>
        <span className="text-red-300 font-medium">${payload[0]?.payload?.amount?.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function FraudCategoryChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: '#1e293b' }}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
