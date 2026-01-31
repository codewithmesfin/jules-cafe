"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Grid } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table as DataTable } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Table } from '../../types';

const Tables: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formCapacity, setFormCapacity] = useState(2);
  const [formStatus, setFormStatus] = useState<'available' | 'occupied' | 'reserved'>('available');

  useEffect(() => {
    fetchTables();
  }, [user?.branch_id]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await api.tables.getAll();
      setTables(data.filter((t: Table) => t.branch_id === user?.branch_id));
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.table_number.includes(searchTerm)
  );

  const handleOpenModal = (table: Table | null = null) => {
    setSelectedTable(table);
    if (table) {
      setFormTableNumber(table.table_number);
      setFormCapacity(table.capacity);
      setFormStatus(table.status);
    } else {
      setFormTableNumber('');
      setFormCapacity(2);
      setFormStatus('available');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTableNumber || !user?.branch_id) {
      showNotification('Please fill in all fields (Branch ID missing)', 'error');
      return;
    }

    try {
      const tableData = {
        table_number: formTableNumber,
        capacity: formCapacity,
        status: formStatus,
        branch_id: user.branch_id
      };

      if (selectedTable) {
        await api.tables.update(selectedTable.id, tableData);
        showNotification('Table updated successfully');
      } else {
        await api.tables.create(tableData);
        showNotification('Table created successfully');
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (error) {
      showNotification('Failed to save table', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        await api.tables.delete(id);
        showNotification('Table deleted', 'warning');
        fetchTables();
      } catch (error) {
        showNotification('Failed to delete table', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by table number..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Table
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tables...</div>
      ) : (
        <DataTable
          data={filteredTables}
          columns={[
            {
              header: 'Table Number',
              accessor: (t) => (
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Grid size={16} className="text-orange-600" />
                  Table {t.table_number}
                </div>
              )
            },
            { header: 'Capacity', accessor: (t) => `${t.capacity} Guests` },
            {
              header: 'Status',
              accessor: (t) => (
                <Badge
                  variant={
                    t.status === 'available' ? 'success' :
                    t.status === 'occupied' ? 'error' : 'warning'
                  }
                  className="capitalize"
                >
                  {t.status}
                </Badge>
              )
            },
            {
              header: 'Actions',
              accessor: (t) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(t)}><Edit size={16} /></Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(t.id)}><Trash2 size={16} /></Button>
                </div>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTable ? 'Edit Table' : 'Add New Table'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {selectedTable ? 'Save Changes' : 'Create Table'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Table Number"
            placeholder="e.g. 15"
            value={formTableNumber}
            onChange={(e) => setFormTableNumber(e.target.value)}
          />
          <Input
            label="Capacity"
            type="number"
            placeholder="4"
            value={formCapacity}
            onChange={(e) => setFormCapacity(parseInt(e.target.value) || 0)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tables;
