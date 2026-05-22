import React from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { AlertTriangle } from 'lucide-react';
export const SecurityDashboard = () => {
  const { logs, violations } = useParking();
  const recentLogs = logs.slice(0, 5);
  const openViolations = violations.filter((v) => v.status === 'OPEN');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor campus parking activity</p>
      </div>

      <GlassCard className="p-6 bg-slate-900/80 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">
          SECURITY STAFF (Campus Enforcement)
        </h2>
        <p className="text-slate-300 mb-4">
          Security staff ensures order and validates parking usage.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="font-semibold text-white mb-2">Permit Verification</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Scan or manually check QR codes</li>
              <li>Verify vehicle permit validity</li>
              <li>Approve or deny entry to parking areas</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="font-semibold text-white mb-2">Parking Monitoring</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Monitor real-time parking occupancy</li>
              <li>Check illegally parked vehicles</li>
              <li>Report violations or misuse</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="font-semibold text-white mb-2">Gate Control Support</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Assist in entry and exit validation</li>
              <li>Log vehicle entry and exit times</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
            <h3 className="font-semibold text-white mb-2">Incident Reporting</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Report unauthorized parking</li>
              <li>Flag expired permits or invalid reservations</li>
              <li>Send alerts to Admin</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Open Violations ({openViolations.length})
          </h3>
          <div className="space-y-3">
            {openViolations.length === 0 ?
            <p className="text-slate-400 text-sm">No open violations.</p> :

            openViolations.map((v) =>
            <div
              key={v.id}
              className="p-3 bg-white/5 border border-white/10 rounded-xl">
              
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-sm font-bold text-white">
                      {v.vehiclePlate}
                    </span>
                    <Badge variant="warning">OPEN</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{v.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {v.location} • {new Date(v.timestamp).toLocaleTimeString()}
                  </p>
                </div>
            )
            }
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Recent Entry/Exit</h3>
          <div className="space-y-3">
            {recentLogs.map((log) =>
            <div
              key={log.id}
              className="flex items-start gap-3 p-2 border-b border-white/5 last:border-0">
              
                <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'ENTRY' ? 'bg-emerald-500' : log.type === 'EXIT' ? 'bg-amber-500' : 'bg-slate-500'}`} />
              
                <div>
                  <p className="text-sm text-white">{log.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>);

};