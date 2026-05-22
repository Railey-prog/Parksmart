import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Check, X, History } from 'lucide-react';
import { Permit } from '../../types';
export const AdminPermits = () => {
  const { permits, users, logs, approvePermit, revokePermit } = useParking();
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const getUser = (userId: string) => users.find((u) => u.id === userId);
  const permitLogs = selectedPermit ?
  logs.filter((l) => l.vehiclePlate === selectedPermit.vehiclePlate) :
  [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Permit Management</h1>
        <p className="text-slate-400 mt-1">Approve or revoke parking permits</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Permit Number</th>
                <th className="p-4 font-medium">Owner</th>
                <th className="p-4 font-medium">Vehicle Plate</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Expiry Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {permits.map((permit) => {
                const owner = getUser(permit.userId);
                const isExpired = new Date(permit.expiryDate) < new Date();
                return (
                  <tr
                    key={permit.id}
                    className="hover:bg-white/5 transition-colors">
                    
                    <td className="p-4 font-mono text-white">
                      {permit.permitNumber}
                    </td>
                    <td className="p-4 text-slate-300">{owner?.name}</td>
                    <td className="p-4 font-mono text-slate-400">
                      {permit.vehiclePlate}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                        isExpired ?
                        'neutral' :
                        permit.status === 'ACTIVE' ?
                        'success' :
                        permit.status === 'PENDING' ?
                        'warning' :
                        'danger'
                        }>
                        
                        {isExpired ? 'EXPIRED' : permit.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(permit.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPermit(permit)}
                          className="p-1.5 bg-white/10 text-slate-300 rounded hover:bg-white/20"
                          title="View History">
                          
                          <History className="w-4 h-4" />
                        </button>
                        {permit.status === 'PENDING' &&
                        <>
                            <button
                            onClick={() => approvePermit(permit.id)}
                            className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30">
                            
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                            onClick={() => revokePermit(permit.id)}
                            className="p-1.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30">
                            
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        }
                        {permit.status === 'ACTIVE' &&
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => revokePermit(permit.id)}>
                          
                            Revoke
                          </Button>
                        }
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal
        isOpen={!!selectedPermit}
        onClose={() => setSelectedPermit(null)}
        title="Permit Usage History">
        
        <div className="space-y-4">
          {selectedPermit &&
          <div className="bg-white/5 p-4 rounded-xl mb-4">
              <p className="text-sm text-slate-400">
                Vehicle Plate:{' '}
                <span className="text-white font-mono">
                  {selectedPermit.vehiclePlate}
                </span>
              </p>
            </div>
          }

          {permitLogs.length === 0 ?
          <p className="text-slate-400 text-center py-4">
              No usage history found for this vehicle.
            </p> :

          <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar">
              {permitLogs.map((log) =>
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
              
                  <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'ENTRY' ? 'bg-emerald-500' : log.type === 'EXIT' ? 'bg-amber-500' : log.type === 'VIOLATION' ? 'bg-rose-500' : 'bg-slate-500'}`} />
              
                  <div>
                    <p className="text-sm text-white">{log.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
            )}
            </div>
          }
        </div>
      </Modal>
    </div>);

};