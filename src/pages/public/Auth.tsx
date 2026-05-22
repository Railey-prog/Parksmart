import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import {
  MapPin, Mail, Lock, User, Car, Layers,
  GraduationCap, ShieldCheck, ArrowLeft, CheckCircle2,
  Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'login' | 'signup';
type SignupStep = 'role-pick' | 'form';
type SignupRole = 'USER' | 'SECURITY';

const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 }
};

export const Login = () => {
  const location = useLocation();
  const locationState = location.state as { mode?: string; role?: SignupRole } | null;

  const [mode, setMode] = useState<Mode>(locationState?.mode === 'signup' ? 'signup' : 'login');
  const [signupStep, setSignupStep] = useState<SignupStep>(locationState?.role ? 'form' : 'role-pick');
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(locationState?.role ?? null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupPlate, setSignupPlate] = useState('');
  const [signupModel, setSignupModel] = useState('');
  const [registering, setRegistering] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const switchMode = (next: Mode) => {
    setMode(next);
    setSignupStep('role-pick');
    setSelectedRole(null);
  };

  const handleRoleSelect = (role: SignupRole) => {
    setSelectedRole(role);
    setSignupStep('form');
  };

  const handleBack = () => {
    setSignupStep('role-pick');
    setSelectedRole(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      // Role-based redirect from stored user
      const stored = localStorage.getItem('parksmart_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'ADMIN') navigate('/admin');
        else if (u.role === 'SECURITY') navigate('/security');
        else navigate('/user');
      } else {
        navigate('/user');
      }
    } catch (err: any) {
      const code = err?.message;
      if (code === 'PENDING') toast.error('Your account is awaiting admin approval.');
      else if (code === 'REJECTED') toast.error('Your account has been rejected.');
      else if (code === 'INVALID_PASSWORD') toast.error('Incorrect password.');
      else toast.error('Account not found. Check your email.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setRegistering(true);
    try {
      await register({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: selectedRole as Role,
        vehiclePlate: selectedRole === 'USER' ? (signupPlate || undefined) : undefined,
        vehicleModel: selectedRole === 'USER' ? (signupModel || undefined) : undefined
      });
      toast.success('Registration submitted! An admin will review your account.');
      switchMode('login');
      setEmail(signupEmail);
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupPlate('');
      setSignupModel('');
    } catch (err: any) {
      const code = err?.message;
      if (code === 'EMAIL_EXISTS') toast.error('An account with that email already exists.');
      else toast.error('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const roleBadgeLabel =
    selectedRole === 'USER' ? 'Student / Staff' : selectedRole === 'SECURITY' ? 'Security Officer' : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070')] bg-cover bg-center opacity-10" />

      <GlassCard className="w-full max-w-md relative z-10 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">ParkSmart</h2>
          <p className="text-slate-400 mt-1 text-sm">
            {mode === 'login'
              ? 'Sign in to your account'
              : signupStep === 'role-pick'
              ? 'Who are you signing up as?'
              : `Registering as ${roleBadgeLabel}`}
          </p>
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
          <button type="button" onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Sign In
          </button>
          <button type="button" onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Login ── */}
          {mode === 'login' && (
            <motion.form key="login" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="your@email.edu" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="••••••••" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loggingIn}>
                {loggingIn ? 'Signing in…' : 'Sign In'}
              </Button>
            </motion.form>
          )}

          {/* ── Sign Up: Role Picker ── */}
          {mode === 'signup' && signupStep === 'role-pick' && (
            <motion.div key="role-pick" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-3">
              <button type="button" onClick={() => handleRoleSelect('USER')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all group text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/25 transition-colors shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Student / Staff</p>
                  <p className="text-xs text-slate-400 mt-0.5">Reserve parking slots, apply for permits, manage your vehicle.</p>
                </div>
              </button>

              <button type="button" onClick={() => handleRoleSelect('SECURITY')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all group text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/25 transition-colors shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Security Officer</p>
                  <p className="text-xs text-slate-400 mt-0.5">Verify permits, log violations, and monitor campus parking activity.</p>
                </div>
              </button>
              <p className="text-[11px] text-slate-600 text-center pt-1">All accounts are reviewed by an admin before activation.</p>
            </motion.div>
          )}

          {/* ── Sign Up: Form ── */}
          {mode === 'signup' && signupStep === 'form' && (
            <motion.div key="signup-form" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={handleBack} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change role
                </button>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${selectedRole === 'SECURITY' ? 'bg-amber-500/15 text-amber-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
                  {selectedRole === 'SECURITY' ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                  {roleBadgeLabel}
                </span>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={signupName} onChange={(e) => setSignupName(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="Jane Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="your@email.edu" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showSignupPassword ? 'text' : 'password'} required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="glass-input w-full pl-9 pr-8" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowSignupPassword((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type={showSignupConfirm ? 'text' : 'password'} required value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="glass-input w-full pl-9 pr-8" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowSignupConfirm((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showSignupConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {selectedRole === 'USER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Vehicle Plate <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={signupPlate} onChange={(e) => setSignupPlate(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="ABC-1234" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Vehicle Model <span className="text-slate-500 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={signupModel} onChange={(e) => setSignupModel(e.target.value)} className="glass-input w-full pl-10 pr-4" placeholder="Toyota Camry" />
                      </div>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full mt-2" disabled={registering}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {registering ? 'Creating account…' : 'Create Account'}
                </Button>
                <p className="text-xs text-slate-500 text-center">New accounts require admin approval before you can sign in.</p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};
