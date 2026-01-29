import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { MOCK_TABLES, MOCK_BRANCHES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table as TableUI } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const Tables: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTables = MOCK_TABLES.filter(t =>
    selectedBranch === 'all' || t.branch_id === selectedBranch
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Table
        </Button>
      </div>

      <TableUI
        data={filteredTables}
        columns={[
          {
            header: 'Table Number',
            accessor: (t) => (
              <div className="font-bold text-gray-900">{t.table_number}</div>
            )
          },
          {
            header: 'Branch',
            accessor: (t) => MOCK_BRANCHES.find(b => b.id === t.branch_id)?.name || 'N/A'
          },
          {
            header: 'Capacity',
            accessor: (t) => (
              <div className="flex items-center gap-1">
                <Users size={14} /> {t.capacity} Seats
              </div>
            )
          },
          {
            header: 'Status',
            accessor: (t) => (
              <Badge variant={t.is_active ? 'success' : 'neutral'}>
                {t.is_active ? 'Active' : 'Inactive'}
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
        title="Add New Table"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create Table</Button>
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
          <Input label="Table Number" placeholder="e.g. T-10" />
          <Input label="Capacity" type="number" min="1" />
        </div>
      </Modal>
    </div>
  );
};

export default Tables;
