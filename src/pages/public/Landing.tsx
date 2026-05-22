import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  ShieldCheck,
  BarChart3,
  Smartphone,
  ArrowRight,
  Bell,
  QrCode,
  Calendar,
  Users,
  Map,
  AlertTriangle,
  Zap,
  Lock,
  FileText,
  GraduationCap,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SignupRole = 'USER' | 'SECURITY';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay }
});

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase">
    {children}
  </span>
);

const GradientCard = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 hover:bg-white/[0.07] transition-colors ${className}`}>
    {children}
  </div>
);

/* ── Role Picker Modal ── */
const RolePickerModal = ({
  onSelect,
  onClose
}: {
  onSelect: (role: SignupRole) => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-white/8">
          <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Who are you joining as?</h2>
          <p className="text-sm text-slate-400 mt-1">Choose your role to get started with the right account.</p>
        </div>

        {/* Role Cards */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {/* Student / Staff */}
          <button
            onClick={() => onSelect('USER')}
            className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all text-left focus:outline-none">
            {/* Image */}
            <div className="h-40 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop"
                alt="Students"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            {/* Content */}
            <div className="relative p-4 bg-slate-900 group-hover:bg-indigo-950/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-white">Student / Staff</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reserve slots, apply for permits & manage your vehicle.
              </p>
            </div>
          </button>

          {/* Security Officer */}
          <button
            onClick={() => onSelect('SECURITY')}
            className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all text-left focus:outline-none">
            {/* Image */}
            <div className="h-40 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=600&auto=format&fit=crop"
                alt="Security"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            {/* Content */}
            <div className="relative p-4 bg-slate-900 group-hover:bg-amber-950/30 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-white">Security Officer</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify permits, log violations & monitor campus activity.
              </p>
            </div>
          </button>
        </div>

        <p className="px-8 pb-6 text-center text-[11px] text-slate-600">
          All accounts require admin approval before activation.
        </p>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ── Data ── */
const stats = [
  { value: '4', label: 'Parking Zones', suffix: '' },
  { value: '84', label: 'Total Slots', suffix: '+' },
  { value: '3', label: 'User Roles', suffix: '' },
  { value: '99', label: 'Uptime', suffix: '%' }
];

const coreFeatures = [
  {
    icon: <Map className="w-6 h-6" />,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    title: 'Live Parking Map',
    desc: 'Interactive real-time map showing slot availability across all campus zones — updated every 5 seconds.'
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    title: 'Slot Reservations',
    desc: 'Reserve a specific parking slot in advance. The system automatically releases it when time expires.'
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    title: 'Digital Permits',
    desc: 'Apply for a permit online. Once approved, receive a QR code for seamless entry and verification.'
  },
  {
    icon: <Bell className="w-6 h-6" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    title: 'Role-Based Notifications',
    desc: 'Targeted alerts for each role — users get reservation updates, security gets violation alerts, admins get system events.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    title: 'Permit Verification',
    desc: 'Security staff can scan QR codes or search plates to instantly verify permit validity in the field.'
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    title: 'Violation Reporting',
    desc: 'Security officers log violations with vehicle plates, location, and description — admin is notified instantly.'
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    title: 'Analytics & Reports',
    desc: 'Hourly demand charts, weekly trends, zone utilization heatmaps, and monthly occupancy reports.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: 'text-pink-400',
    bg: 'bg-pink-500/15',
    title: 'User Management',
    desc: 'Admins can create, edit, and approve users. New registrations are held pending until reviewed.'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    color: 'text-teal-400',
    bg: 'bg-teal-500/15',
    title: 'Activity Logs',
    desc: 'Full audit trail of every entry, exit, system event, and violation with timestamps and severity levels.'
  }
];

const roles = [
  {
    role: 'Student / Faculty',
    color: 'indigo',
    icon: <Smartphone className="w-7 h-7" />,
    features: [
      'View live parking map and slot availability',
      'Reserve a slot for a set duration',
      'Apply for a digital parking permit',
      'Download QR code for entry',
      'Receive reservation and permit notifications'
    ]
  },
  {
    role: 'Security Officer',
    color: 'amber',
    icon: <ShieldCheck className="w-7 h-7" />,
    features: [
      'Scan QR codes to verify permits instantly',
      'Search vehicles by plate number',
      'File and track violation reports',
      'Log entries and exits in real time',
      'View full activity log for the campus'
    ]
  },
  {
    role: 'System Admin',
    color: 'rose',
    icon: <BarChart3 className="w-7 h-7" />,
    features: [
      'Manage users, roles, and account approvals',
      'Create and configure parking zones & slots',
      'Approve or revoke parking permits',
      'Send targeted system broadcasts',
      'Access full analytics and violation reports'
    ]
  }
];

const howItWorks = [
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Create an Account',
    desc: 'Sign up with your campus email. An admin reviews and approves your account within minutes.'
  },
  {
    icon: <QrCode className="w-5 h-5" />,
    title: 'Apply for a Permit',
    desc: 'Submit your vehicle details to request a parking permit. Track approval status in real time.'
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: 'Reserve Your Spot',
    desc: 'Open the live map, pick an available slot, set your duration, and confirm in one tap.'
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Park with Confidence',
    desc: 'Show your QR permit at the gate. Security verifies instantly — no paperwork, no delays.'
  }
];

/* ── Component ── */
export const Landing = () => {
  const navigate = useNavigate();
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handleRoleSelect = (role: SignupRole) => {
    setShowRolePicker(false);
    navigate('/login', { state: { mode: 'signup', role } });
  };

  const openRolePicker = () => setShowRolePicker(true);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Role picker modal */}
      {showRolePicker && (
        <RolePickerModal
          onSelect={handleRoleSelect}
          onClose={() => setShowRolePicker(false)}
        />
      )}

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ParkSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </button>
            <Button
              size="sm"
              onClick={openRolePicker}
              rightIcon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">

        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div {...fadeUp(0)}>
            <Chip>Smart Campus Initiative 2026</Chip>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="mt-6 text-5xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight">
            Campus Parking,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ParkSmart brings real-time availability, digital permits, QR-based verification,
            and powerful analytics together into one intelligent campus parking platform.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={openRolePicker}>
              Create Free Account
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </Button>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.05)} className="text-center">
                <p className="text-4xl font-extrabold text-white">
                  {s.value}<span className="text-indigo-400">{s.suffix}</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Core Features ── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <Chip>Everything You Need</Chip>
            <h2 className="mt-4 text-4xl font-bold text-white">
              Built for Every Role on Campus
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              From student drivers to security officers and system administrators —
              every workflow is covered.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreFeatures.map((f, i) => (
              <motion.div key={i} {...fadeUp(0.05 + i * 0.04)}>
                <GradientCard className="h-full">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </GradientCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <motion.div {...fadeUp(0)} className="text-center mb-14">
              <Chip>Simple Process</Chip>
              <h2 className="mt-4 text-4xl font-bold text-white">How It Works</h2>
              <p className="mt-3 text-slate-400 max-w-xl mx-auto">
                Get from sign-up to parked in four easy steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
              {howItWorks.map((step, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.08)} className="text-center relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 relative z-10">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roles Section ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <Chip>Multi-Role Platform</Chip>
            <h2 className="mt-4 text-4xl font-bold text-white">One System, Three Perspectives</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Each role gets a dedicated, purpose-built dashboard with the exact tools they need.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r, i) => {
              const colors: Record<string, { border: string; iconBg: string; iconText: string; bullet: string; badge: string }> = {
                indigo: { border: 'border-indigo-500/30', iconBg: 'bg-indigo-500/20', iconText: 'text-indigo-400', bullet: 'bg-indigo-500', badge: 'bg-indigo-500/15 text-indigo-300' },
                amber: { border: 'border-amber-500/30', iconBg: 'bg-amber-500/20', iconText: 'text-amber-400', bullet: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-300' },
                rose: { border: 'border-rose-500/30', iconBg: 'bg-rose-500/20', iconText: 'text-rose-400', bullet: 'bg-rose-500', badge: 'bg-rose-500/15 text-rose-300' }
              };
              const c = colors[r.color];
              return (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.08)}>
                  <div className={`rounded-2xl bg-white/[0.04] border ${c.border} backdrop-blur-sm p-7 h-full hover:bg-white/[0.07] transition-colors`}>
                    <div className={`w-14 h-14 rounded-2xl ${c.iconBg} ${c.iconText} flex items-center justify-center mb-5`}>
                      {r.icon}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>{r.role}</span>
                    <ul className="mt-5 space-y-3">
                      {r.features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.bullet} mt-1.5 shrink-0`} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <motion.div
            {...fadeUp(0)}
            className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-emerald-600/10 p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Get started today</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Ready to park smarter?
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Join ParkSmart and say goodbye to circling the lot. Sign up for free —
                your account is reviewed and approved within minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={openRolePicker}>
                  Sign Up Free
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">ParkSmart</span>
          </div>
          <p className="text-xs text-slate-600">© 2026 ParkSmart — Intelligent Campus Parking Management</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <span>Real-time Updates</span>
            <span>QR Permits</span>
            <span>Multi-role Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
