import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Slot, Zone } from '../../types';
import { Clock, MapPin, Zap, Accessibility } from 'lucide-react';
interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationMinutes: number) => void;
  slot: Slot | null;
  zone: Zone | null;
}
export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  slot,
  zone
}) => {
  const [duration, setDuration] = useState<number>(60);
  if (!slot || !zone) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Parking Slot">
      <div className="space-y-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-2xl font-bold text-white">{slot.name}</h4>
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {zone.name}
              </p>
            </div>
            <div className="flex gap-2">
              {slot.isEV &&
              <div
                className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg"
                title="EV Charging">
                
                  <Zap className="w-5 h-5" />
                </div>
              }
              {slot.isAccessible &&
              <div
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"
                title="Accessible">
                
                  <Accessibility className="w-5 h-5" />
                </div>
              }
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[30, 60, 120, 240, 480].map((mins) =>
            <button
              key={mins}
              onClick={() => setDuration(mins)}
              className={`py-2 px-4 rounded-xl border transition-all ${duration === mins ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
              
                {mins >= 60 ?
              `${mins / 60} hr${mins > 60 ? 's' : ''}` :
              `${mins} min`}
              </button>
            )}
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80">
            Reservations expire automatically if you do not arrive within the
            selected timeframe. Please cancel if you no longer need the spot.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              onConfirm(duration);
              onClose();
            }}>
            
            Confirm Reservation
          </Button>
        </div>
      </div>
    </Modal>);

};