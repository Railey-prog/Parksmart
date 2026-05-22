import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { StatCard } from '../../components/common/StatCard';
import { StatusDropdown } from '../../components/common/StatusDropdown';
import { AlertTriangle, CheckCircle, Car, MapPin, FileText } from 'lucide-react';

type Filter = 'ALL' | 'OPEN' | 'RESOLVED';

export const AdminViolations = () => {
  const { violations, updateViolationStatus } = useParking();
  const [filter, setFilter] = useState<Filter>('OPEN');

  const open = violations.filter((v) => v.status === 'OPEN');
  const resolved = violations.filter((v) => v.status === 'RESOLVED');

  const filtered = violations
    .filter((v) => filter === 'ALL' ? true : v.status === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Violation Reports</h1>
        <p className="text-slate-400 mt-1">
          Unauthorized entry reports submitted by security officers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Open Violations"
          value={open.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          className={open.length > 0 ? 'border-rose-500/30' : ''}
        />
        <StatCard
          title="Resolved"
          value={resolved.length}
          icon={<CheckCircle className="w-6 h-6" />}
          className="border-emerald-500/20"
        />
        <StatCard
          title="Total Reports"
          value={violations.length}
          icon={<FileText className="w-6 h-6" />}
        />
      </div>

      <div className="flex rounded-xl bg-black/20 border border-white/10 p-1 gap-1 w-fit">
        {(['OPEN', 'RESOLVED', 'ALL'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? f === 'OPEN'
                  ? 'bg-rose-600 text-white shadow'
                  : f === 'RESOLVED'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'OPEN' ? `Open (${open.length})` : f === 'RESOLVED' ? `Resolved (${resolved.length})` : 'All'}
          </button>
        ))}
      </div>

      {filter === 'OPEN' && open.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200/80">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>
            There {open.length === 1 ? 'is' : 'are'} <strong>{open.length}</strong> open violation{open.length > 1 ? 's' : ''} requiring attention.
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No {filter !== 'ALL' ? filter.toLowerCase() : ''} violations</p>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'OPEN' ? 'All clear — no open violation reports.' : 'Nothing to show for this filter.'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <GlassCard
              key={v.id}
              className={`border ${
                v.status === 'OPEN'
                  ? 'border-rose-500/20 bg-rose-500/5'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    v.status === 'OPEN' ? 'bg-rose-500/15' : 'bg-white/5'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${v.status === 'OPEN' ? 'text-rose-400' : 'text-slate-500'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-slate-500">
                        {new Date(v.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm mb-2">{v.description}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold text-slate-300">{v.vehiclePlate || '—'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {v.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Reported by: {v.reportedBy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status dropdown */}
                <StatusDropdown
                  value={v.status}
                  options={[{ value: 'OPEN', label: 'OPEN' }, { value: 'RESOLVED', label: 'RESOLVED' }]}
                  onChange={(val) => updateViolationStatus(v.id, val as 'OPEN' | 'RESOLVED')}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
