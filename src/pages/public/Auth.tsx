import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useParking } from '../../contexts/ParkingContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { MapPin, Mail, Lock, User, Car } from 'lucide-react';
import { toast } from 'sonner';
import { loadFromStorage } from '../../lib/storage';
import { mockUsers } from '../../data/mockData';
export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In demo, we just use email to find user, password ignored
      login(email);
      // Look up the user across seed accounts AND persisted registrations
      let matched = mockUsers.find((u) => u.email === email);
      if (!matched) {
        const persisted = loadFromStorage<User[]>('users', mockUsers);
        matched = persisted.find((u) => u.email === email);
      }
      toast.success('Logged in successfully');
      if (matched?.role === 'ADMIN') navigate('/admin');else
      if (matched?.role === 'SECURITY') navigate('/security');else
      navigate('/user');
    } catch (err: any) {
      if (err?.message === 'PENDING') {
        toast.error('Your account is awaiting admin approval.');
      } else if (err?.message === 'REJECTED') {
        toast.error('Your registration was rejected. Contact the admin office.');
      } else {
        toast.error('Invalid credentials. Try admin@parksmart.edu');
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
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
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

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300">
            
            Register here
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">Demo Accounts:</p>
          <ul className="space-y-1">
            <li>Admin: admin@parksmart.edu</li>
            <li>User: jane.doe@parksmart.edu</li>
            <li>Security: security@parksmart.edu</li>
          </ul>
        </div>
      </GlassCard>
    </div>);

};
export const Register = () => {
  const { createUser } = useParking();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'SECURITY' | 'ADMIN' | '';
    vehiclePlate: string;
    vehicleModel: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: '',
    vehiclePlate: '',
    vehicleModel: ''
  });
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'USER' || roleParam === 'SECURITY') {
      setFormData((prev) => ({ ...prev, role: roleParam }));
      setRoleModalOpen(false);
    } else {
      setRoleModalOpen(true);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      toast.error('Please select whether you are a Student or Security');
      return;
    }
    // Add to the central user list so admins see them as PENDING.
    // We do NOT auto-login — they must wait for admin approval.
    const created = createUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      vehiclePlate: formData.vehiclePlate,
      vehicleModel: formData.vehicleModel,
      status: 'PENDING'
    });
    if (!created) return; // duplicate - createUser already showed an error

    addNotification({
      title: formData.role === 'ADMIN' ? 'Admin access requested' : 'New user registration',
      message:
        formData.role === 'ADMIN'
          ? `${formData.name} requested admin access and is pending approval.`
          : `${formData.name} registered and is pending approval.`,
      type: 'INFO'
    });
    toast.success('Registration submitted for approval');
    navigate('/registration-pending');
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative">
      <GlassCard className="w-full max-w-md relative z-10 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 mt-2">Join ParkSmart Campus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.role ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-slate-200">
              Registering as{' '}
              <span className="font-semibold text-white">
                {formData.role === 'SECURITY' ? 'Security' : 'Student'}
              </span>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-slate-200 space-y-4">
              <p className="text-sm text-slate-400">
                Select your role below before registering.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  className="w-full"
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'USER' }))}>
                  Register as Student
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'SECURITY' }))}>
                  Register as Security
                </Button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                }
                className="glass-input w-full pl-10 pr-4"
                placeholder="John Doe" />
              
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              University Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
                }
                className="glass-input w-full pl-10 pr-4"
                placeholder="john@parksmart.edu" />
              
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
                value={formData.password}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
                }
                className="glass-input w-full pl-10 pr-4"
                placeholder="••••••••" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Vehicle Information (Optional)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Enter vehicle details if you want parking access tied to a car.
              Security staff can also provide this optionally.
            </p>
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.vehiclePlate}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehiclePlate: e.target.value
                    })
                    }
                    className="glass-input w-full pl-10 pr-4"
                    placeholder="License Plate (e.g. ABC-1234)" />
                  
                </div>
              </div>
              <div>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleModel: e.target.value
                  })
                  }
                  className="glass-input w-full px-4"
                  placeholder="Vehicle Make & Model" />
                
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6">
            Register
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      </GlassCard>

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
              Select whether you are a Student or Security before registering.
            </p>
            <div className="grid gap-4">
              <Button
                className="w-full"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role: 'USER' }));
                  setRoleModalOpen(false);
                }}>
                Register as Student
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, role: 'SECURITY' }));
                  setRoleModalOpen(false);
                }}>
                Register as Security
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>);

};