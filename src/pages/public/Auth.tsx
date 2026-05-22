import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { MapPin, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(email);
      toast.success('Logged in successfully');
      navigate('/admin');
    } catch (err: any) {
      if (err?.message === 'PENDING') {
        toast.error('Your account is awaiting approval.');
      } else if (err?.message === 'REJECTED') {
        toast.error('Your account has been rejected.');
      } else {
        toast.error('Invalid credentials. Use admin@parksmart.edu');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070')] bg-cover bg-center opacity-10"></div>

      <GlassCard className="w-full max-w-md relative z-10 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-slate-400 mt-2">Sign in to ParkSmart</p>
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
                placeholder="admin@parksmart.edu" />
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

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Demo Account:</p>
          <p>admin@parksmart.edu (any password)</p>
        </div>
      </GlassCard>
    </div>
  );
};
