import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DigitalPermit } from '../../components/permits/DigitalPermit';
import { AlertCircle, Car } from 'lucide-react';

export const UserPermit = () => {
  const { user } = useAuth();
  const { permits, requestPermit } = useParking();
  const [showModal, setShowModal] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState(user?.vehiclePlate || '');
  const [vehicleModel, setVehicleModel] = useState(user?.vehicleModel || '');

  if (!user) return null;

  const myPermit = permits.find((p) => p.userId === user.id);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    requestPermit(user.id, vehiclePlate, vehicleModel);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Permit</h1>
        <p className="text-slate-400 mt-1">Your digital parking credential</p>
      </div>

      <div className="max-w-md mx-auto mt-10">
        {myPermit ? (
          <DigitalPermit permit={myPermit} user={user} />
        ) : (
          <GlassCard className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Permit</h3>
            <p className="text-slate-400 mb-6">
              You need a parking permit to park on campus. Apply below and an admin will review your request.
            </p>
            <Button onClick={() => setShowModal(true)}>Apply for Permit</Button>
          </GlassCard>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Parking Permit">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">License Plate</label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="glass-input w-full pl-10 pr-4"
                placeholder="ABC-1234" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Make & Model</label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="glass-input w-full px-4"
              placeholder="Toyota Camry" />
          </div>
          <p className="text-xs text-slate-400 pt-2">
            Your application will be reviewed by an admin. You'll be notified once approved.
          </p>
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </Modal>
    </div>
  );
};
