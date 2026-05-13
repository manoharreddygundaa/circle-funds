import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  low:       '#22c55e',
  medium:    '#f59e0b',
  high:      '#ef4444',
  pending:   '#f59e0b',
  approved:  '#3b82f6',
  active:    '#22c55e',
  completed: '#8b5cf6',
  rejected:  '#ef4444',
  default:   '#6b7280',
};

/**
 * PieChartWidget — used for risk distribution and loan status breakdown.
 *
 * data format: [{ _id: 'low', count: 12 }, { _id: 'medium', count: 8 }]
 * The _id field is used as label and for colour lookup.
 */
export const PieChartWidget = ({ data = [], nameKey = '_id', valueKey = 'count', height = 220 }) => {
  const formatted = data.map((d) => ({
    name: d[nameKey],
    value: d[valueKey],
    color: COLORS[d[nameKey]] || COLORS.default,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {formatted.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name?.charAt(0).toUpperCase() + name?.slice(1)]}
          contentStyle={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs capitalize text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
