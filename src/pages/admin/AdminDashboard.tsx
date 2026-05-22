import React, { useEffect, useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { StatCard } from '../../components/common/StatCard';
import { GlassCard } from '../../components/common/GlassCard';
import { PeakHoursChart, OccupancyTrend, ZoneUtilization } from '../../components/analytics/Charts';
import { Users, Car, Calendar, ShieldAlert } from 'lucide-react';

export const AdminDashboard = () => {
  const { users, zones, reservations, violations, logs } = useParking();
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const occupiedSlots = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length,
    0
  );
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100) || 0;
  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE').length;
  const openViolations = violations.filter((v) => v.status === 'OPEN').length;
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [users, zones, reservations, violations]);

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const logDotColor = (type: string) => {
    if (type === 'ENTRY') return 'bg-emerald-500';
    if (type === 'EXIT') return 'bg-amber-500';
    if (type === 'VIOLATION') return 'bg-rose-500';
    return 'bg-slate-500';
  };

  const timeAgo = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Overview of campus parking.{' '}
          <span className="text-slate-500 text-xs">Last updated: {lastUpdated}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={<Users className="w-6 h-6" />} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Current Occupancy" value={`${occupancyRate}%`} icon={<Car className="w-6 h-6" />} trend={{ value: 5, isPositive: false }} />
        <StatCard title="Active Reservations" value={activeReservations} icon={<Calendar className="w-6 h-6" />} />
        <StatCard title="Open Violations" value={openViolations} icon={<ShieldAlert className="w-6 h-6" />} className={openViolations > 0 ? 'border-rose-500/30' : ''} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PeakHoursChart />
        <OccupancyTrend />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ZoneUtilization />
        </div>
        <GlassCard className="flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-slate-400 text-sm">No recent activity.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${logDotColor(log.type)}`} />
                  <div>
                    <p className="text-white">{log.description}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{timeAgo(log.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
