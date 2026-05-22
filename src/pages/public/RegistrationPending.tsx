import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
export const RegistrationPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070')] bg-cover bg-center opacity-10"></div>

      <GlassCard className="w-full max-w-md relative z-10 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Registration Submitted
        </h1>
        <p className="text-slate-300 mb-6">
          Your account is pending admin approval. You'll be able to sign in once
          an administrator reviews and approves your request.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left mb-6">
          <p className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            What happens next?
          </p>
          <ul className="text-sm text-slate-400 space-y-1.5 list-disc list-inside">
            <li>An admin reviews your registration</li>
            <li>You'll receive a notification once approved</li>
            <li>Sign in to access your dashboard</li>
          </ul>
        </div>

        <Link to="/login">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}>
            
            Back to Sign In
          </Button>
        </Link>
      </GlassCard>
    </div>);

};