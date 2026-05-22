import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { PeakHoursChart, OccupancyTrend, ZoneUtilization } from '../../components/analytics/Charts';
import { Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useParking } from '../../contexts/ParkingContext';

type Period = 'Daily' | 'Weekly' | 'Monthly';

export const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>('Weekly');
  const { zones, reservations, violations } = useParking();

  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const occupiedSlots = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length,
    0
  );
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100) || 0;
  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE').length;
  const openViolations = violations.filter((v) => v.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Statistics</h1>
          <p className="text-slate-400 mt-1">Parking usage trends and analytics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {(['Daily', 'Weekly', 'Monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}>
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => toast.success(`Exporting ${period} CSV...`)}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Live Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="text-center py-4">
          <p className="text-3xl font-bold text-indigo-400">{occupancyRate}%</p>
          <p className="text-slate-400 text-sm mt-1">Current Occupancy</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className="text-3xl font-bold text-emerald-400">{activeReservations}</p>
          <p className="text-slate-400 text-sm mt-1">Active Reservations</p>
        </GlassCard>
        <GlassCard className="text-center py-4">
          <p className={`text-3xl font-bold ${openViolations > 0 ? 'text-rose-400' : 'text-slate-400'}`}>{openViolations}</p>
          <p className="text-slate-400 text-sm mt-1">Open Violations</p>
        </GlassCard>
      </div>

      <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Predicted Peak Times</h3>
            <p className="text-slate-300 text-sm mb-3">Based on historical data, expect high demand during:</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold">Tomorrow 10am–2pm:</span>
                <span className="text-white">92% expected occupancy</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold">Friday 8am–12pm:</span>
                <span className="text-white">88% expected occupancy</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <PeakHoursChart period={period} />
        <OccupancyTrend period={period} />
      </div>

      <ZoneUtilization />
    </div>
  );
};
