import React, { useState, useEffect, useRef } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  QrCode, Search, CheckCircle, XCircle, Camera,
  KeyboardIcon, RotateCcw, Car, User as UserIcon,
  Calendar, ShieldCheck, ShieldX, Loader2
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

type Tab = 'camera' | 'manual';
type VerifyResult = {
  permit: any;
  user: any;
  isValid: boolean;
  isExpired: boolean;
} | { error: string } | null;

export const VerifyPermit = () => {
  const { permits, users, addLog } = useParking();
  const { user: securityUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<VerifyResult>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-camera-region';

  const resolvePermit = (rawValue: string) => {
    let lookupNum = rawValue.trim();

    // Try parsing as JSON (from DigitalPermit QR)
    try {
      const parsed = JSON.parse(rawValue);
      if (parsed.num) lookupNum = parsed.num;
      else if (parsed.id) lookupNum = parsed.id;
    } catch {
      // Not JSON — treat as raw permit number
    }

    const permit = permits.find(
      (p) => p.permitNumber === lookupNum || p.id === lookupNum
    );

    if (permit) {
      const owner = users.find((u) => u.id === permit.userId);
      const isExpired = new Date(permit.expiryDate) < new Date();
      const isValid = permit.status === 'ACTIVE' && !isExpired;
      return { permit, user: owner, isValid, isExpired };
    }
    return { error: 'Permit not found' };
  };

  const applyResult = (res: VerifyResult) => {
    setResult(res);
    if (!res) return;

    if ('error' in res) {
      addLog({
        type: 'ENTRY',
        description: `Entry DENIED — permit not found (scanned: ${manualInput || 'QR'})`,
        severity: 'WARNING',
      });
      toast.error('Entry denied — permit not found');
    } else if (!res.isValid) {
      addLog({
        type: 'ENTRY',
        description: `Entry DENIED — ${res.isExpired ? 'expired' : res.permit.status.toLowerCase()} permit (${res.permit.permitNumber})`,
        vehiclePlate: res.permit.vehiclePlate,
        userId: res.user?.id,
        severity: 'WARNING',
      });
      toast.error('Entry denied — invalid permit');
    } else {
      addLog({
        type: 'ENTRY',
        description: `Entry ALLOWED — permit verified (${res.permit.permitNumber}) for ${res.user?.name ?? 'unknown'}`,
        vehiclePlate: res.permit.vehiclePlate,
        userId: res.user?.id,
        severity: 'INFO',
      });
      toast.success('Entry allowed');
    }
  };

  const handleManualVerify = () => {
    if (!manualInput.trim()) return;
    const res = resolvePermit(manualInput.trim());
    applyResult(res);
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraLoading(true);
    setResult(null);

    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          // QR successfully scanned — stop camera and show result
          stopCamera();
          const res = resolvePermit(decodedText);
          applyResult(res);
        },
        () => { /* scan errors are normal — ignore */ }
      );

      setCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      setCameraLoading(false);
      setCameraActive(false);
      scannerRef.current = null;
      if (err?.message?.includes('permission') || err?.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else {
        setCameraError('Could not access camera. Use manual entry instead.');
      }
    }
  };

  // Stop camera when switching tabs or unmounting
  useEffect(() => {
    if (activeTab !== 'camera') {
      stopCamera();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleReset = () => {
    setResult(null);
    setManualInput('');
    setCameraError(null);
  };

  const isValid = result && !('error' in result) && result.isValid;
  const isDenied = result && ('error' in result || !('error' in result) && !result.isValid);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Gate Verification</h1>
        <p className="text-slate-400 mt-1">
          Scan permit QR or enter permit number to allow entry
        </p>
      </div>

      {/* Result Screen — ALLOW / DENY */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 transition-all ${
          isValid
            ? 'border-emerald-500/60 bg-emerald-500/10'
            : 'border-rose-500/60 bg-rose-500/10'
        }`}>
          {/* Gate Status Banner */}
          <div className={`flex items-center justify-center gap-3 mb-6 py-4 rounded-xl ${
            isValid ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          }`}>
            {isValid ? (
              <>
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Gate Status</p>
                  <p className="text-3xl font-black text-emerald-300">ALLOW ENTRY</p>
                </div>
              </>
            ) : (
              <>
                <ShieldX className="w-10 h-10 text-rose-400" />
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">Gate Status</p>
                  <p className="text-3xl font-black text-rose-300">DENY ENTRY</p>
                </div>
              </>
            )}
          </div>

          {'error' in result ? (
            <div className="text-center py-2">
              <p className="text-slate-300 text-sm">{result.error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <QrCode className="w-3 h-3" /> Permit Number
                  </div>
                  <p className="font-mono font-bold text-white tracking-wider">
                    {result.permit.permitNumber}
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <Car className="w-3 h-3" /> Vehicle Plate
                  </div>
                  <p className="font-mono font-bold text-white">
                    {result.permit.vehiclePlate}
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <UserIcon className="w-3 h-3" /> Owner
                  </div>
                  <p className="font-bold text-white">{result.user?.name ?? 'Unknown'}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <Calendar className="w-3 h-3" /> Valid Until
                  </div>
                  <p className="font-medium text-white">
                    {new Date(result.permit.expiryDate).toLocaleDateString(undefined, {
                      month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1 pt-1">
                <Badge variant={result.isValid ? 'success' : 'danger'}>
                  {result.isExpired ? 'EXPIRED' : result.permit.status}
                </Badge>
                <p className="text-xs text-slate-500">
                  Verified {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Next Person
          </button>
        </div>
      )}

      {/* Scanner Card */}
      {!result && (
        <GlassCard className="p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-black/20 p-1 mb-6 gap-1">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'camera'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera Scan
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyboardIcon className="w-4 h-4" />
              Manual Entry
            </button>
          </div>

          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {/* Camera viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black/40 border-2 border-dashed border-white/20 min-h-[280px] flex items-center justify-center">
                {/* html5-qrcode mounts here */}
                <div id={scannerDivId} className="w-full" />

                {/* Overlay when not active */}
                {!cameraActive && !cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm text-center px-8">
                      Point the camera at the user's QR code on their digital permit
                    </p>
                    {cameraError && (
                      <p className="text-rose-400 text-xs text-center px-8">{cameraError}</p>
                    )}
                  </div>
                )}

                {/* Loading overlay */}
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-slate-300 text-sm">Starting camera…</p>
                  </div>
                )}

                {/* Scan frame corners when active */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-indigo-400/60 animate-pulse" />
                  </div>
                )}
              </div>

              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  className="w-full"
                  leftIcon={cameraLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                >
                  {cameraLoading ? 'Starting Camera…' : 'Start Camera'}
                </Button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Stop Camera
                </button>
              )}

              <p className="text-center text-xs text-slate-500">
                Requires camera permission · QR code is on the user's digital permit
              </p>
            </div>
          )}

          {/* Manual Entry Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-black/20 border border-white/10 p-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <KeyboardIcon className="w-7 h-7 text-indigo-400" />
                </div>
                <p className="text-slate-400 text-sm text-center">
                  Enter the permit number from the user's digital permit card
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Permit Number
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                  placeholder="e.g. PRM-2026-001"
                  className="glass-input w-full px-4 font-mono text-lg tracking-widest uppercase"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Format: PRM-YYYY-### · Press Enter or click Verify
                </p>
              </div>

              <Button
                onClick={handleManualVerify}
                disabled={!manualInput.trim()}
                className="w-full"
                leftIcon={<Search className="w-4 h-4" />}
              >
                Verify Permit
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Info strip */}
      {!result && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            All verification events are logged. Only <strong className="text-slate-300">ACTIVE</strong> permits that are not expired will be allowed entry.
          </span>
        </div>
      )}
    </div>
  );
};
