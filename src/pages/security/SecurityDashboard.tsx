import React from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const SecurityDashboard = () => {
  const { logs, violations, zones } = useParking();

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const openViolations = violations.filter((v) => v.status === 'OPEN');
  const totalSlots = zones.reduce((acc, z) => acc + z.slots.length, 0);
  const occupiedSlots = zones.reduce(
    (acc, z) => acc + z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length,
    0
  );
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor campus parking activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Open Violations" value={openViolations.length} icon={<AlertTriangle className="w-6 h-6" />} className={openViolations.length > 0 ? 'border-rose-500/30' : ''} />
        <StatCard title="Current Occupancy" value={`${occupancyRate}%`} icon={<ShieldCheck className="w-6 h-6" />} />
        <StatCard title="Total Log Entries" value={logs.length} icon={<FileText className="w-6 h-6" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Open Violations ({openViolations.length})
          </h3>
          <div className="space-y-3">
            {openViolations.length === 0 ? (
              <p className="text-slate-400 text-sm">No open violations.</p>
            ) : (
              openViolations.map((v) => (
                <div key={v.id} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-sm font-bold text-white">{v.vehiclePlate}</span>
                    <Badge variant="warning">OPEN</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{v.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {v.location} • {new Date(v.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Recent Entry/Exit</h3>
          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-slate-400 text-sm">No recent logs.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 border-b border-white/5 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'ENTRY' ? 'bg-emerald-500' : log.type === 'EXIT' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-sm text-white">{log.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
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
