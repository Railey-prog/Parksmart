import React from 'react';
import { Permit, User } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Car, Calendar } from 'lucide-react';
import { Badge } from '../common/Badge';
interface DigitalPermitProps {
  permit: Permit;
  user: User;
}
export const DigitalPermit: React.FC<DigitalPermitProps> = ({
  permit,
  user
}) => {
  const isExpired = new Date(permit.expiryDate) < new Date();
  const isActive = permit.status === 'ACTIVE' && !isExpired;
  // Data to encode in QR
  const qrData = JSON.stringify({
    id: permit.id,
    num: permit.permitNumber,
    uid: user.id
  });
  return (
    <GlassCard className="relative overflow-hidden max-w-sm mx-auto p-0 border-t-4 border-t-indigo-500">
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              ParkSmart
            </h3>
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider mt-1">
              Digital Permit
            </p>
          </div>
          <Badge
            variant={
            isActive ?
            'success' :
            permit.status === 'PENDING' ?
            'warning' :
            'danger'
            }>
            
            {isExpired ? 'EXPIRED' : permit.status}
          </Badge>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-3 rounded-xl shadow-lg">
            <QRCodeSVG
              value={qrData}
              size={160}
              level="H"
              fgColor={isActive ? '#0f172a' : '#94a3b8'} />
            
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400 mb-1">Permit Number</p>
            <p className="font-mono text-lg font-bold text-white tracking-wider">
              {permit.permitNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Car className="w-3 h-3" /> Vehicle
              </div>
              <p className="font-medium text-white">{permit.vehiclePlate}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Calendar className="w-3 h-3" /> Valid Thru
              </div>
              <p className="font-medium text-white">
                {new Date(permit.expiryDate).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-300">
              {user.name}
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-50" />
        </div>
      </div>
    </GlassCard>);

};