import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Plus, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';

const Roles: React.FC = () => {
  const roles = [
    { name: 'Admin', description: 'Full access to all modules', usersCount: 2, icon: ShieldAlert },
    { name: 'Manager', description: 'Can manage menu and staff', usersCount: 3, icon: ShieldCheck },
    { name: 'Staff', description: 'Can manage orders and reservations', usersCount: 8, icon: Shield },
    { name: 'Cashier', description: 'Focus on orders and payments', usersCount: 4, icon: Shield },
    { name: 'Customer', description: 'Basic access for ordering', usersCount: 124, icon: Shield },
  ];

  const modules = [
    { name: 'Dashboard', read: true, write: true, approve: true },
    { name: 'Users', read: true, write: true, approve: true },
    { name: 'Menu', read: true, write: true, approve: false },
    { name: 'Orders', read: true, write: true, approve: true },
    { name: 'Reservations', read: true, write: true, approve: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Role Management</h2>
          <p className="text-sm text-gray-500">Define permissions and access levels for each role.</p>
        </div>
        <Button className="gap-2"><Plus size={20} /> New Role</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {roles.map((role) => (
          <Card key={role.name} className="relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <role.icon size={24} />
              </div>
              <Button variant="ghost" size="sm"><Edit size={16} /></Button>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{role.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{role.description}</p>
            <div className="text-sm font-medium text-gray-700">
              {role.usersCount} Users
            </div>
          </Card>
        ))}
      </div>

      <Card title="Module Permissions" subtitle="Current role: Admin">
        <Table
          data={modules}
          columns={[
            { header: 'Module Name', accessor: 'name', className: 'font-bold' },
            {
              header: 'Read',
              accessor: (mod) => (
                <input type="checkbox" checked={mod.read} readOnly className="rounded text-orange-600 focus:ring-orange-500" />
              )
            },
            {
              header: 'Write',
              accessor: (mod) => (
                <input type="checkbox" checked={mod.write} readOnly className="rounded text-orange-600 focus:ring-orange-500" />
              )
            },
            {
              header: 'Approve',
              accessor: (mod) => (
                <input type="checkbox" checked={mod.approve} readOnly className="rounded text-orange-600 focus:ring-orange-500" />
              )
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Roles;
