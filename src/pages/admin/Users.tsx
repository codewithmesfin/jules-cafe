import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { MOCK_USERS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

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
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add User
        </Button>
      </div>

      <Table
        data={filteredUsers}
        columns={[
          { header: 'Full Name', accessor: 'full_name' },
          { header: 'Email', accessor: 'email' },
          {
            header: 'Role',
            accessor: (user) => (
              <Badge variant="neutral" className="capitalize">{user.role}</Badge>
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
            accessor: () => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                <Button variant="ghost" size="sm" className="text-red-600"><Trash2 size={16} /></Button>
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. John Doe" />
          <Input label="Email Address" type="email" placeholder="john@example.com" />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
