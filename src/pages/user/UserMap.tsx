import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { ParkingMap } from '../../components/parking/ParkingMap';
import { ReservationModal } from '../../components/reservations/ReservationModal';
import { Slot, Zone } from '../../types';
export const UserMap = () => {
  const { user } = useAuth();
  const { reserveSlot } = useParking();
  const [selectedSlot, setSelectedSlot] = useState<{
    slot: Slot;
    zone: Zone;
  } | null>(null);
  const handleReserve = (duration: number) => {
    if (selectedSlot && user) {
      reserveSlot(user.id, selectedSlot.zone.id, selectedSlot.slot.id, duration);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Parking Map</h1>
        <p className="text-slate-400 mt-1">
          Select an available slot to reserve
        </p>
      </div>

      <ParkingMap
        onSlotClick={(slot, zone) =>
        setSelectedSlot({
          slot,
          zone
        })
        } />
      

      <ReservationModal
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onConfirm={handleReserve}
        slot={selectedSlot?.slot || null}
        zone={selectedSlot?.zone || null} />
      
    </div>);

};