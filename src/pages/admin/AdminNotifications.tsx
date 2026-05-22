import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Button } from '../../components/common/Button';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
export const AdminNotifications = () => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR',
    target: 'ALL'
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to backend to broadcast
    // For demo, we just add it locally (which simulates receiving it)
    addNotification({
      userId: 'system',
      title: formData.title,
      message: formData.message,
      type: formData.type
    });
    toast.success('System notification sent');
    setFormData({
      title: '',
      message: '',
      type: 'INFO',
      target: 'ALL'
    });
  };
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">System Notifications</h1>
        <p className="text-slate-400 mt-1">Send alerts to all users</p>
      </div>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Compose Broadcast
            </h2>
            <p className="text-sm text-slate-400">
              This will appear in users' notification centers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value
              })
              }
              className="glass-input w-full px-4"
              placeholder="e.g. Maintenance Alert" />
            
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Message
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) =>
              setFormData({
                ...formData,
                message: e.target.value
              })
              }
              className="glass-input w-full px-4 min-h-[100px] resize-none"
              placeholder="Enter notification details..." />
            
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as any
                })
                }
                className="glass-input w-full px-4">
                
                <option value="INFO">Information (Blue)</option>
                <option value="WARNING">Warning (Yellow)</option>
                <option value="ERROR">Urgent/Error (Red)</option>
                <option value="SUCCESS">Success (Green)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={formData.target}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  target: e.target.value
                })
                }
                className="glass-input w-full px-4">
                
                <option value="ALL">All Users</option>
                <option value="STUDENTS">Students Only</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="SECURITY">Security Staff</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              leftIcon={<Send className="w-4 h-4" />}>
              
              Send Broadcast
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>);

};