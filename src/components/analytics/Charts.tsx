import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area } from
'recharts';
import { GlassCard } from '../common/GlassCard';
import { analyticsData } from '../../data/mockData';
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        <p className="text-white font-bold">
          {payload[0].value}%{' '}
          <span className="text-slate-400 text-xs font-normal ml-1">
            Occupancy
          </span>
        </p>
      </div>);

  }
  return null;
};
export const PeakHoursChart = () => {
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Peak Hours Demand</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData.hourlyDemand}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0
            }}>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false} />
            
            <XAxis
              dataKey="time"
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <YAxis
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: '#ffffff05'
              }} />
            
            <Bar dataKey="demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>);

};
export const OccupancyTrend = () => {
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Weekly Occupancy Trend</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={analyticsData.weeklyTrend}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0
            }}>
            
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false} />
            
            <XAxis
              dataKey="day"
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <YAxis
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorOccupancy)" />
            
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>);

};
export const ZoneUtilization = () => {
  return (
    <GlassCard className="h-80 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Zone Utilization</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData.zoneUtilization}
            layout="vertical"
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0
            }}>
            
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              horizontal={false} />
            
            <XAxis
              type="number"
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false} />
            
            <YAxis
              dataKey="name"
              type="category"
              stroke="#ffffff50"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60} />
            
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: '#ffffff05'
              }} />
            
            <Bar
              dataKey="value"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
              barSize={24} />
            
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>);

};