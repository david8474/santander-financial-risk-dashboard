import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RiskTrendPoint } from '../../types';

interface Props {
  data: RiskTrendPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Volume:</span>
        <span className="text-blue-300 font-medium">{payload[0]?.value?.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function TransactionVolumeChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
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
        <Area
          type="monotone" dataKey="transactions"
          stroke="#3b82f6" strokeWidth={2}
          fill="url(#volGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
