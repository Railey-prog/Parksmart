import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { AlertTriangle } from 'lucide-react';
export const AdminLogs = () => {
  const { logs } = useParking();
  const [filter, setFilter] = useState<
    'ALL' | 'SUSPICIOUS' | 'INFO' | 'WARNING' | 'ERROR'>(
    'ALL');
  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'SUSPICIOUS')
    return log.severity === 'ERROR' || log.type === 'VIOLATION';
    return log.severity === filter;
  });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">System Logs</h1>
          <p className="text-slate-400 mt-1">
            Monitor system events and activities
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="glass-input px-4">
          
          <option value="ALL">All Logs</option>
          <option value="SUSPICIOUS">Suspicious Activity</option>
          <option value="INFO">Info Only</option>
          <option value="WARNING">Warnings Only</option>
          <option value="ERROR">Errors Only</option>
        </select>
      </div>

      {filter === 'SUSPICIOUS' &&
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-200/80">
            Showing suspicious activities including violations, unauthorized
            access attempts, and system errors.
          </p>
        </div>
      }

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Vehicle Plate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) =>
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge
                    variant={
                    log.type === 'ENTRY' ?
                    'success' :
                    log.type === 'EXIT' ?
                    'warning' :
                    log.type === 'VIOLATION' ?
                    'danger' :
                    'info'
                    }>
                    
                      {log.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                    variant={
                    log.severity === 'ERROR' ?
                    'danger' :
                    log.severity === 'WARNING' ?
                    'warning' :
                    'info'
                    }>
                    
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="p-4 text-white">{log.description}</td>
                  <td className="p-4 text-slate-400 font-mono">
                    {log.vehiclePlate || '—'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>);

};