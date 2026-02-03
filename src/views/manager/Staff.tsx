import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, ShieldCheck } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import type { User, UserRole, UserStatus } from '../../types';

const Staff: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('waiter');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      const userData = Array.isArray(response) ? response : response.data || [];
      // Only show operational roles
      setUsers(userData.filter((u: User) => ['manager', 'cashier', 'waiter'].includes(u.role)));
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      showNotification(error.message || "Failed to load staff", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.full_name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleSave = async () => {
    if (!formFullName || !formEmail || (!editingUser && !formPassword)) {
      showNotification("Please fill in required fields", "error");
      return;
    }

    try {
      const userData: any = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone || 'N/A',
        role: formRole,
        status: formStatus
      };

      if (formPassword) {
        userData.password = formPassword;
      }

      if (editingUser) {
        await api.users.update(editingUser.id || editingUser._id!, userData);
        showNotification("Staff profile updated successfully");
      } else {
        await api.users.createStaff(userData);
        showNotification("New staff member registered");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      showNotification(error.message || "Failed to save user", "error");
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await api.users.delete(userToDelete.id || userToDelete._id!);
        showNotification("Staff member removed", "warning");
        fetchUsers();
      } catch (error: any) {
        showNotification(error.message || "Failed to delete user", "error");
      } finally {
        setUserToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 font-medium">Manage permissions and personnel for your business</p>
        </div>
        <Button
          className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100"
          onClick={() => {
            setEditingUser(null);
            setFormFullName('');
            setFormEmail('');
            setFormPhone('');
            setFormPassword('');
            setFormRole('waiter');
            setFormStatus('active');
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} /> Add Personnel
        </Button>
      </div>

      <Card className="p-6 border-slate-100 rounded-[2rem] shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-600"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="manager">Managers</option>
            <option value="cashier">Cashiers</option>
            <option value="waiter">Waiters</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No staff members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div
                key={user.id || user._id}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[150px]">
                        {user.full_name || 'Unnamed User'}
                      </h3>
                      <Badge variant="neutral" className="mt-1 font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-500 border-none">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setFormFullName(user.full_name || '');
                        setFormEmail(user.email);
                        setFormPhone(user.phone || '');
                        setFormPassword('');
                        setFormRole(user.role);
                        setFormStatus(user.status);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setUserToDelete(user)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Mail size={16} className="text-slate-300" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Phone size={16} className="text-slate-300" />
                    <span>{user.phone || 'No phone'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      user.status === 'active' ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {user.status}
                    </span>
                  </div>
                  {user.role === 'manager' && (
                    <ShieldCheck size={18} className="text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Edit Profile" : "New Team Member"}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}>Cancel</Button>
            <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100" onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Full Name *"
            placeholder="e.g. John Doe"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            className="rounded-xl"
          />
          <div className="space-y-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="john@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="rounded-xl"
            />
            <Input
              label="Phone Number"
              placeholder="+251..."
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Input
            label={editingUser ? "New Password (Optional)" : "Password *"}
            type="password"
            placeholder="••••••••"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            className="rounded-xl"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Role</label>
              <select
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
              >
                <option value="waiter">Waiter</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
              <select
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as UserStatus)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Staff Member"
        description={`Are you sure you want to remove ${userToDelete?.full_name || userToDelete?.email}? Access will be revoked immediately.`}
        confirmLabel="Remove Member"
      />
    </div>
  );
};

export default Staff;
