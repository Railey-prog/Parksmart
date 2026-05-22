import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import {
  MapPin, Plus, Trash2, Zap, Accessibility,
  Calendar, Clock, CheckCircle, XCircle,
  Ban, CheckCheck, ChevronDown, RefreshCw, User
} from 'lucide-react';
import { SlotStatus, Zone } from '../../types';
import { toast } from 'sonner';

type Tab = 'zones' | 'reservations';
type Filter = 'ALL' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  EXPIRED: 'neutral',
  CANCELLED: 'danger',
  COMPLETED: 'info',
};

const ActionDropdown = ({
  reservation,
  onApprove,
  onCancel,
}: {
  reservation: { id: string; status: string };
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const canApprove = reservation.status === 'PENDING';
  const canCancel = reservation.status === 'PENDING' || reservation.status === 'ACTIVE';
  if (!canApprove && !canCancel) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors font-medium whitespace-nowrap"
      >
        Actions <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
          {canApprove && (
            <button
              onClick={() => { onApprove(reservation.id); setOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => { onCancel(reservation.id); setOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-3 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium border-t border-white/5"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const AdminParking = () => {
  const {
    zones, reservations, users,
    updateSlotStatus, createZone, updateZone, deleteZone, createSlot, deleteSlot,
    cancelReservation, approveReservation, refreshReservations,
  } = useParking();

  const [tab, setTab] = useState<Tab>('zones');

  // Zones state
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneForm, setZoneForm] = useState({ name: '', description: '', capacity: 10 });
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({ name: '', isEV: false, isAccessible: false });

  // Reservations state
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { refreshReservations(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReservations();
    setRefreshing(false);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const atTop = el.scrollTop === 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;
    if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const getSlotStatusColor = (status: SlotStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'OCCUPIED': return 'danger';
      case 'RESERVED': return 'warning';
      default: return 'neutral';
    }
  };

  const handleOpenZoneModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({ name: zone.name, description: zone.description, capacity: zone.capacity });
    } else {
      setEditingZone(null);
      setZoneForm({ name: '', description: '', capacity: 10 });
    }
    setIsZoneModalOpen(true);
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) updateZone(editingZone.id, zoneForm);
    else createZone(zoneForm);
    setIsZoneModalOpen(false);
  };

  const handleSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedZoneId) {
      createSlot(selectedZoneId, slotForm);
      setIsSlotModalOpen(false);
      setSlotForm({ name: '', isEV: false, isAccessible: false });
    }
  };

  const pending = reservations.filter((r) => r.status === 'PENDING');
  const active = reservations.filter((r) => r.status === 'ACTIVE');
  const expired = reservations.filter((r) => r.status === 'EXPIRED');
  const cancelled = reservations.filter((r) => r.status === 'CANCELLED');
  const completed = reservations.filter((r) => r.status === 'COMPLETED');

  const filtered = reservations
    .filter((r) => filter === 'ALL' ? true : r.status === filter)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getZone = (zoneId: string) => zones.find((z) => z.id === zoneId);
  const getSlot = (zoneId: string, slotId: string) => getZone(zoneId)?.slots.find((s) => s.id === slotId);
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const getDuration = (start: string, end: string) => {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
  };

  const FILTERS: { key: Filter; label: string; count: number; color: string }[] = [
    { key: 'PENDING', label: 'Pending', count: pending.length, color: 'bg-amber-600' },
    { key: 'ACTIVE', label: 'Active', count: active.length, color: 'bg-emerald-700' },
    { key: 'EXPIRED', label: 'Expired', count: expired.length, color: 'bg-slate-600' },
    { key: 'CANCELLED', label: 'Cancelled', count: cancelled.length, color: 'bg-rose-700' },
    { key: 'COMPLETED', label: 'Completed', count: completed.length, color: 'bg-indigo-600' },
    { key: 'ALL', label: 'All', count: reservations.length, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Parking</h1>
          <p className="text-slate-400 mt-1">Manage zones, slots and reservations</p>
        </div>
        {tab === 'zones' && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => handleOpenZoneModal()}>
            Add Zone
          </Button>
        )}
        {tab === 'reservations' && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-black/20 border border-white/10 p-1 w-fit">
        <button
          onClick={() => setTab('zones')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'zones' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" /> Zones & Slots
        </button>
        <button
          onClick={() => setTab('reservations')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'reservations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Reservations
          {pending.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {/* ── ZONES TAB ── */}
      {tab === 'zones' && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {zones.map((zone) => {
              const available = zone.slots.filter((s) => s.status === 'AVAILABLE').length;
              const occupied = zone.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
              const occupancyRate = zone.capacity > 0 ? Math.round((occupied / zone.capacity) * 100) : 0;
              return (
                <GlassCard
                  key={zone.id}
                  hoverEffect
                  onClick={() => setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)}
                  className={selectedZoneId === zone.id ? 'border-indigo-500/50' : ''}
                >
                  <div className="flex items-start justify-between mb-3">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    <Badge variant={occupancyRate > 80 ? 'danger' : occupancyRate > 50 ? 'warning' : 'success'}>
                      {occupancyRate}%
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{zone.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{zone.description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">{available} Available</span>
                    <span className="text-slate-400">{zone.capacity} Total</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {selectedZone && (
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedZone.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage slot statuses</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsSlotModalOpen(true)}>
                    Add Slot
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleOpenZoneModal(selectedZone)}>
                    Edit Zone
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => { deleteZone(selectedZone.id); setSelectedZoneId(null); }}>
                    Delete Zone
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {selectedZone.slots.map((slot) => (
                  <div key={slot.id} className="bg-black/20 rounded-lg p-3 border border-white/10 relative group">
                    <button
                      onClick={() => deleteSlot(selectedZone.id, slot.id)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="text-center mb-2">
                      <div className="flex justify-center gap-1 mb-1">
                        {slot.isEV && <Zap className="w-3 h-3 text-cyan-400" />}
                        {slot.isAccessible && <Accessibility className="w-3 h-3 text-blue-400" />}
                      </div>
                      <p className="font-bold text-white text-sm">{slot.name}</p>
                      <Badge variant={getSlotStatusColor(slot.status)} className="mt-1 text-[10px]">
                        {slot.status}
                      </Badge>
                    </div>
                    <select
                      value={slot.status}
                      onChange={(e) => updateSlotStatus(selectedZone.id, slot.id, e.target.value as SlotStatus)}
                      className="glass-input w-full px-2 text-xs"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* ── RESERVATIONS TAB ── */}
      {tab === 'reservations' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Pending Approval" value={pending.length} icon={<Clock className="w-6 h-6" />} className={pending.length > 0 ? 'border-amber-500/30' : ''} />
            <StatCard title="Active Now" value={active.length} icon={<CheckCircle className="w-6 h-6" />} className={active.length > 0 ? 'border-emerald-500/30' : ''} />
            <StatCard title="Total" value={reservations.length} icon={<Calendar className="w-6 h-6" />} />
            <StatCard title="Completed" value={completed.length} icon={<XCircle className="w-6 h-6" />} />
          </div>

          {pending.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200/80">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{pending.length} reservation{pending.length > 1 ? 's are' : ' is'} awaiting your approval.</span>
              </div>
              <button
                onClick={() => setFilter('PENDING')}
                className="shrink-0 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
              >
                Review now →
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-1 rounded-xl bg-black/20 border border-white/10 p-1 w-fit">
            {FILTERS.map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === key ? `${color} text-white shadow` : 'text-slate-400 hover:text-white'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <GlassCard className="text-center py-14">
              <Calendar className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} reservations</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-0 overflow-hidden">
              <div ref={scrollRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '520px' }}>
                <table className="text-left text-sm" style={{ minWidth: '900px', width: '100%' }}>
                  <thead className="bg-white/5 border-b border-white/10 text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> User</div>
                      </th>
                      <th className="p-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Zone / Slot</div>
                      </th>
                      <th className="p-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Start</div>
                      </th>
                      <th className="p-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> End</div>
                      </th>
                      <th className="p-4 font-semibold whitespace-nowrap">Duration</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                      <th className="p-4 font-semibold whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((r) => {
                      const zone = getZone(r.zoneId);
                      const slot = getSlot(r.zoneId, r.slotId);
                      const owner = getUser(r.userId);
                      return (
                        <tr key={r.id} className={`hover:bg-white/5 transition-colors ${r.status === 'PENDING' ? 'bg-amber-500/5' : ''}`}>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                                {owner?.name?.charAt(0) ?? '?'}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{owner?.name ?? 'Unknown'}</p>
                                <p className="text-slate-500 text-xs">{owner?.email ?? ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{zone?.name ?? '—'}</span>
                              <span className="text-slate-600">·</span>
                              <span className="font-mono font-bold text-white">{slot?.name ?? r.slotId}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <p className="text-slate-200 text-sm font-medium">
                              {new Date(r.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-slate-500 text-xs font-mono">
                              {new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <p className="text-slate-200 text-sm font-medium">
                              {new Date(r.endTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-slate-500 text-xs font-mono">
                              {new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="text-white font-bold text-sm">{getDuration(r.startTime, r.endTime)}</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'}>{r.status}</Badge>
                          </td>
                          <td className="p-4 whitespace-nowrap text-right">
                            <ActionDropdown
                              reservation={r}
                              onApprove={approveReservation}
                              onCancel={(id) => { cancelReservation(id); toast.success('Reservation cancelled'); }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-xs text-slate-500">
                <span>Showing {filtered.length} reservation{filtered.length !== 1 ? 's' : ''}</span>
                <span>Scroll horizontally to see all columns</span>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* Zone Modal */}
      <Modal isOpen={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} title={editingZone ? 'Edit Zone' : 'Add Zone'}>
        <form onSubmit={handleZoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input required type="text" value={zoneForm.name}
              onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
              className="glass-input w-full px-4" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <input required type="text" value={zoneForm.description}
              onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
              className="glass-input w-full px-4" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Capacity</label>
            <input required type="number" min="1" value={zoneForm.capacity}
              onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) })}
              className="glass-input w-full px-4" />
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsZoneModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editingZone ? 'Save Changes' : 'Create Zone'}</Button>
          </div>
        </form>
      </Modal>

      {/* Slot Modal */}
      <Modal isOpen={isSlotModalOpen} onClose={() => setIsSlotModalOpen(false)} title="Add Slot">
        <form onSubmit={handleSlotSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Slot Name (e.g. N-01)</label>
            <input required type="text" value={slotForm.name}
              onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
              className="glass-input w-full px-4" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={slotForm.isEV}
                onChange={(e) => setSlotForm({ ...slotForm, isEV: e.target.checked })}
                className="rounded bg-black/20 border-white/10 text-indigo-500 focus:ring-indigo-500/50" />
              EV Charging
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={slotForm.isAccessible}
                onChange={(e) => setSlotForm({ ...slotForm, isAccessible: e.target.checked })}
                className="rounded bg-black/20 border-white/10 text-indigo-500 focus:ring-indigo-500/50" />
              Accessible
            </label>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsSlotModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Add Slot</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
