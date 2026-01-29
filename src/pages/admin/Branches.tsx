import React, { useState } from 'react';
import { Search, Plus, MapPin, Clock, Users } from 'lucide-react';
import { MOCK_BRANCHES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const Branches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search branches..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Branch
        </Button>
      </div>

      <Table
        data={MOCK_BRANCHES}
        columns={[
          {
            header: 'Branch Name',
            accessor: (branch) => (
              <div className="font-bold text-gray-900">{branch.name}</div>
            )
          },
          {
            header: 'Location',
            accessor: (branch) => (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={14} /> {branch.address}
              </div>
            )
          },
          {
            header: 'Hours',
            accessor: (branch) => (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} /> {branch.opening_time} - {branch.closing_time}
              </div>
            )
          },
          {
            header: 'Capacity',
            accessor: (branch) => (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users size={14} /> {branch.capacity} pax
              </div>
            )
          },
          {
            header: 'Status',
            accessor: (branch) => (
              <Badge variant={branch.is_active ? 'success' : 'neutral'}>
                {branch.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: () => (
              <Button variant="ghost" size="sm">Edit</Button>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Branch"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create Branch</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Branch Name" placeholder="e.g. East Side" />
          <Input label="Phone" placeholder="555-0000" />
          <div className="md:col-span-2">
            <Input label="Address" placeholder="Full street address" />
          </div>
          <Input label="Opening Time" type="time" />
          <Input label="Closing Time" type="time" />
          <Input label="Total Capacity" type="number" />
        </div>
      </Modal>
    </div>
  );
};

export default Branches;
