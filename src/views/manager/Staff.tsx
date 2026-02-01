import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
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
  const [formRole, setFormRole] = useState<UserRole>('staff');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await api.users.getAll();
      // Only show staff and cashiers for this branch
      // (Backend already filters by branch_id if implemented in factory/controller)
      setUsers(userData.filter((u: User) => ['staff', 'cashier'].includes(u.role)));
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
        status: formStatus,
        branch_id: currentUser?.branch_id
      };

      if (formPassword) {
        userData.password = formPassword;
      }

      if (editingUser) {
        await api.users.update(editingUser.id, userData);
        showNotification("Staff member updated successfully");
      } else {
        await api.users.create(userData);
        showNotification("Staff member created successfully");
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
        await api.users.delete(userToDelete.id);
        showNotification("Staff member deleted successfully", "warning");
        fetchUsers();
      } catch (error: any) {
        showNotification(error.message || "Failed to delete user", "error");
      } finally {
        setUserToDelete(null);
      }
    }
  };

  if (!currentUser?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <Users size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="cashier">Cashier</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingUser(null);
          setFormFullName('');
          setFormEmail('');
          setFormPhone('');
          setFormPassword('');
          setFormRole('staff');
          setFormStatus('active');
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add Staff Member
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading staff...</div>
      ) : (
        <Table
          data={filteredUsers}
          columns={[
            { header: 'Full Name', accessor: (u) => u.full_name || u.username || 'N/A' },
            { header: 'Email', accessor: 'email' },
            {
              header: 'Role',
              accessor: (user) => (
                <Badge variant="neutral" className="capitalize w-fit">{user.role}</Badge>
              )
            },
            {
              header: 'Status',
              accessor: (user) => (
                <Badge variant={user.status === 'active' ? 'success' : 'error'} className="capitalize">
                  {user.status}
                </Badge>
              )
            },
            {
              header: 'Actions',
              accessor: (user) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
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
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setUserToDelete(user)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Edit Staff Member" : "Add New Staff Member"}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create Member"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. John Doe"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="john@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="555-0123"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>
          <Input
            label={editingUser ? "New Password (leave blank to keep current)" : "Password *"}
            type="password"
            placeholder="••••••••"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
            >
              <option value="staff">Staff</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as UserStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Staff;
