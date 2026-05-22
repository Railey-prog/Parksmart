import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { MapPin, Mail, Lock, User, Car, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '../../data/mockData';
import { loadFromStorage } from '../../lib/storage';
import { User as UserType } from '../../types';

type Mode = 'login' | 'signup';

export const Login = () => {
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPlate, setSignupPlate] = useState('');
  const [signupModel, setSignupModel] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(email);
      let matched = mockUsers.find((u) => u.email === email);
      if (!matched) {
        const persisted = loadFromStorage<UserType[]>('users', mockUsers);
        matched = persisted.find((u) => u.email === email);
      }
      toast.success('Logged in successfully');
      if (matched?.role === 'ADMIN') navigate('/admin');
      else if (matched?.role === 'SECURITY') navigate('/security');
      else navigate('/user');
    } catch (err: any) {
      if (err?.message === 'PENDING') {
        toast.error('Your account is awaiting admin approval.');
      } else if (err?.message === 'REJECTED') {
        toast.error('Your account has been rejected.');
      } else {
        toast.error('Account not found. Check your email.');
      }
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      register({
        name: signupName,
        email: signupEmail,
        vehiclePlate: signupPlate || undefined,
        vehicleModel: signupModel || undefined
      });
      toast.success('Registration submitted! An admin will review your account.');
      setMode('login');
      setEmail(signupEmail);
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setSignupPlate('');
      setSignupModel('');
    } catch (err: any) {
      if (err?.message === 'EMAIL_EXISTS') {
        toast.error('An account with that email already exists.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070')] bg-cover bg-center opacity-10"></div>

      <GlassCard className="w-full max-w-md relative z-10 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">ParkSmart</h2>
          <p className="text-slate-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}>
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'signup'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}>
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="your@email.edu" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="••••••••" />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">Sign In</Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="Jane Smith" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="your@email.edu" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="glass-input w-full pl-9 pr-3"
                    placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="glass-input w-full pl-9 pr-3"
                    placeholder="••••••••" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vehicle Plate <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={signupPlate}
                  onChange={(e) => setSignupPlate(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="ABC-1234" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vehicle Model <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={signupModel}
                  onChange={(e) => setSignupModel(e.target.value)}
                  className="glass-input w-full pl-10 pr-4"
                  placeholder="Toyota Camry" />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2">Create Account</Button>
            <p className="text-xs text-slate-500 text-center">
              New accounts require admin approval before you can sign in.
            </p>
          </form>
        )}
      </GlassCard>
    </div>
  );
};
