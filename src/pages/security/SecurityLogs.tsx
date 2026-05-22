import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, ShieldX, Plus } from 'lucide-react';
import { toast } from 'sonner';

type ActiveTab = 'ENTRY' | 'EXIT';

export const SecurityLogs = () => {
  const { logs, addLog } = useParking();
  const [activeTab, setActiveTab] = useState<ActiveTab>('ENTRY');
  const [showModal, setShowModal] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');

  const entryLogs = [...logs]
    .filter((log) => log.type === 'ENTRY')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const exitLogs = [...logs]
    .filter((log) => log.type === 'EXIT')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const displayedLogs = activeTab === 'ENTRY' ? entryLogs : exitLogs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) return;
    addLog({
      type: activeTab,
      description: `Vehicle ${activeTab === 'ENTRY' ? 'entered' : 'exited'} campus – plate ${vehiclePlate.toUpperCase()}`,
      vehiclePlate: vehiclePlate.toUpperCase(),
      severity: 'INFO',
    });
    setShowModal(false);
    setVehiclePlate('');
    toast.success(`${activeTab === 'ENTRY' ? 'Entry' : 'Exit'} log added`);
  };

  const handleOpenModal = () => {
    setVehiclePlate('');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 mt-1">Vehicle access records</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenModal}>
          Manual Log
        </Button>
      </div>

      {/* Entry / Exit Tabs */}
      <div className="flex rounded-xl bg-black/30 border border-white/10 p-1 gap-1">
        <button
          onClick={() => setActiveTab('ENTRY')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'ENTRY'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Entry Records
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'ENTRY' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            {entryLogs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('EXIT')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'EXIT'
              ? 'bg-amber-500 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldX className="w-4 h-4" />
          Exit Records
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
            activeTab === 'EXIT' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            {exitLogs.length}
          </span>
        </button>
      </div>

      {/* Table */}
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
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No {activeTab === 'ENTRY' ? 'entry' : 'exit'} records found.
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge variant={log.type === 'ENTRY' ? 'success' : 'warning'}>
                        {log.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-white font-mono">
                      {log.vehiclePlate || '—'}
                    </td>
                    <td className="p-4 text-slate-300">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Manual Log Modal — type is locked to the active tab */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Manual ${activeTab === 'ENTRY' ? 'Entry' : 'Exit'} Log`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`flex items-center gap-3 py-3 px-4 rounded-xl border ${
            activeTab === 'ENTRY'
              ? 'bg-emerald-600/15 border-emerald-500/30'
              : 'bg-amber-500/15 border-amber-500/30'
          }`}>
            {activeTab === 'ENTRY' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldX className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className={`text-xs font-semibold uppercase tracking-widest ${
              activeTab === 'ENTRY' ? 'text-emerald-300' : 'text-amber-300'
            }`}>
              Logging as {activeTab === 'ENTRY' ? 'Entry' : 'Exit'} record
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vehicle Plate
            </label>
            <input
              type="text"
              required
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
              className="glass-input w-full px-4 font-mono uppercase"
              placeholder="ABC-1234"
            />
          </div>

          <Button type="submit" className="w-full">
            Add {activeTab === 'ENTRY' ? 'Entry' : 'Exit'} Log
          </Button>
        </form>
      </Modal>
    </div>
  );
};
