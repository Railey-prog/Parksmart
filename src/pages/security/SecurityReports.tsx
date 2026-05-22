import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { AlertTriangle, CheckCircle, Clock, Car, MapPin, FileText } from 'lucide-react';

type Filter = 'ALL' | 'OPEN' | 'RESOLVED';

export const SecurityReports = () => {
  const { violations } = useParking();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('ALL');

  const myReports = violations.filter(
    (v) => v.reportedBy === user?.name
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const open = myReports.filter((v) => v.status === 'OPEN');
  const resolved = myReports.filter((v) => v.status === 'RESOLVED');

  const filtered = myReports.filter((v) =>
    filter === 'ALL' ? true : v.status === filter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Reports</h1>
        <p className="text-slate-400 mt-1">
          Violation reports you have submitted to the admin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Submitted"
          value={myReports.length}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Review"
          value={open.length}
          icon={<Clock className="w-6 h-6" />}
          className={open.length > 0 ? 'border-amber-500/30' : ''}
        />
        <StatCard
          title="Resolved by Admin"
          value={resolved.length}
          icon={<CheckCircle className="w-6 h-6" />}
          className="border-emerald-500/20"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl bg-black/20 border border-white/10 p-1 gap-1 w-fit">
        {(['ALL', 'OPEN', 'RESOLVED'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'ALL'
              ? `All (${myReports.length})`
              : f === 'OPEN'
              ? `Open (${open.length})`
              : `Resolved (${resolved.length})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {myReports.length === 0 ? (
        <GlassCard className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-500/50 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No reports submitted yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Reports you submit from the Verify Permit page will appear here.
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
              className={`border ${
                v.status === 'OPEN'
                  ? 'border-amber-500/20 bg-amber-500/5'
                  : 'border-emerald-500/15 bg-emerald-500/5'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  v.status === 'OPEN' ? 'bg-amber-500/15' : 'bg-emerald-500/10'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${v.status === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}`} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={v.status === 'OPEN' ? 'warning' : 'success'}>
                      {v.status === 'OPEN' ? 'Pending Review' : 'Resolved'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(v.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-white text-sm font-medium mb-2">{v.description}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span className="font-mono font-semibold text-slate-300">
                        {v.vehiclePlate || '—'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {v.location}
                    </span>
                  </div>
                </div>

                {/* Status pill */}
                {v.status === 'RESOLVED' && (
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Admin resolved
                  </span>
                )}
                {v.status === 'OPEN' && (
                  <span className="shrink-0 flex items-center gap-1.5 text-xs text-amber-400 font-medium px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    Awaiting action
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {myReports.length > 0 && (
        <p className="text-center text-xs text-slate-500">
          To submit a new report, go to <span className="text-indigo-400 font-medium">Verify Permit</span> and use the Report button.
        </p>
      )}
    </div>
  );
};
