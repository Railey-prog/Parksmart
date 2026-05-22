import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { DigitalPermit } from '../../components/permits/DigitalPermit';
import { AlertCircle } from 'lucide-react';
export const UserPermit = () => {
  const { user } = useAuth();
  const { permits } = useParking();
  if (!user) return null;
  const myPermit = permits.find((p) => p.userId === user.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Permit</h1>
        <p className="text-slate-400 mt-1">Your digital parking credential</p>
      </div>

      <div className="max-w-md mx-auto mt-10">
        {myPermit ?
        <DigitalPermit permit={myPermit} user={user} /> :

        <GlassCard className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No Active Permit
            </h3>
            <p className="text-slate-400 mb-6">
              You need to apply for a parking permit to park on campus
              long-term.
            </p>
            <Button>Apply for Permit</Button>
          </GlassCard>
        }
      </div>
    </div>);

};