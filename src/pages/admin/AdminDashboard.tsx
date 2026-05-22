import React, { useEffect, useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { StatCard } from '../../components/common/StatCard';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import {
  PeakHoursChart,
  OccupancyTrend,
  ZoneUtilization } from
'../../components/analytics/Charts';
import { Users, Car, Calendar, ShieldAlert, RotateCcw } from 'lucide-react';
export const AdminDashboard = () => {
  const { users, zones, reservations, violations, resetData } = useParking();
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const occupiedSlots = zones.reduce(
    (acc, z) =>
    acc +
    z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').
    length,
    0
  );
  const occupancyRate = Math.round(occupiedSlots / totalSlots * 100) || 0;
  const activeReservations = reservations.filter(
    (r) => r.status === 'ACTIVE'
  ).length;
  const openViolations = violations.filter((v) => v.status === 'OPEN').length;
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString());

  useEffect(() => {
    // Update the dashboard timestamp whenever core data changes
    setLastUpdated(new Date().toLocaleTimeString());
  }, [users, zones, reservations, violations]);
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin</h1>
          <p className="text-slate-400 mt-1">
            Manage users, parking slots, activity, and permit approvals from one place.
            <span className="text-slate-500 ml-3 text-xs">Last updated: {lastUpdated}</span>
          </p>
        </div>
        <GlassCard className="p-6 bg-slate-900/80 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3">Admin Functions</h2>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li>• Manage users</li>
            <li>• Add and update parking slots</li>
            <li>• View all parking activity</li>
            <li>• Approve parking permits</li>
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users className="w-6 h-6" />}
          trend={{
            value: 12,
            isPositive: true
          }} />
        
        <StatCard
          title="Current Occupancy"
          value={`${occupancyRate}%`}
          icon={<Car className="w-6 h-6" />}
          trend={{
            value: 5,
            isPositive: false
          }} />
        
        <StatCard
          title="Active Reservations"
          value={activeReservations}
          icon={<Calendar className="w-6 h-6" />} />
        
        <StatCard
          title="Open Violations"
          value={openViolations}
          icon={<ShieldAlert className="w-6 h-6" />}
          className={openViolations > 0 ? 'border-rose-500/30' : ''} />
        
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
            <div className="flex gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-white">Vehicle entered North Lot</p>
                <p className="text-slate-500 text-xs mt-0.5">2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-white">New reservation created by Jane D.</p>
                <p className="text-slate-500 text-xs mt-0.5">15 mins ago</p>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-white">Violation reported: Expired permit</p>
                <p className="text-slate-500 text-xs mt-0.5">1 hour ago</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>);

};