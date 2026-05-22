import React, { useState } from 'react';
import { useParking } from '../../contexts/ParkingContext';
import { GlassCard } from '../../components/common/GlassCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Check, X, Edit2, Trash2, Plus, Search, ChevronDown } from 'lucide-react';
import { User, Role } from '../../types';
export const AdminUsers = () => {
  const { users, updateUserStatus, createUser, updateUser, deleteUser } =
  useParking();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'USER',
    status: 'APPROVED'
  });
  const matchesSearch = (u: User) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase());
  const matchesRole = (u: User) => roleFilter === 'ALL' || u.role === roleFilter;
  const matchesStatus = (u: User) => statusFilter === 'ALL' || u.status === statusFilter;

  // Main user list: exclude rejected users (they are shown in the Rejected panel)
  const visibleUsers = users.filter(
    (u) => matchesSearch(u) && matchesRole(u) && matchesStatus(u) && u.status !== 'REJECTED'
  );

  // Rejected users panel (separate from main management table)
  const rejectedUsers = users.filter((u) => u.status === 'REJECTED' && matchesSearch(u) && matchesRole(u));
  const handleOpenModal = (user?: User) => {
    if (user?.role === 'ADMIN') {
      return;
    }
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        status: 'APPROVED'
      });
    }
    setIsModalOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      if (editingUser.role === 'ADMIN') {
        return;
      }
      updateUser(editingUser.id, formData);
    } else {
      const created = createUser(formData as Omit<User, 'id'>);
      if (!created) return; // do not close modal on duplicate error
    }
    setIsModalOpen(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage accounts and roles</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}>
          
          Add User
        </Button>
      </div>

      <GlassCard className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4" />
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="text-slate-300 text-sm font-medium">Filter by</div>
          <div className="space-y-2">
            <div className="text-slate-400 text-xs uppercase tracking-[0.2em]">Role</div>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'USER', 'SECURITY', 'ADMIN'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    roleFilter === role
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}>
                  {role === 'ALL' ? 'All' : role === 'USER' ? 'Users' : role === 'SECURITY' ? 'Security' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-slate-400 text-xs uppercase tracking-[0.2em]" htmlFor="statusFilter">
              Status
            </label>
            <div className="relative">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="glass-input theme-select w-full pr-10 pl-4 py-2 text-sm text-white bg-slate-950/95 border border-slate-800 appearance-none"
                style={{ colorScheme: 'dark' }}>
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 text-slate-300 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-slate-400 text-sm">
          Showing <span className="text-white font-semibold">{visibleUsers.length}</span> account{visibleUsers.length !== 1 ? 's' : ''} (from database)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-300">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No accounts match the current filters.</td>
                </tr>
              )}
              {visibleUsers.map((u) =>
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{u.name}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <Badge
                    variant={
                    u.role === 'ADMIN' ?
                    'danger' :
                    u.role === 'SECURITY' ?
                    'warning' :
                    'info'
                    }>
                    
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                    variant={
                    u.status === 'APPROVED' ?
                    'success' :
                    u.status === 'PENDING' ?
                    'warning' :
                    'danger'
                    }>
                    
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === 'PENDING' &&
                    <>
                          <button
                        onClick={() => updateUserStatus(u.id, 'APPROVED')}
                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                        title="Approve">
                        
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => updateUserStatus(u.id, 'REJECTED')}
                        className="p-1.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30"
                        title="Reject">
                        
                            <X className="w-4 h-4" />
                          </button>
                        </>
                    }
                      <button
                      onClick={() => handleOpenModal(u)}
                      disabled={u.role === 'ADMIN'}
                      className={
                        `p-1.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-600/20 text-slate-500 cursor-not-allowed'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`
                      }
                      title={u.role === 'ADMIN' ? 'Admin accounts cannot be edited' : 'Edit'}>
                      
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                      onClick={() => deleteUser(u.id)}
                      disabled={u.role === 'ADMIN'}
                      className={
                        `p-1.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-600/20 text-slate-500 cursor-not-allowed'
                            : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                        }`
                      }
                      title={u.role === 'ADMIN' ? 'Admin accounts cannot be deleted' : 'Delete'}>
                      
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Rejected registrations panel */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Rejected Registrations</h2>
          <p className="text-sm text-slate-400">Users rejected by admin</p>
        </div>
        {rejectedUsers.length === 0 ? (
          <div className="p-6 text-slate-400">No rejected registrations</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rejectedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{u.name}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          u.role === 'ADMIN' ? 'danger' : u.role === 'SECURITY' ? 'warning' : 'info'
                        }>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="danger">{u.status}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateUserStatus(u.id, 'APPROVED')}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                          title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-1.5 bg-rose-500/20 text-rose-400 rounded hover:bg-rose-500/30"
                          title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add User'}>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value
              })
              }
              className="glass-input w-full px-4" />
            
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as Role
                })
                }
                className="glass-input w-full px-4">
                
                <option value="USER">Student/Faculty</option>
                <option value="SECURITY">Security</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as any
                })
                }
                className="glass-input w-full px-4">
                
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>);

};