import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Clock, MapPin } from 'lucide-react';
export const UserHistory = () => {
  const { user } = useAuth();
  const { reservations, zones } = useParking();
  const myHistory = reservations.
  filter((r) => r.userId === user?.id && r.status !== 'ACTIVE').
  sort(
    (a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  const getZoneAndSlot = (res: (typeof reservations)[0]) => {
    const zone = zones.find((z) => z.id === res.zoneId);
    const slot = zone?.slots.find((s) => s.id === res.slotId);
    return {
      zone,
      slot
    };
  };
  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Parking History</h1>
        <p className="text-slate-400 mt-1">Your past parking sessions</p>
      </div>

      {myHistory.length > 0 ?
      <GlassCard className="p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            {myHistory.map((res) => {
            const { zone, slot } = getZoneAndSlot(res);
            return (
              <div
                key={res.id}
                className="p-6 hover:bg-white/5 transition-colors">
                
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
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
                      <p className="text-slate-300 text-sm flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {zone?.name}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                        <span>
                          {new Date(res.startTime).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(res.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}{' '}
                          -{' '}
                          {new Date(res.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        </span>
                        <span>
                          Duration: {getDuration(res.startTime, res.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>);

          })}
          </div>
        </GlassCard> :

      <GlassCard className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No History</h3>
          <p className="text-slate-400">
            You don't have any past parking sessions yet.
          </p>
        </GlassCard>
      }
    </div>);

};