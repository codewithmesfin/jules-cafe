import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('customer');
  const [formBranchId, setFormBranchId] = useState('');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formCustomerType, setFormCustomerType] = useState<'regular' | 'vip' | 'member'>('regular');
  const [formDiscountRate, setFormDiscountRate] = useState(0);

  // Effect to handle branch field visibility based on role changes
  useEffect(() => {
    // Clear branch selection when role doesn't require a branch
    if (!['manager', 'cashier', 'staff'].includes(formRole)) {
      setFormBranchId('');
    }
  }, [formRole]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [userData, branchData] = await Promise.all([
        api.users.getAll(),
        api.branches.getAll()
      ]);
      setUsers(userData);
      setBranches(branchData);
      if (branchData.length === 0) {
        showNotification("No branches found. Please create a branch first.", "warning");
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showNotification("Failed to load branches. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.full_name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
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
        branch_id: ['manager', 'cashier', 'staff'].includes(formRole) ? formBranchId || undefined : undefined,
        customer_type: formRole === 'customer' ? formCustomerType : undefined,
        discount_rate: formRole === 'customer' ? formDiscountRate : undefined
      };

      if (formPassword) {
        userData.password = formPassword;
      }

      if (editingUser) {
        await api.users.update(editingUser.id, userData);
        showNotification("User updated successfully");
      } else {
        if (!userData.password) userData.password = 'password123';
        await api.users.create(userData);
        showNotification("User created successfully");
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
        showNotification("User deleted successfully", "warning");
        fetchUsers();
      } catch (error: any) {
        showNotification(error.message || "Failed to delete user", "error");
      } finally {
        setUserToDelete(null);
      }
    }
  };

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
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <Button className="gap-2" onClick={() => {
          setEditingUser(null);
          setFormFullName('');
          setFormEmail('');
          setFormPhone('');
          setFormPassword('');
          setFormRole('customer');
          setFormBranchId('');
          setFormStatus('active');
          setIsModalOpen(true);
        }}>
          <Plus size={20} /> Add User
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading users...</div>
      ) : (
        <Table
          data={filteredUsers}
          columns={[
            { header: 'Full Name', accessor: (u) => u.full_name || u.username || 'N/A' },
            { header: 'Email', accessor: 'email' },
            {
              header: 'Role/Branch',
              accessor: (user) => (
                <div className="flex flex-col">
                  <Badge variant="neutral" className="capitalize w-fit">{user.role}</Badge>
                  {user.branch_id && (
                    <span className="text-[10px] text-[#e60023] font-medium uppercase mt-1">
                      {typeof user.branch_id === 'string'
                        ? branches.find(b => b.id === user.branch_id)?.name
                        : (user.branch_id as any).name}
                    </span>
                  )}
                  {user.role === 'customer' && user.customer_type && (
                    <span className="text-[10px] text-gray-500 font-medium uppercase mt-1">
                      {user.customer_type} ({user.discount_rate}%)
                    </span>
                  )}
                </div>
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
            { header: 'Joined Date', accessor: (user) => new Date(user.created_at).toLocaleDateString() },
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
                      const branchId = typeof user.branch_id === 'string' ? user.branch_id : (user.branch_id as any)?.id;
                      setFormBranchId(branchId || '');
                      setFormStatus(user.status);
                      setFormCustomerType(user.customer_type || 'regular');
                      setFormDiscountRate(user.discount_rate || 0);
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
        title={editingUser ? "Edit User" : "Add New User"}
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingUser ? "Save Changes" : "Create User"}
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {['manager', 'cashier', 'staff'].includes(formRole) && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Branch {isAdmin ? '' : '(Read-only)'}
              </label>
              {isAdmin ? (
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                  value={formBranchId}
                  onChange={(e) => setFormBranchId(e.target.value)}
                >
                  <option value="">Select a Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm"
                  value={branches.find(b => b.id === formBranchId)?.name || formBranchId || 'Not assigned'}
                  readOnly
                />
              )}
            </div>
          )}

          {formRole === 'customer' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                  value={formCustomerType}
                  onChange={(e) => {
                    const type = e.target.value as 'regular' | 'vip' | 'member';
                    setFormCustomerType(type);
                    if (type === 'vip') setFormDiscountRate(15);
                    else if (type === 'member') setFormDiscountRate(5);
                    else setFormDiscountRate(0);
                  }}
                >
                  <option value="regular">Regular</option>
                  <option value="member">Member (5%)</option>
                  <option value="vip">VIP (15%)</option>
                </select>
              </div>
              <Input
                label="Discount Rate (%)"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formDiscountRate || ""}
                onChange={(e) => setFormDiscountRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {editingUser && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as UserStatus)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default Users;
