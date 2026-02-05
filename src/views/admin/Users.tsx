"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User as UserIcon, Shield, Mail, Phone } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, MobileTableCard } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '../../utils/cn';

const Users: React.FC = () => {
  const { user: currentUser, currentBusiness } = useAuth();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<string>('waiter');
  const [formStatus, setFormStatus] = useState<string>('active');

  useEffect(() => { fetchUsers(); }, [currentBusiness]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.getAll();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) { showNotification("Failed to load staff", "error"); } finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleSave = async () => {
    if (!formFullName || !formEmail) { showNotification("Name and email required", "error"); return; }
    if (!editingUser && formRole !== 'waiter' && !formPassword) { showNotification("Password required", "error"); return; }
    try {
      const userData = { full_name: formFullName, email: formEmail, phone: formPhone, role: formRole, status: formStatus, password: formPassword || undefined };
      if (editingUser) await api.users.update(editingUser.id || editingUser._id, userData);
      else await api.users.createStaff(userData);
      showNotification("Staff member saved"); setIsModalOpen(false); fetchUsers();
    } catch (error: any) { showNotification(error.message || "Failed to save user", "error"); }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await api.users.delete(userToDelete.id || userToDelete._id);
        showNotification("Account removed", "warning");
        fetchUsers();
      } catch (error: any) { showNotification("Failed to delete user", "error"); }
      finally { setUserToDelete(null); }
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormFullName(user.full_name || '');
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword('');
    setIsModalOpen(true);
  };

  const roleOptions = [
    { value: 'waiter', label: 'Waiter' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  const columns = [
    {
      header: 'Personnel',
      accessor: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
            {(u.full_name || 'U').charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{u.full_name || 'Anonymous'}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (u: any) => (
        <Badge variant="neutral" size="sm" className="capitalize">
          {u.role}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessor: (u: any) => (
        <Badge variant={u.status === 'active' ? 'success' : 'neutral'} size="sm">
          {u.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (u: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(u)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => setUserToDelete(u)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-36 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Staff</h1>
          <p className="text-slate-500 text-sm">Manage team members</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setFormFullName(''); setFormEmail(''); setFormPhone(''); setFormPassword(''); setFormRole('waiter'); setFormStatus('active'); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> Add Staff
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search staff..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 min-w-[140px]"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage="No staff members found"
        />
      </div>

      {/* Mobile Cards */}
      <MobileTableCard
        data={filteredUsers}
        columns={columns}
        loading={loading}
        emptyMessage="No staff members found"
        renderCard={(u) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                {(u.full_name || 'U').charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{u.full_name || 'Anonymous'}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm" className="capitalize">{u.role}</Badge>
                  <Badge variant={u.status === 'active' ? 'success' : 'neutral'} size="sm">{u.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal(u)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Edit size={16} />
              </button>
              <button onClick={() => setUserToDelete(u)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Staff" : "Add New Staff"}
        size="lg"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editingUser ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Staff name"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              placeholder="email@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="+251..."
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
              >
                {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
              >
                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          {!editingUser && formRole !== 'waiter' && (
            <Input
              label="Password *"
              type="password"
              placeholder="Enter password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
            />
          )}
          {editingUser && (
            <p className="text-xs text-slate-500">Leave password blank to keep current password</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Staff"
        description={`Are you sure you want to remove ${userToDelete?.full_name}?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
};

export default Users;
