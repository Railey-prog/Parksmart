import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CountdownTimer } from '../../components/reservations/CountdownTimer';
import { MapPin, Calendar, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { reservations, zones, cancelReservation } = useParking();
  const navigate = useNavigate();

  const activeReservation = reservations.find(
    (r) => r.userId === user?.id && r.status === 'ACTIVE'
  );
  const activeZone = activeReservation ? zones.find((z) => z.id === activeReservation.zoneId) : null;
  const activeSlot = activeZone ? activeZone.slots.find((s) => s.id === activeReservation?.slotId) : null;

  // Compute high-occupancy zones from real data
  const zoneAlerts = zones
    .map((z) => {
      const occupied = z.slots.filter((s) => s.status === 'OCCUPIED' || s.status === 'RESERVED').length;
      const pct = Math.round((occupied / z.slots.length) * 100);
      return { name: z.name, pct };
    })
    .filter((z) => z.pct >= 75)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-1">Find and manage your parking</p>
        </div>
        <Button onClick={() => navigate('/user/map')} leftIcon={<Plus className="w-4 h-4" />}>
          New Reservation
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {activeReservation && activeSlot && activeZone ? (
            <GlassCard className="border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <MapPin className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <Badge variant="success" className="mb-2">Active Reservation</Badge>
                  <h2 className="text-2xl font-bold text-white">{activeSlot.name}</h2>
                  <p className="text-slate-300 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {activeZone.name}
                  </p>
                </div>
                <CountdownTimer endTime={activeReservation.endTime} onExpire={() => {}} />
              </div>
              <div className="flex gap-3 relative z-10">
                <Button variant="danger" onClick={() => cancelReservation(activeReservation.id)}>
                  Cancel Reservation
                </Button>
                <Button variant="secondary" onClick={() => navigate('/user/map')}>
                  View on Map
                </Button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center text-center py-12 border-dashed border-white/20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Reservations</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                You don't have any upcoming parking reservations. Book a spot now.
              </p>
              <Button onClick={() => navigate('/user/map')}>Find Parking</Button>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Campus Alerts
            </h3>
            <div className="space-y-3">
              {zoneAlerts.length === 0 ? (
                <p className="text-sm text-slate-400">All zones have normal occupancy.</p>
              ) : (
                zoneAlerts.map((z) => (
                  <div key={z.name} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-200">
                    <strong>{z.pct >= 90 ? 'Critical' : 'High Demand'}:</strong> {z.name} is at {z.pct}% capacity.
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
