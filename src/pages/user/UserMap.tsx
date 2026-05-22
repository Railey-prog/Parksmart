import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { ParkingMap } from '../../components/parking/ParkingMap';
import { ReservationModal } from '../../components/reservations/ReservationModal';
import { Slot, Zone } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ShieldX, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const UserMap = () => {
  const { user } = useAuth();
  const { reserveSlot, permits } = useParking();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<{ slot: Slot; zone: Zone } | null>(null);

  const userPermit = permits.find((p) => p.userId === user?.id);
  const hasActivePermit = userPermit?.status === 'ACTIVE';
  const hasPendingPermit = userPermit?.status === 'PENDING';

  const handleSlotClick = (slot: Slot, zone: Zone) => {
    if (!hasActivePermit) {
      if (hasPendingPermit) {
        toast.warning('Your permit application is still under review. You cannot reserve a slot until it is approved.');
      } else {
        toast.error('You need an active parking permit to make a reservation. Please apply for a permit first.');
      }
      return;
    }
    setSelectedSlot({ slot, zone });
  };

  const handleReserve = (duration: number) => {
    if (selectedSlot && user) {
      reserveSlot(user.id, selectedSlot.zone.id, selectedSlot.slot.id, duration);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Parking Map</h1>
        <p className="text-slate-400 mt-1">Select an available slot to reserve</p>
      </div>

      {/* Permit status banner */}
      {!hasActivePermit && (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${
          hasPendingPermit
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            hasPendingPermit ? 'bg-amber-500/20' : 'bg-rose-500/20'
          }`}>
            {hasPendingPermit
              ? <Clock className="w-5 h-5 text-amber-400" />
              : <ShieldX className="w-5 h-5 text-rose-400" />
            }
          </div>
          <div className="flex-1">
            {hasPendingPermit ? (
              <>
                <p className="text-amber-300 font-semibold text-sm">Permit Under Review</p>
                <p className="text-amber-200/70 text-xs mt-0.5">
                  Your permit application is waiting for admin approval. You'll be able to reserve parking slots once it's approved.
                </p>
              </>
            ) : (
              <>
                <p className="text-rose-300 font-semibold text-sm">No Active Permit</p>
                <p className="text-rose-200/70 text-xs mt-0.5">
                  You need an active parking permit to reserve a slot. Apply for one first.
                </p>
              </>
            )}
          </div>
          {!hasPendingPermit && (
            <button
              onClick={() => navigate('/user/permit')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Apply Now
            </button>
          )}
        </div>
      )}

      <ParkingMap onSlotClick={handleSlotClick} dimmed={!hasActivePermit} />

      <ReservationModal
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onConfirm={handleReserve}
        slot={selectedSlot?.slot || null}
        zone={selectedSlot?.zone || null}
      />
    </div>
  );
};
