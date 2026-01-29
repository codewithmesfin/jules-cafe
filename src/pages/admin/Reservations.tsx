import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, Check, X, User, Plus, MapPin } from 'lucide-react';
import { MOCK_RESERVATIONS, MOCK_USERS, MOCK_BRANCHES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const Reservations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reservations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            {MOCK_BRANCHES.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon size={16} /> Today
          </Button>
          <Button className="gap-2" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Reservation
          </Button>
        </div>
      </div>

      <Table
        data={MOCK_RESERVATIONS}
        columns={[
          {
            header: 'Branch',
            accessor: (res) => (
              <div className="flex items-center gap-1 text-xs">
                <MapPin size={12} /> {MOCK_BRANCHES.find(b => b.id === res.branch_id)?.name}
              </div>
            )
          },
          {
            header: 'Customer',
            accessor: (res) => {
              const customer = MOCK_USERS.find(u => u.id === res.customer_id);
              return (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{customer?.full_name || 'Guest'}</span>
                </div>
              );
            }
          },
          { header: 'Date', accessor: (res) => res.date },
          { header: 'Time', accessor: (res) => res.time },
          { header: 'Guests', accessor: (res) => res.number_of_people },
          {
            header: 'Status',
            accessor: (res) => (
              <Badge
                variant={
                  res.status === 'approved' ? 'success' :
                  res.status === 'pending' ? 'warning' : 'neutral'
                }
                className="capitalize"
              >
                {res.status}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (res) => (
              <div className="flex items-center gap-2">
                {res.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      <Check size={16} />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <X size={16} />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            )
          }
        ]}
      />
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Reservation"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Create Reservation</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {MOCK_BRANCHES.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {MOCK_USERS.filter(u => u.role === 'customer').map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" />
            <Input label="Time" type="time" />
          </div>
          <Input label="Guests Count" type="number" min="1" defaultValue="2" />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
