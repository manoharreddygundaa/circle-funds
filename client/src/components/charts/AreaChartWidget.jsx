import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * AreaChart — used on dashboards to show trends over time.
 *
 * Props:
 *  data       — array of objects, e.g. [{ month: 'Jan', amount: 5000 }]
 *  dataKey    — the field to plot, e.g. 'amount'
 *  xKey       — the x-axis field, e.g. 'month'
 *  color      — hex or tailwind-like hex string
 *  formatter  — optional value formatter for tooltip
 */
export const AreaChartWidget = ({
  data = [],
  dataKey = 'value',
  xKey = 'name',
  color = '#3b82f6',
  formatter,
  height = 200,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <ReAreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.15} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis
        dataKey={xKey}
        tick={{ fontSize: 11, fill: '#94a3b8' }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11, fill: '#94a3b8' }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip content={<CustomTooltip formatter={formatter} />} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2.5}
        fill={`url(#grad-${dataKey})`}
        dot={false}
        activeDot={{ r: 5, strokeWidth: 0 }}
      />
    </ReAreaChart>
  </ResponsiveContainer>
);
