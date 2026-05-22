import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
export const SecurityLogs = () => {
  const { logs, addLog } = useParking();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vehiclePlate: '',
    type: 'ENTRY' as 'ENTRY' | 'EXIT'
  });
  const entryExitLogs = logs.filter(
    (log) => log.type === 'ENTRY' || log.type === 'EXIT'
  );
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({
      type: formData.type,
      description: `Vehicle ${formData.type === 'ENTRY' ? 'entered' : 'exited'} campus – plate ${formData.vehiclePlate.toUpperCase()}`,
      vehiclePlate: formData.vehiclePlate,
      severity: 'INFO'
    });
    setShowModal(false);
    setFormData({
      vehiclePlate: '',
      type: 'ENTRY'
    });
    toast.success('Log entry added');
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Entry/Exit Log</h1>
          <p className="text-slate-400 mt-1">Vehicle access records</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}>
          
          Manual Entry
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Vehicle Plate</th>
                <th className="p-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entryExitLogs.map((log) =>
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-400 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Badge
                    variant={log.type === 'ENTRY' ? 'success' : 'warning'}>
                    
                      {log.type}
                    </Badge>
                  </td>
                  <td className="p-4 text-white font-mono">
                    {log.vehiclePlate || '—'}
                  </td>
                  <td className="p-4 text-slate-300">{log.description}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Manual Log Entry">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vehicle Plate
            </label>
            <input
              type="text"
              required
              value={formData.vehiclePlate}
              onChange={(e) =>
              setFormData({
                ...formData,
                vehiclePlate: e.target.value
              })
              }
              className="glass-input w-full px-4"
              placeholder="ABC-1234" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as 'ENTRY' | 'EXIT'
              })
              }
              className="glass-input w-full px-4">
              
              <option value="ENTRY">Entry</option>
              <option value="EXIT">Exit</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Add Log Entry
          </Button>
        </form>
      </Modal>
    </div>);

};