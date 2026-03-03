'use client';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { DemoChart as ChartType } from '@/lib/demo-registry';

const DEFAULT_COLORS = ['#1B2A4A', '#F5920B', '#2A9D8F', '#DC2626', '#059669', '#6366F1', '#EC4899', '#8B5CF6'];

interface DemoChartProps {
  chart: ChartType;
  height?: number;
}

export default function DemoChartComponent({ chart, height = 300 }: DemoChartProps) {
  const colors = chart.colors || DEFAULT_COLORS;
  const xKey = chart.xKey || 'name';

  return (
    <div className="rounded-xl border bg-white p-5" style={{ borderColor: '#E5E7EB' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: '#1B2A4A' }}>{chart.title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );

  function renderChart() {
    switch (chart.type) {
      case 'bar':
      case 'grouped-bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chart.dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );

      case 'stacked-bar':
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chart.dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} stackId="a" fill={colors[i % colors.length]} />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chart.dataKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chart.dataKeys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} strokeWidth={2} />
            ))}
          </AreaChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={chart.data}
              dataKey={chart.dataKeys[0]}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={chart.type === 'donut' ? 60 : 0}
              paddingAngle={2}
              label={({ name, percent }: { name: string; percent: number }) =>
                name + ' ' + (percent * 100).toFixed(0) + '%'
              }
              labelLine={{ stroke: '#9CA3AF' }}
            >
              {chart.data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
          </PieChart>
        );

      default:
        return (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip />
            {chart.dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  }
}
