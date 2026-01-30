import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { Branch } from '../../types';

const Branches: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await api.branches.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (branch: Branch | null = null) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.branches.delete(id);
        fetchBranches();
      } catch (error) {
        alert('Failed to delete branch');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-10">Loading branches...</div>
          ) : (
            <Table
              data={filteredBranches}
              columns={[
                {
                  header: 'Branch Name',
                  accessor: (b) => (
                    <div className="flex items-center gap-2 font-bold text-gray-900">
                      <MapPin size={16} className="text-orange-600" />
                      {b.name}
                    </div>
                  )
                },
                { header: 'Location', accessor: 'location' },
                {
                  header: 'Capacity',
                  accessor: (b) => (
                    <div className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {b.capacity} people
                    </div>
                  )
                },
                {
                  header: 'Hours',
                  accessor: (b) => (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={14} className="text-gray-400" />
                      {b.operating_hours.open} - {b.operating_hours.close}
                    </div>
                  )
                },
                {
                  header: 'Status',
                  accessor: (b) => (
                    <Badge variant={b.is_active ? 'success' : 'error'}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (b) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(b)}><Edit size={16} /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(b.id)}><Trash2 size={16} /></Button>
                    </div>
                  )
                }
              ]}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBranch ? 'Edit Branch' : 'Add New Branch'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>
              {selectedBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Branch Name" placeholder="e.g. Downtown Branch" defaultValue={selectedBranch?.name} />
          </div>
          <div className="md:col-span-2">
            <Input label="Location Address" placeholder="123 Main St, City" defaultValue={selectedBranch?.location} />
          </div>
          <Input label="Opening Time" type="time" defaultValue={selectedBranch?.operating_hours.open} />
          <Input label="Closing Time" type="time" defaultValue={selectedBranch?.operating_hours.close} />
          <Input label="Total Capacity" type="number" placeholder="50" defaultValue={selectedBranch?.capacity} />
          <div className="flex items-center mt-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" defaultChecked={selectedBranch ? selectedBranch.is_active : true} />
              <span className="text-sm font-medium text-gray-700">Active Branch</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Branches;
