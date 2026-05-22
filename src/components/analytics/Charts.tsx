import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { GlassCard } from '../common/GlassCard';

type Period = 'Daily' | 'Weekly' | 'Monthly';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ZoneDataPoint {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        <p className="text-white font-bold">
          {payload[0].value}
          <span className="text-slate-400 text-xs font-normal ml-1">
            {payload[0].dataKey === 'demand' ? 'vehicles' : '% occupancy'}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const PeakHoursChart = ({ period = 'Weekly', data }: { period?: Period; data: ChartDataPoint[] }) => {
  const title =
    period === 'Daily' ? 'Peak Hours Demand (Today)' :
    period === 'Monthly' ? 'Monthly Demand Overview' :
    'Weekly Demand Overview';

  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="label" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export const OccupancyTrend = ({ period = 'Weekly', data }: { period?: Period; data: ChartDataPoint[] }) => {
  const title =
    period === 'Daily' ? 'Occupancy Trend (Today)' :
    period === 'Monthly' ? 'Monthly Occupancy Trend' :
    'Weekly Occupancy Trend';

  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="label" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOccupancy)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export const ZoneUtilization = ({ data }: { data: ZoneDataPoint[] }) => {
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Zone Utilization</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
            <XAxis type="number" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
