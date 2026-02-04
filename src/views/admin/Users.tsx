"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, User as UserIcon, Shield, Mail, Phone } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
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
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff & Access</h1><p className="text-slate-500 font-medium">Manage your team and their system permissions</p></div>
        <Button onClick={() => { setEditingUser(null); setFormFullName(''); setFormEmail(''); setFormPhone(''); setFormPassword(''); setFormRole('waiter'); setFormStatus('active'); setIsModalOpen(true); }} className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-black"><Plus size={20} /> Add Personnel</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" /><input placeholder="Search staff..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <select className="px-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none appearance-none cursor-pointer shadow-sm min-w-[180px]" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}><option value="all">All Roles</option><option value="manager">Managers</option><option value="cashier">Cashiers</option><option value="waiter">Waiters</option></select>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? <div className="py-24 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div> : (
          <Table data={filteredUsers} columns={[
            { header: 'Personnel', accessor: (u) => <div className="flex items-center gap-4"><div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black">{(u.full_name || 'U').charAt(0)}</div><div><p className="font-black text-slate-900 leading-tight">{u.full_name || 'Anonymous'}</p><p className="text-xs text-slate-400 font-bold">{u.email}</p></div></div> },
            { header: 'Access Level', accessor: (u) => <Badge variant="neutral" className="capitalize font-black text-[10px] rounded-lg px-2.5 py-1">{u.role}</Badge> },
            { header: 'Status', accessor: (u) => <Badge variant={u.status === 'active' ? 'success' : 'neutral'} className="capitalize font-black text-[10px]">{u.status}</Badge> },
            { header: 'Actions', accessor: (u) => <div className="flex items-center gap-2"><button onClick={() => { setEditingUser(u); setFormFullName(u.full_name||''); setFormEmail(u.email); setFormPhone(u.phone||''); setFormRole(u.role); setFormStatus(u.status); setIsModalOpen(true); }} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600"><Edit size={18} /></button><button onClick={() => setUserToDelete(u)} className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button></div> }
          ]} />
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modify Personnel" : "Onboard New Personnel"} className="max-w-xl" footer={<div className="flex gap-3 w-full"><Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Discard</Button><Button onClick={handleSave} className="flex-1 rounded-xl h-12 bg-[#e60023] hover:bg-[#ad081b] font-black shadow-lg shadow-red-100">Save</Button></div>}>
        <div className="space-y-6 py-2">
          <Input label="Full Legal Name *" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} className="rounded-xl h-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Professional Email *" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="rounded-xl h-12" /><Input label="Phone Number" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="rounded-xl h-12" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Permission Group *</label><select className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer" value={formRole} onChange={(e) => setFormRole(e.target.value)}><option value="waiter">Waiter (View Only)</option><option value="cashier">Cashier (Operational)</option><option value="manager">Manager (Elevated)</option></select></div>
            <div className="w-full"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Account Status</label><select className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option><option value="onboarding">Onboarding</option></select></div>
          </div>
          {formRole !== 'waiter' && <Input type="password" label="Access Password" placeholder={editingUser ? "Leave blank to keep" : "••••••••"} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="rounded-xl h-12" />}
        </div>
      </Modal>
      <ConfirmationDialog isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={async () => { try { await api.users.delete(userToDelete.id || userToDelete._id); showNotification("Account removed", "warning"); fetchUsers(); } catch (error: any) { showNotification("Failed to delete user", "error"); } finally { setUserToDelete(null); } }} title="Revoke Access" description={`Are you sure you want to remove access for ${userToDelete?.full_name}?`} confirmLabel="Confirm Removal" />
    </div>
  );
};
export default Users;
