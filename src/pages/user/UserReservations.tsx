import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CountdownTimer } from '../../components/reservations/CountdownTimer';
import { Calendar, MapPin } from 'lucide-react';
export const UserReservations = () => {
  const { user } = useAuth();
  const { reservations, zones, cancelReservation } = useParking();
  const myReservations = reservations.filter((r) => r.userId === user?.id);
  const activeReservations = myReservations.filter((r) => r.status === 'ACTIVE');
  const pastReservations = myReservations.filter((r) => r.status !== 'ACTIVE');
  const getZoneAndSlot = (res: (typeof reservations)[0]) => {
    const zone = zones.find((z) => z.id === res.zoneId);
    const slot = zone?.slots.find((s) => s.id === res.slotId);
    return {
      zone,
      slot
    };
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Reservations</h1>
        <p className="text-slate-400 mt-1">
          View and manage your parking reservations
        </p>
      </div>

      {activeReservations.length > 0 &&
      <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Active Reservations
          </h2>
          {activeReservations.map((res) => {
          const { zone, slot } = getZoneAndSlot(res);
          return (
            <GlassCard key={res.id} className="border-emerald-500/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {slot?.name}
                      </h3>
                      <Badge variant="success">ACTIVE</Badge>
                    </div>
                    <p className="text-slate-300 flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4" /> {zone?.name}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Started: {new Date(res.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <CountdownTimer endTime={res.endTime} onExpire={() => {}} />
                    <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelReservation(res.id)}>
                    
                      Cancel
                    </Button>
                  </div>
                </div>
              </GlassCard>);

        })}
        </div>
      }

      {pastReservations.length > 0 &&
      <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            Past Reservations
          </h2>
          {pastReservations.map((res) => {
          const { zone, slot } = getZoneAndSlot(res);
          return (
            <GlassCard key={res.id} className="opacity-75">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {slot?.name}
                      </h3>
                      <Badge
                      variant={
                      res.status === 'COMPLETED' ?
                      'success' :
                      res.status === 'CANCELLED' ?
                      'neutral' :
                      'warning'
                      }>
                      
                        {res.status}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {zone?.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(res.startTime).toLocaleDateString()} •{' '}
                      {new Date(res.startTime).toLocaleTimeString()} -{' '}
                      {new Date(res.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </GlassCard>);

        })}
        </div>
      }

      {myReservations.length === 0 &&
      <GlassCard className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Reservations</h3>
          <p className="text-slate-400">
            You haven't made any parking reservations yet.
          </p>
        </GlassCard>
      }
    </div>);

};