import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { PeakHoursChart, OccupancyTrend, ZoneUtilization } from '../../components/analytics/Charts';
import { Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useParking } from '../../contexts/ParkingContext';

type Period = 'Daily' | 'Weekly' | 'Monthly';

const HOURS = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];
const HOUR_VALUES = [6, 8, 10, 12, 14, 16, 18, 20];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const AdminAnalytics = () => {
  const [period, setPeriod] = useState<Period>('Weekly');
  const { zones, reservations, violations } = useParking();

  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const occupiedSlots = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length,
    0
  );
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE').length;
  const openViolations = violations.filter((v) => v.status === 'OPEN').length;
  const totalReservations = reservations.length;
  const resolvedViolations = violations.filter((v) => v.status === 'RESOLVED').length;

  const dailyData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    return HOURS.map((label, i) => {
      const hourStart = HOUR_VALUES[i];
      const hourEnd = hourStart + 2;
      const count = reservations.filter((r) => {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);
        const rHourStart = start.getHours();
        const rHourEnd = end.getHours();
        const isToday = start >= today && start < tomorrow;
        return isToday && rHourStart < hourEnd && rHourEnd > hourStart;
      }).length;
      return { label, value: count };
    });
  }, [reservations]);

  const weeklyData = useMemo(() => {
    const counts = new Array(7).fill(0);
    reservations.forEach((r) => {
      const d = new Date(r.startTime);
      const day = (d.getDay() + 6) % 7;
      counts[day]++;
    });
    const max = Math.max(...counts, 1);
    return DAYS.map((label, i) => ({
      label,
      value: Math.round((counts[i] / max) * 100)
    }));
  }, [reservations]);

  const monthlyData = useMemo(() => {
    const counts = new Array(12).fill(0);
    reservations.forEach((r) => {
      const d = new Date(r.startTime);
      counts[d.getMonth()]++;
    });
    const max = Math.max(...counts, 1);
    return MONTHS.map((label, i) => ({
      label,
      value: Math.round((counts[i] / max) * 100)
    }));
  }, [reservations]);

  const zoneData = useMemo(() => {
    return zones.map((z) => {
      const total = z.slots.length;
      const used = z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
      const pct = total > 0 ? Math.round((used / total) * 100) : 0;
      const shortName = z.name.split(' ')[0];
      return { name: shortName, value: pct };
    });
  }, [zones]);

  const chartData = period === 'Daily' ? dailyData : period === 'Monthly' ? monthlyData : weeklyData;

  const peakDay = useMemo(() => {
    const counts = new Array(7).fill(0);
    reservations.forEach((r) => {
      const d = new Date(r.startTime);
      counts[(d.getDay() + 6) % 7]++;
    });
    const maxIdx = counts.indexOf(Math.max(...counts));
    return DAYS[maxIdx] ?? 'N/A';
  }, [reservations]);

  const peakHour = useMemo(() => {
    const counts = new Array(HOURS.length).fill(0);
    reservations.forEach((r) => {
      const h = new Date(r.startTime).getHours();
      HOUR_VALUES.forEach((hv, i) => {
        if (h >= hv && h < hv + 2) counts[i]++;
      });
    });
    const maxIdx = counts.indexOf(Math.max(...counts));
    return HOURS[maxIdx] ?? 'N/A';
  }, [reservations]);

  const handleExport = () => {
    const rows = [['Period', 'Label', 'Value']];
    chartData.forEach((d) => rows.push([period, d.label, String(d.value)]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parksmart-${period.toLowerCase()}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${period} report exported`);
  };

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
            onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        <GlassCard className="text-center py-4">
          <p className="text-3xl font-bold text-amber-400">{totalReservations}</p>
          <p className="text-slate-400 text-sm mt-1">Total Reservations</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-white">{totalSlots}</p>
          <p className="text-slate-400 text-xs mt-1">Total Slots</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-white">{resolvedViolations}</p>
          <p className="text-slate-400 text-xs mt-1">Violations Resolved</p>
        </GlassCard>
        <GlassCard className="text-center py-3">
          <p className="text-2xl font-bold text-white">{zones.length}</p>
          <p className="text-slate-400 text-xs mt-1">Parking Zones</p>
        </GlassCard>
      </div>

      {totalReservations > 0 && (
        <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Peak Activity Patterns</h3>
              <p className="text-slate-300 text-sm mb-3">Based on actual reservation history:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-semibold">Busiest Day:</span>
                  <span className="text-white">{peakDay} — highest reservation volume</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-semibold">Peak Hour:</span>
                  <span className="text-white">{peakHour} — most frequent booking start time</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <PeakHoursChart period={period} data={chartData} />
        <OccupancyTrend period={period} data={chartData} />
      </div>

      <ZoneUtilization data={zoneData} />
    </div>
  );
};
