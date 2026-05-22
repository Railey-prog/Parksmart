import React, { useState, useRef, useEffect } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { Calendar, Clock, CheckCircle, XCircle, MapPin, Ban, CheckCheck, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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
        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors font-medium"
      >
        Actions <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
          {canApprove && (
            <button
              onClick={() => { onApprove(reservation.id); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Approve Reservation
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => { onCancel(reservation.id); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium border-t border-white/5"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const AdminReservations = () => {
  const { reservations, zones, users, cancelReservation, approveReservation } = useParking();
  const [filter, setFilter] = useState<Filter>('PENDING');

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

  const getDurationMins = (start: string, end: string) => {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    if (mins >= 60) return `${Math.round(mins / 60)}h`;
    return `${mins}m`;
  };

  const handleApprove = (id: string) => {
    approveReservation(id);
  };

  const handleCancel = (id: string) => {
    cancelReservation(id);
    toast.success('Reservation cancelled by admin');
  };

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: 'PENDING', label: 'Pending', count: pending.length },
    { key: 'ALL', label: 'All', count: reservations.length },
    { key: 'ACTIVE', label: 'Active', count: active.length },
    { key: 'EXPIRED', label: 'Expired', count: expired.length },
    { key: 'CANCELLED', label: 'Cancelled', count: cancelled.length },
    { key: 'COMPLETED', label: 'Completed', count: completed.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reservations</h1>
        <p className="text-slate-400 mt-1">All parking reservations across campus</p>
      </div>

      {/* Stats */}
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
            <span>
              {pending.length} reservation{pending.length > 1 ? 's are' : ' is'} awaiting your approval.
            </span>
          </div>
          <button
            onClick={() => setFilter('PENDING')}
            className="shrink-0 text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors"
          >
            Review now →
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-black/20 border border-white/10 p-1 w-fit">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? key === 'PENDING' ? 'bg-amber-600 text-white shadow'
                : key === 'ACTIVE' ? 'bg-emerald-700 text-white shadow'
                : key === 'EXPIRED' ? 'bg-slate-600 text-white shadow'
                : key === 'CANCELLED' ? 'bg-rose-700 text-white shadow'
                : 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-14">
          <Calendar className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} reservations</p>
        </GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                <tr>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Zone / Slot</th>
                  <th className="p-4 font-medium">Start</th>
                  <th className="p-4 font-medium">End</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => {
                  const zone = getZone(r.zoneId);
                  const slot = getSlot(r.zoneId, r.slotId);
                  const owner = getUser(r.userId);
                  const isPending = r.status === 'PENDING';
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-white/5 transition-colors ${isPending ? 'bg-amber-500/5' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
                            {owner?.name?.charAt(0) ?? '?'}
                          </div>
                          <span className="text-white text-sm">{owner?.name ?? 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{zone?.name ?? '—'}</span>
                          <span className="text-slate-500">·</span>
                          <span className="font-mono font-semibold text-white">{slot?.name ?? r.slotId}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">
                        {new Date(r.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">
                        {new Date(r.endTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {getDurationMins(r.startTime, r.endTime)}
                      </td>
                      <td className="p-4">
                        <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'}>{r.status}</Badge>
                      </td>
                      <td className="p-4">
                        <ActionDropdown
                          reservation={r}
                          onApprove={handleApprove}
                          onCancel={handleCancel}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
