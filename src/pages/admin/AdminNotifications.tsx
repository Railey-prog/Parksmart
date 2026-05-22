import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Bell, Send, Users, ShieldCheck, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

type TargetRole = 'ALL' | 'USER' | 'SECURITY' | 'ADMIN';

const targetOptions: { value: TargetRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'ALL',
    label: 'Everyone',
    icon: <Users className="w-4 h-4" />,
    description: 'All users, security staff, and admins'
  },
  {
    value: 'USER',
    label: 'Users Only',
    icon: <UserCircle className="w-4 h-4" />,
    description: 'Students and permit holders'
  },
  {
    value: 'SECURITY',
    label: 'Security Staff',
    icon: <ShieldCheck className="w-4 h-4" />,
    description: 'Security officers only'
  },
  {
    value: 'ADMIN',
    label: 'Admins Only',
    icon: <Bell className="w-4 h-4" />,
    description: 'Administrative staff only'
  }
];

export const AdminNotifications = () => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR',
    targetRole: 'ALL' as TargetRole
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      userId: 'system',
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetRole: formData.targetRole
    });
    const target = targetOptions.find((t) => t.value === formData.targetRole);
    toast.success(`Notification sent to ${target?.label}`);
    setFormData({ title: '', message: '', type: 'INFO', targetRole: 'ALL' });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">System Notifications</h1>
        <p className="text-slate-400 mt-1">Send targeted alerts to specific roles or everyone</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Compose Broadcast</h2>
            <p className="text-sm text-slate-400">Messages appear in the recipient's notification center</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, targetRole: opt.value })}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    formData.targetRole === opt.value
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}>
                  <span className={`mt-0.5 ${formData.targetRole === opt.value ? 'text-indigo-400' : ''}`}>
                    {opt.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input w-full px-4"
              placeholder="e.g. Maintenance Alert" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="glass-input w-full px-4 min-h-[100px] resize-none"
              placeholder="Enter notification details..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notification Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="glass-input w-full px-4">
              <option value="INFO">Information (Blue)</option>
              <option value="WARNING">Warning (Yellow)</option>
              <option value="ERROR">Urgent/Error (Red)</option>
              <option value="SUCCESS">Success (Green)</option>
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" leftIcon={<Send className="w-4 h-4" />}>
              Send to {targetOptions.find((t) => t.value === formData.targetRole)?.label}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
