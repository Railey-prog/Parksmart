import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { User, Mail, Car } from 'lucide-react';
import { toast } from 'sonner';
export const UserProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    vehiclePlate: user?.vehiclePlate || '',
    vehicleModel: user?.vehicleModel || ''
  });
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account information</p>
      </div>

      <GlassCard>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                }
                className="glass-input w-full pl-10 pr-4"
                placeholder="John Doe" />
              
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="glass-input w-full pl-10 pr-4 opacity-60 cursor-not-allowed" />
              
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-slate-300 mb-4">
              Vehicle Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  License Plate
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.vehiclePlate}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehiclePlate: e.target.value
                    })
                    }
                    className="glass-input w-full pl-10 pr-4"
                    placeholder="ABC-1234" />
                  
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleModel: e.target.value
                  })
                  }
                  className="glass-input w-full px-4"
                  placeholder="Toyota Camry" />
                
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
              setFormData({
                name: user?.name || '',
                email: user?.email || '',
                vehiclePlate: user?.vehiclePlate || '',
                vehicleModel: user?.vehicleModel || ''
              })
              }>
              
              Reset
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>);

};