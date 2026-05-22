import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { AlertTriangle, ChevronDown } from 'lucide-react';

export const Violations = () => {
  const { user } = useAuth();
  const { violations, reportViolation, updateViolationStatus } = useParking();
  const [formData, setFormData] = useState({
    vehiclePlate: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    reportViolation({
      reportedBy: user.id,
      vehiclePlate: formData.vehiclePlate,
      location: formData.location,
      description: formData.description
    });
    setFormData({ vehiclePlate: '', location: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Violations</h1>
        <p className="text-slate-400 mt-1">Report and manage parking violations</p>
      </div>

      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Report Violation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle Plate</label>
              <input
                type="text"
                required
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                className="glass-input w-full px-4"
                placeholder="ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="glass-input w-full px-4"
                placeholder="North Campus Lot (N-05)"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full px-4 min-h-[100px] resize-none"
              placeholder="Describe the violation..."
            />
          </div>
          <Button type="submit" className="w-full">Submit Report</Button>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold text-white mb-4">All Violations</h2>
        <div className="space-y-3">
          {violations.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No violations reported.</p>
          ) : (
            violations.map((v) => (
              <div
                key={v.id}
                className={`p-4 border rounded-xl transition-colors ${
                  v.status === 'OPEN'
                    ? 'bg-rose-500/5 border-rose-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-mono text-lg font-bold text-white">{v.vehiclePlate}</span>
                    <p className="text-sm text-slate-400 mt-1">{v.location}</p>
                  </div>

                  {/* Status dropdown */}
                  <div className="relative">
                    <select
                      value={v.status}
                      onChange={(e) => updateViolationStatus(v.id, e.target.value as 'OPEN' | 'RESOLVED')}
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all focus:outline-none ${
                        v.status === 'OPEN'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      }`}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${
                      v.status === 'OPEN' ? 'text-rose-400' : 'text-emerald-400'
                    }`} />
                  </div>
                </div>

                <p className="text-slate-300 mb-3">{v.description}</p>
                <p className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
