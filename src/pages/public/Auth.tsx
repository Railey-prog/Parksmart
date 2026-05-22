import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { MapPin, Mail, Lock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { mockUsers } from '../../data/mockData';
import { loadFromStorage } from '../../lib/storage';
import { User } from '../../types';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(email);
      let matched = mockUsers.find((u) => u.email === email);
      if (!matched) {
        const persisted = loadFromStorage<User[]>('users', mockUsers);
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

  const handleResetDemo = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070')] bg-cover bg-center opacity-10"></div>

      <GlassCard className="w-full max-w-md relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">ParkSmart</h2>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
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

          <Button type="submit" className="w-full mt-6">
            Sign In
          </Button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300 mb-1">Demo Accounts (any password):</p>
          <div className="space-y-1">
            <p><span className="text-indigo-400 font-medium">Admin:</span> admin@parksmart.edu</p>
            <p><span className="text-emerald-400 font-medium">User (has permit):</span> jane.doe@parksmart.edu</p>
            <p><span className="text-amber-400 font-medium">User (no permit — apply here):</span> alice.j@parksmart.edu</p>
            <p><span className="text-cyan-400 font-medium">Security:</span> security@parksmart.edu</p>
          </div>
        </div>

        {/* Reset demo data */}
        <button
          onClick={handleResetDemo}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors py-2">
          <RotateCcw className="w-3 h-3" />
          Reset demo data
        </button>
      </GlassCard>
    </div>
  );
};
