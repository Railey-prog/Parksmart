import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import {
  PeakHoursChart,
  OccupancyTrend,
  ZoneUtilization } from
'../../components/analytics/Charts';
import { Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
export const AdminAnalytics = () => {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Analytics & Insights
          </h1>
          <p className="text-slate-400 mt-1">
            Parking usage trends and predictions
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="glass-input px-4">
            
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => toast.success('Exporting CSV...')}>
            
            Export CSV
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => toast.success('Generating PDF...')}>
            
            Export PDF
          </Button>
        </div>
      </div>

      <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Predicted Peak Times
            </h3>
            <p className="text-slate-300 text-sm mb-3">
              Based on historical data and ML predictions, expect high demand
              during these periods:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-amber-400 font-semibold">
                  Tomorrow 10am-2pm:
                </span>
                <span className="text-white">92% expected occupancy</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-amber-400 font-semibold">
                  Friday 8am-12pm:
                </span>
                <span className="text-white">88% expected occupancy</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="relative">
          <h3 className="absolute top-4 right-6 text-sm font-medium text-slate-400 z-10">
            {period} View
          </h3>
          <PeakHoursChart />
        </div>
        <div className="relative">
          <h3 className="absolute top-4 right-6 text-sm font-medium text-slate-400 z-10">
            {period} View
          </h3>
          <OccupancyTrend />
        </div>
      </div>

      <ZoneUtilization />
    </div>);

};