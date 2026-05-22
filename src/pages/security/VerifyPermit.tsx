import React, { useState, useEffect, useRef } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  QrCode, Search, XCircle, Camera,
  KeyboardIcon, RotateCcw, Car, User as UserIcon,
  Calendar, ShieldCheck, ShieldX, Loader2, AlertTriangle, MapPin, FileText,
  Clock, ParkingSquare, Timer
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

type Tab = 'camera' | 'manual';
type GateMode = 'entry' | 'exit';
type VerifyResult = {
  permit: any;
  user: any;
  isValid: boolean;
  isExpired: boolean;
  activeReservation?: {
    id: string;
    zoneName: string;
    slotName: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };
} | { error: string } | null;

const ZONES = ['Main Entrance', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Visitor Lot', 'Staff Lot'];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const VerifyPermit = () => {
  const { permits, users, zones, reservations, addLog, reportViolation } = useParking();
  const { user: securityUser } = useAuth();
  const [gateMode, setGateMode] = useState<GateMode>('entry');
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<VerifyResult>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    vehiclePlate: '',
    location: 'Main Entrance',
    notes: '',
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-camera-region';

  const resolvePermit = (rawValue: string) => {
    let lookupNum = rawValue.trim();
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

    if (!permit) return { error: 'Permit not found' };

    const owner = users.find((u) => u.id === permit.userId);
    const isExpired = new Date(permit.expiryDate) < new Date();
    const isValid = permit.status === 'ACTIVE' && !isExpired;

    // Find active reservation for this permit holder
    const now = new Date();
    const activeRes = reservations.find(
      (r) =>
        r.userId === permit.userId &&
        r.status === 'ACTIVE' &&
        new Date(r.startTime) <= now &&
        new Date(r.endTime) >= now
    );

    let activeReservation;
    if (activeRes) {
      const zone = zones.find((z) => z.id === activeRes.zoneId);
      const slot = zone?.slots.find((s) => s.id === activeRes.slotId);
      const start = new Date(activeRes.startTime);
      const end = new Date(activeRes.endTime);
      const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      activeReservation = {
        id: activeRes.id,
        zoneName: zone?.name ?? activeRes.zoneId,
        slotName: slot?.name ?? activeRes.slotId,
        startTime: activeRes.startTime,
        endTime: activeRes.endTime,
        durationMinutes,
      };
    }

    return { permit, user: owner, isValid, isExpired, activeReservation };
  };

  const applyResult = (res: VerifyResult, scannedPlate?: string) => {
    setResult(res);
    if (!res) return;
    const isExit = gateMode === 'exit';

    if ('error' in res) {
      addLog({
        type: isExit ? 'EXIT' : 'ENTRY',
        description: `${isExit ? 'Exit' : 'Entry'} DENIED — permit not found (${scannedPlate || manualInput || 'QR scan'})`,
        severity: 'WARNING',
      });
      setReportForm((f) => ({ ...f, vehiclePlate: scannedPlate || manualInput || '' }));
      toast.error(`${isExit ? 'Exit' : 'Entry'} denied — permit not found`);
    } else if (!res.isValid) {
      addLog({
        type: isExit ? 'EXIT' : 'ENTRY',
        description: `${isExit ? 'Exit' : 'Entry'} DENIED — ${res.isExpired ? 'expired' : res.permit.status.toLowerCase()} permit (${res.permit.permitNumber})`,
        vehiclePlate: res.permit.vehiclePlate,
        userId: res.user?.id,
        severity: 'WARNING',
      });
      setReportForm((f) => ({ ...f, vehiclePlate: res.permit.vehiclePlate || '' }));
      toast.error(`${isExit ? 'Exit' : 'Entry'} denied — invalid permit`);
    } else {
      addLog({
        type: isExit ? 'EXIT' : 'ENTRY',
        description: isExit
          ? `Exit CONFIRMED — permit verified (${res.permit.permitNumber}) for ${res.user?.name ?? 'unknown'}${res.activeReservation ? ` · was at ${res.activeReservation.zoneName} slot ${res.activeReservation.slotName}` : ''}`
          : `Entry ALLOWED — permit verified (${res.permit.permitNumber}) for ${res.user?.name ?? 'unknown'}${res.activeReservation ? ` · parked at ${res.activeReservation.zoneName} slot ${res.activeReservation.slotName}` : ''}`,
        vehiclePlate: res.permit.vehiclePlate,
        userId: res.user?.id,
        severity: 'INFO',
      });
      toast.success(isExit ? 'Exit confirmed' : 'Entry allowed');
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
          stopCamera();
          const res = resolvePermit(decodedText);
          applyResult(res);
        },
        () => { /* scan errors are normal */ }
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

  useEffect(() => {
    if (activeTab !== 'camera') stopCamera();
  }, [activeTab]);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleReset = () => {
    setResult(null);
    setManualInput('');
    setCameraError(null);
    setReportForm({ vehiclePlate: '', location: 'Main Entrance', notes: '' });
  };

  const handleOpenReportModal = (prefillPlate?: string) => {
    setReportForm((f) => ({
      ...f,
      vehiclePlate: prefillPlate || (result && !('error' in result) ? result.permit.vehiclePlate : '') || manualInput || '',
    }));
    setShowReportModal(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.vehiclePlate.trim()) return;

    const description = reportForm.notes.trim()
      ? `Unauthorized entry — no valid permit. ${reportForm.notes}`
      : 'Unauthorized entry — no valid permit detected at gate.';

    reportViolation({
      reportedBy: securityUser?.name ?? 'Security Officer',
      vehiclePlate: reportForm.vehiclePlate.toUpperCase().trim(),
      description,
      location: reportForm.location,
    });

    addLog({
      type: 'VIOLATION',
      description: `Violation reported: unauthorized entry (${reportForm.vehiclePlate.toUpperCase()}) at ${reportForm.location}`,
      vehiclePlate: reportForm.vehiclePlate.toUpperCase(),
      severity: 'ERROR',
    });

    setShowReportModal(false);
    setReportForm({ vehiclePlate: '', location: 'Main Entrance', notes: '' });
    toast.success('Violation reported to admin');
  };

  const isDenied = result && ('error' in result || (!('error' in result) && !result.isValid));
  const isAllowed = result && !('error' in result) && result.isValid;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Gate Verification</h1>
        <p className="text-slate-400 mt-1">
          Scan permit QR or enter permit number to verify
        </p>
      </div>

      {/* Gate Mode Toggle */}
      {!result && (
        <div className="flex rounded-xl bg-black/30 border border-white/10 p-1 gap-1">
          <button
            onClick={() => setGateMode('entry')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              gateMode === 'entry'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Entry
          </button>
          <button
            onClick={() => setGateMode('exit')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              gateMode === 'exit'
                ? 'bg-amber-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldX className="w-4 h-4" /> Exit
          </button>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 transition-all ${
          isAllowed
            ? gateMode === 'exit' ? 'border-amber-500/60 bg-amber-500/10' : 'border-emerald-500/60 bg-emerald-500/10'
            : 'border-rose-500/60 bg-rose-500/10'
        }`}>
          {/* Gate Status Banner */}
          <div className={`flex items-center justify-center gap-3 mb-6 py-4 rounded-xl ${
            isAllowed
              ? gateMode === 'exit' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
              : 'bg-rose-500/20'
          }`}>
            {isAllowed ? (
              gateMode === 'exit' ? (
                <>
                  <ShieldX className="w-10 h-10 text-amber-400" />
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Gate Status</p>
                    <p className="text-3xl font-black text-amber-300">EXIT CONFIRMED</p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Gate Status</p>
                    <p className="text-3xl font-black text-emerald-300">ALLOW ENTRY</p>
                  </div>
                </>
              )
            ) : (
              <>
                <ShieldX className="w-10 h-10 text-rose-400" />
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">Gate Status</p>
                  <p className="text-3xl font-black text-rose-300">{gateMode === 'exit' ? 'DENY EXIT' : 'DENY ENTRY'}</p>
                </div>
              </>
            )}
          </div>

          {'error' in result ? (
            <div className="text-center py-2 mb-4">
              <p className="text-slate-300 text-sm">{result.error}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {/* Permit Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <QrCode className="w-3 h-3" /> Permit Number
                  </div>
                  <p className="font-mono font-bold text-white tracking-wider">{result.permit.permitNumber}</p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                    <Car className="w-3 h-3" /> Vehicle Plate
                  </div>
                  <p className="font-mono font-bold text-white">{result.permit.vehiclePlate}</p>
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
                    {new Date(result.permit.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Active Reservation Block */}
              {result.activeReservation ? (
                <div className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ParkingSquare className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">Active Reservation</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                        <MapPin className="w-3 h-3" /> Parking Area
                      </div>
                      <p className="font-bold text-white">{result.activeReservation.zoneName}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                        <ParkingSquare className="w-3 h-3" /> Slot
                      </div>
                      <p className="font-mono font-bold text-white text-lg">{result.activeReservation.slotName}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                        <Clock className="w-3 h-3" /> Start
                      </div>
                      <p className="font-bold text-white">{formatTime(result.activeReservation.startTime)}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                        <Clock className="w-3 h-3" /> End
                      </div>
                      <p className="font-bold text-white">{formatTime(result.activeReservation.endTime)}</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-xs">
                        <Timer className="w-3 h-3" /> Duration
                      </div>
                      <p className="font-bold text-white">{formatDuration(result.activeReservation.durationMinutes)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                isAllowed && (
                  <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-3 flex items-center gap-3">
                    <ParkingSquare className="w-4 h-4 text-slate-500 shrink-0" />
                    <p className="text-xs text-slate-500">No active reservation at this time — permit valid for general entry.</p>
                  </div>
                )
              )}

              <div className="flex items-center justify-between px-1">
                <Badge variant={result.isValid ? 'success' : 'danger'}>
                  {result.isExpired ? 'EXPIRED' : result.permit.status}
                </Badge>
                <p className="text-xs text-slate-500">Verified {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {/* Report button — only shown on DENY */}
          {isDenied && (
            <button
              onClick={() => handleOpenReportModal()}
              className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm font-medium transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Unauthorized Entry to Admin
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
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
                activeTab === 'camera' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" /> Camera Scan
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyboardIcon className="w-4 h-4" /> Manual Entry
            </button>
          </div>

          {/* Camera Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black/40 border-2 border-dashed border-white/20 min-h-[280px] flex items-center justify-center">
                <div id={scannerDivId} className="w-full" />
                {!cameraActive && !cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-sm text-center px-8">
                      Point the camera at the user's QR code on their digital permit
                    </p>
                    {cameraError && <p className="text-rose-400 text-xs text-center px-8">{cameraError}</p>}
                  </div>
                )}
                {cameraLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-slate-300 text-sm">Starting camera…</p>
                  </div>
                )}
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
                <Button onClick={startCamera} className="w-full" leftIcon={cameraLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}>
                  {cameraLoading ? 'Starting Camera…' : 'Start Camera'}
                </Button>
              ) : (
                <button onClick={stopCamera} className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Stop Camera
                </button>
              )}
              <p className="text-center text-xs text-slate-500">Requires camera permission · QR code is on the user's digital permit</p>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Permit Number</label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                  placeholder="e.g. PRM-2026-001"
                  className="glass-input w-full px-4 font-mono text-lg tracking-widest uppercase"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1.5">Format: PRM-YYYY-### · Press Enter or click Verify</p>
              </div>
              <Button onClick={handleManualVerify} disabled={!manualInput.trim()} className="w-full" leftIcon={<Search className="w-4 h-4" />}>
                Verify Permit
              </Button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Report No-Permit Vehicle — standalone */}
      {!result && (
        <GlassCard className="border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Spotted a vehicle without a permit?</p>
              <p className="text-slate-400 text-xs mt-0.5">
                If someone bypassed the gate or is parked without a valid permit, report it directly to the admin.
              </p>
            </div>
            <button
              onClick={() => handleOpenReportModal()}
              className="shrink-0 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Report
            </button>
          </div>
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

      {/* Report Violation Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Unauthorized Entry">
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/80 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            This report will be sent immediately to the admin for review and action.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vehicle Plate <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={reportForm.vehiclePlate}
                onChange={(e) => setReportForm((f) => ({ ...f, vehiclePlate: e.target.value.toUpperCase() }))}
                className="glass-input w-full pl-10 pr-4 font-mono uppercase"
                placeholder="e.g. ABC-1234"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={reportForm.location}
                onChange={(e) => setReportForm((f) => ({ ...f, location: e.target.value }))}
                className="glass-input w-full pl-10 pr-4"
              >
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
            <textarea
              value={reportForm.notes}
              onChange={(e) => setReportForm((f) => ({ ...f, notes: e.target.value }))}
              className="glass-input w-full px-4 py-3 resize-none"
              rows={3}
              placeholder="Describe what happened (optional)"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="flex-1 !bg-rose-600 hover:!bg-rose-500 !border-rose-500/30" leftIcon={<AlertTriangle className="w-4 h-4" />}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
