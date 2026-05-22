import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { SlotCell } from './SlotCell';
import { GlassCard } from '../common/GlassCard';
import { Slot, Zone } from '../../types';
import { MapPin } from 'lucide-react';

interface ParkingMapProps {
  onSlotClick?: (slot: Slot, zone: Zone) => void;
  interactive?: boolean;
  dimmed?: boolean;
  userSlotId?: string;
}

export const ParkingMap: React.FC<ParkingMapProps> = ({
  onSlotClick,
  interactive = true,
  dimmed = false,
  userSlotId,
}) => {
  const { zones } = useParking();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');

  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  if (!selectedZone) return null;

  const availableCount = selectedZone.slots.filter((s) => s.status === 'AVAILABLE').length;
  const totalCount = selectedZone.slots.length;

  return (
    <div className={`space-y-6 ${dimmed ? 'opacity-50 pointer-events-none select-none' : ''}`}>
      {/* Zone Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZoneId(zone.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
              selectedZoneId === zone.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      <GlassCard>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              {selectedZone.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{selectedZone.description}</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl">
            <div className="text-center">
              <span className="block text-2xl font-bold text-emerald-400">{availableCount}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Available</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{totalCount}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div> Occupied
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div> Reserved
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500"></div> Maintenance
          </div>
          {userSlotId && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-400/60 ring-offset-1 ring-offset-black/20"></div> Your Spot
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
          {selectedZone.slots.map((slot) => (
            <SlotCell
              key={slot.id}
              slot={slot}
              interactive={interactive}
              onClick={(s) => onSlotClick?.(s, selectedZone)}
              isUserSlot={slot.id === userSlotId}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
