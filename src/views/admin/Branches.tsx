import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { Branch } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

const Branches: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [capacity, setCapacity] = useState(50);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await api.branches.getAll();
      setBranches(data);
    } catch (error) {
      showNotification('Failed to fetch branches', 'error');
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    (branch.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (branch.location_address?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleOpenModal = (branch: Branch | null = null) => {
    setSelectedBranch(branch);
    if (branch) {
      setName(branch.branch_name || '');
      setLocation(branch.location_address || '');
      setOpenTime(branch.opening_time || '09:00');
      setCloseTime(branch.closing_time || '22:00');
      setCapacity(branch.capacity || 50);
      setIsActive(!!branch.is_active);
    } else {
      setName('');
      setLocation('');
      setOpenTime('09:00');
      setCloseTime('22:00');
      setCapacity(50);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const branchData = {
        branch_name: name,
        location_address: location,
        opening_time: openTime,
        closing_time: closeTime,
        capacity,
        is_active: isActive,
        company: user?.company || ''
      };

      if (selectedBranch) {
        await api.branches.update(selectedBranch.id, branchData);
        showNotification('Branch updated successfully', 'success');
      } else {
        await api.branches.create(branchData);
        showNotification('Branch created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (error) {
      console.error('Failed to save branch:', error);
      showNotification('Failed to save branch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setBranchToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      try {
        await api.branches.delete(branchToDelete);
        showNotification('Branch deleted successfully', 'success');
        fetchBranches();
      } catch (error) {
        showNotification('Failed to delete branch', 'error');
      } finally {
        setIsConfirmOpen(false);
        setBranchToDelete(null);
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
                      {b.name || b.branch_name}
                    </div>
                  )
                },
                { header: 'Location', accessor: 'location_address' },
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
                      {b.opening_time} - {b.closing_time}
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : selectedBranch ? 'Save Changes' : 'Create Branch'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Branch Name"
              placeholder="e.g. Downtown Branch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Location Address"
              placeholder="123 Main St, City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Input
            label="Opening Time"
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
          />
          <Input
            label="Closing Time"
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
          />
          <Input
            label="Total Capacity"
            type="number"
            placeholder="50"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
          />
          <div className="flex items-center mt-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">Active Branch</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
};

export default Branches;
