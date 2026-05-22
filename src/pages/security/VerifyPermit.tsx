import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { QrCode, Search, CheckCircle, XCircle } from 'lucide-react';
export const VerifyPermit = () => {
  const { permits, users } = useParking();
  const [scanData, setScanData] = useState('');
  const [result, setResult] = useState<any>(null);
  const handleVerify = () => {
    try {
      const permit = permits.find(
        (p) => p.permitNumber === scanData || p.id === scanData
      );
      if (permit) {
        const user = users.find((u) => u.id === permit.userId);
        const isExpired = new Date(permit.expiryDate) < new Date();
        const isValid = permit.status === 'ACTIVE' && !isExpired;
        setResult({
          permit,
          user,
          isValid,
          isExpired
        });
      } else {
        setResult({
          error: 'Permit not found'
        });
      }
    } catch (e) {
      setResult({
        error: 'Invalid QR data'
      });
    }
  };
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Verify Permit</h1>
        <p className="text-slate-400 mt-1">
          Scan QR code or enter permit number
        </p>
      </div>

      <GlassCard className="p-8">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-8 mb-6 bg-black/20">
          <QrCode className="w-16 h-16 text-slate-400 mb-4" />
          <p className="text-slate-400 text-sm text-center">
            Camera scanner simulator.
            <br />
            Enter a permit number below (e.g., PRM-2026-001)
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={scanData}
            onChange={(e) => setScanData(e.target.value)}
            placeholder="Enter Permit Number"
            className="glass-input flex-1 px-4" />
          
          <Button
            onClick={handleVerify}
            leftIcon={<Search className="w-4 h-4" />}>
            
            Verify
          </Button>
        </div>
      </GlassCard>

      {result &&
      <GlassCard
        className={`border-2 ${result.error || !result.isValid ? 'border-rose-500/50 bg-rose-500/10' : 'border-emerald-500/50 bg-emerald-500/10'}`}>
        
          {result.error ?
        <div className="text-center py-4">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-white">{result.error}</h3>
            </div> :

        <div>
              <div className="flex items-center justify-center gap-2 mb-6">
                {result.isValid ?
            <>
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <h3 className="text-2xl font-bold text-emerald-400">
                      Valid Permit
                    </h3>
                  </> :

            <>
                    <XCircle className="w-8 h-8 text-rose-500" />
                    <h3 className="text-2xl font-bold text-rose-400">
                      Invalid / Expired
                    </h3>
                  </>
            }
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-slate-400 mb-1">Permit Number</p>
                  <p className="font-mono font-bold text-white">
                    {result.permit.permitNumber}
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-slate-400 mb-1">Vehicle Plate</p>
                  <p className="font-mono font-bold text-white">
                    {result.permit.vehiclePlate}
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-slate-400 mb-1">Owner</p>
                  <p className="font-bold text-white">{result.user?.name}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-lg">
                  <p className="text-slate-400 mb-1">Status</p>
                  <Badge variant={result.isValid ? 'success' : 'danger'}>
                    {result.isExpired ? 'EXPIRED' : result.permit.status}
                  </Badge>
                </div>
              </div>
            </div>
        }
        </GlassCard>
      }
    </div>);

};