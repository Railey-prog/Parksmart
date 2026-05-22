import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  ShieldCheck,
  BarChart3,
  Smartphone,
  ArrowRight } from
'lucide-react';
import { motion } from 'framer-motion';
export const Landing = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleDemoLogin = (role: 'ADMIN' | 'USER' | 'SECURITY') => {
    login('', role);
    navigate(
      role === 'ADMIN' ? '/admin' : role === 'SECURITY' ? '/security' : '/user'
    );
  };
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="p-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            ParkSmart
          </span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" onClick={() => setRoleModalOpen(true)}>
            Register
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{
            opacity: 0,
            y: 30
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.6
          }}
          className="text-center max-w-3xl mx-auto mb-16">
          
          <Badge className="mb-6">Smart Campus Initiative 2026</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Next-Gen Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Parking Allocation
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10">
            Real-time availability, predictive analytics, and digital permits.
            Experience the future of seamless campus mobility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => setRoleModalOpen(true)}>
              
              Get Started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
              document.getElementById('demo')?.scrollIntoView({
                behavior: 'smooth'
              })
              }>
              
              Try Demo
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 w-full mb-24">
          {[
          {
            icon: <Smartphone className="w-8 h-8 text-indigo-400" />,
            title: 'Live Availability',
            desc: 'Check real-time slot status and reserve instantly from your device.'
          },
          {
            icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
            title: 'Digital Permits',
            desc: 'QR-based permits for seamless entry and automated verification.'
          },
          {
            icon: <BarChart3 className="w-8 h-8 text-amber-400" />,
            title: 'Predictive AI',
            desc: 'Smart analytics predict peak hours to help you plan your arrival.'
          }].
          map((feature, i) =>
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6,
              delay: 0.2 + i * 0.1
            }}>
            
              <GlassCard className="h-full text-center p-8">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          )}
        </div>

        <div
          id="demo"
          className="w-full max-w-5xl pt-10 border-t border-white/10">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Interactive Demo
            </h2>
            <p className="text-slate-400">
              Select a role below to explore the system without creating an
              account.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard
              hoverEffect
              onClick={() => handleDemoLogin('USER')}
              className="text-center group">
              
              <div className="w-16 h-16 mx-auto bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Student / Faculty
              </h3>
              <p className="text-sm text-slate-400">
                Find parking, make reservations, and manage digital permits.
              </p>
            </GlassCard>

            <GlassCard
              hoverEffect
              onClick={() => handleDemoLogin('SECURITY')}
              className="text-center group">
              
              <div className="w-16 h-16 mx-auto bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Security Staff
              </h3>
              <p className="text-sm text-slate-400">
                Verify permits, log entries, and monitor violations.
              </p>
            </GlassCard>

            <GlassCard
              hoverEffect
              onClick={() => handleDemoLogin('ADMIN')}
              className="text-center group">
              
              <div className="w-16 h-16 mx-auto bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                System Admin
              </h3>
              <p className="text-sm text-slate-400">
                Manage zones, users, analytics, and system configurations.
              </p>
            </GlassCard>
          </div>
        </div>
      </main>

      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <GlassCard className="w-full max-w-md p-8 relative">
            <button
              onClick={() => setRoleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Close">
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-3">
              Choose your role
            </h2>
            <p className="text-slate-400 mb-6">
              Select if you are a Student or Security before creating your account.
            </p>
            <div className="grid gap-4">
              <Button
                className="w-full"
                onClick={() => {
                  setRoleModalOpen(false);
                  navigate('/register?role=USER');
                }}>
                Register as Student
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setRoleModalOpen(false);
                  navigate('/register?role=SECURITY');
                }}>
                Register as Security
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>);

};
// Simple Badge component for Landing page
const Badge = ({
  children,
  className



}: {children: React.ReactNode;className?: string;}) =>
<span
  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 ${className || ''}`}>
  
    {children}
  </span>;