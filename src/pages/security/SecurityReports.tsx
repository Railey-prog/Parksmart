import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { StatCard } from '../../components/common/StatCard';
import {
  AlertTriangle, CheckCircle, Clock, Car,
  MapPin, FileText, Plus
} from 'lucide-react';
import { toast } from 'sonner';

type Filter = 'ALL' | 'OPEN' | 'RESOLVED';

const ZONES = ['Main Entrance', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Visitor Lot', 'Staff Lot'];

const VIOLATION_TYPES = [
  'No valid permit',
  'Expired permit',
  'Parked in restricted area',
  'Blocked emergency exit',
  'Unauthorised vehicle type',
  'Other',
];

export const SecurityReports = () => {
  const { violations, reportViolation, addLog } = useParking();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    vehiclePlate: '',
    location: 'Main Entrance',
    violationType: 'No valid permit',
    notes: '',
  });

  const myReports = violations
    .filter((v) => v.reportedBy === user?.name)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const open = myReports.filter((v) => v.status === 'OPEN');
  const resolved = myReports.filter((v) => v.status === 'RESOLVED');

  const filtered = myReports.filter((v) =>
    filter === 'ALL' ? true : v.status === filter
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehiclePlate.trim()) return;

    const description = form.notes.trim()
      ? `${form.violationType}. ${form.notes}`
      : form.violationType;

    reportViolation({
      reportedBy: user?.name ?? 'Security Officer',
      vehiclePlate: form.vehiclePlate.toUpperCase().trim(),
      description,
      location: form.location,
    });

    addLog({
      type: 'VIOLATION',
      description: `Violation reported – ${form.violationType.toLowerCase()}, plate ${form.vehiclePlate.toUpperCase()}, location ${form.location}`,
      vehiclePlate: form.vehiclePlate.toUpperCase(),
      severity: 'ERROR',
    });

    setShowModal(false);
    setForm({ vehiclePlate: '', location: 'Main Entrance', violationType: 'No valid permit', notes: '' });
    toast.success('Report submitted to admin');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Reports</h1>
          <p className="text-slate-400 mt-1">
            Violation reports you have submitted to the admin
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Submitted" value={myReports.length} icon={<FileText className="w-6 h-6" />} />
        <StatCard title="Pending Review" value={open.length} icon={<Clock className="w-6 h-6" />} className={open.length > 0 ? 'border-amber-500/30' : ''} />
        <StatCard title="Resolved by Admin" value={resolved.length} icon={<CheckCircle className="w-6 h-6" />} className="border-emerald-500/20" />
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl bg-black/20 border border-white/10 p-1 gap-1 w-fit">
        {(['ALL', 'OPEN', 'RESOLVED'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'ALL' ? `All (${myReports.length})` : f === 'OPEN' ? `Open (${open.length})` : `Resolved (${resolved.length})`}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {myReports.length === 0 ? (
        <GlassCard className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No reports submitted yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Click <span className="text-indigo-400 font-medium">New Report</span> above to file your first violation report.
          </p>
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-12">
          <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No {filter.toLowerCase()} reports.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <GlassCard
              key={v.id}
              className={`border ${v.status === 'OPEN' ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/15 bg-emerald-500/5'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.status === 'OPEN' ? 'bg-amber-500/15' : 'bg-emerald-500/10'}`}>
                  <AlertTriangle className={`w-5 h-5 ${v.status === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={v.status === 'OPEN' ? 'warning' : 'success'}>
                      {v.status === 'OPEN' ? 'Pending Review' : 'Resolved'}
                    </Badge>
                    <span className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-white text-sm font-medium mb-2">{v.description}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span className="font-mono font-semibold text-slate-300">{v.vehiclePlate || '—'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {v.location}
                    </span>
                  </div>
                </div>

                {v.status === 'RESOLVED' ? (
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" /> Admin resolved
                  </span>
                ) : (
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-amber-400 font-medium px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" /> Awaiting action
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* New Report Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Violation Report">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/80">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            This report will be sent immediately to the admin for review and action.
          </div>

          {/* Vehicle Plate */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vehicle Plate <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={form.vehiclePlate}
                onChange={(e) => setForm((f) => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))}
                className="glass-input w-full pl-10 pr-4 font-mono uppercase"
                placeholder="e.g. ABC-1234"
              />
            </div>
          </div>

          {/* Violation Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Violation Type <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.violationType}
                onChange={(e) => setForm((f) => ({ ...f, violationType: e.target.value }))}
                className="glass-input w-full pl-10 pr-4"
              >
                {VIOLATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="glass-input w-full pl-10 pr-4"
              >
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="glass-input w-full px-4 py-3 resize-none"
              rows={3}
              placeholder="Describe what happened (optional)"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="flex-1 !bg-rose-600 hover:!bg-rose-500 !border-rose-500/30"
              leftIcon={<AlertTriangle className="w-4 h-4" />}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
