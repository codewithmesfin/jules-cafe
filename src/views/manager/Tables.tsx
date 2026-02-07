"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Grid, QrCode, Users, MapPin } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { usePermission } from '../../hooks/usePermission';
import { cn } from '../../utils/cn';
import type { Table, Business } from '../../types';

const Tables: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { canCreate, canUpdate } = usePermission();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state - matching backend model
  const [formName, setFormName] = useState('');
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formSeats, setFormSeats] = useState(4);
  const [formLocation, setFormLocation] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableRes, bizRes] = await Promise.all([
        api.tables.getAll(),
        api.business.getMe()
      ]);
      // Handle different response formats
      const tableData = Array.isArray(tableRes) ? tableRes : tableRes.data || [];
      setTables(tableData);
      setBusiness(bizRes.data || bizRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('Failed to load tables', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.table_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (table: Table | null = null) => {
    setSelectedTable(table);
    if (table) {
      setFormName(table.name || '');
      setFormTableNumber(table.table_number || '');
      setFormSeats(table.capacity || table.seats || 4);
      setFormLocation((table as any).location || '');
      setFormIsActive((table as any).is_active !== false);
    } else {
      setFormName('');
      setFormTableNumber('');
      setFormSeats(4);
      setFormLocation('');
      setFormIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleOpenQrModal = (table: Table) => {
    setSelectedTable(table);
    setIsQrModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName) {
      showNotification('Please enter a table name', 'error');
      return;
    }

    try {
      // Map frontend fields to backend model
      const tableData = {
        name: formName,
        table_number: formTableNumber || formName,
        seats: formSeats,
        location: formLocation || undefined,
        is_active: formIsActive
      };

      if (selectedTable) {
        await api.tables.update((selectedTable.id || selectedTable._id)!, tableData);
        showNotification('Table updated successfully');
      } else {
        await api.tables.create(tableData);
        showNotification('Table created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      showNotification(error.message || 'Failed to save table', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        await api.tables.delete(id);
        showNotification('Table removed successfully', 'warning');
        fetchData();
      } catch (error: any) {
        showNotification(error.message || 'Failed to delete table', 'error');
      }
    }
  };

  const getTableStatus = (table: any): 'available' | 'occupied' | 'reserved' => {
    // For now, return available if is_active is true
    return (table as any).is_active !== false ? 'available' : 'occupied';
  };

  const generateQrUrl = (table: Table) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const businessSlug = business?.name?.toLowerCase().replace(/\s+/g, '-') || 'business';
    const tableId = table.id || table._id;
    const tableNo = table.table_number || table.name || '';
    const menuUrl = `${baseUrl}/${businessSlug}/menu?tableId=${tableId}&tableNo=${encodeURIComponent(tableNo)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-100 rounded w-40 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-28 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tables</h1>
          <p className="text-slate-500 text-sm">Manage restaurant tables and QR codes</p>
        </div>
        {canCreate('tables') && (
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> Add Table
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search tables..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 mb-4">No tables found</p>
            {canCreate('tables') && (
              <Button variant="outline" onClick={() => handleOpenModal()}>
                Add your first table
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredTables.map((table) => (
            <div
              key={table.id || table._id}
              className={cn(
                "bg-white border rounded-2xl p-4 transition-all hover:shadow-lg",
                "border-slate-200 hover:border-slate-300 cursor-pointer"
              )}
              onClick={() => canUpdate('tables') && handleOpenModal(table)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  getTableStatus(table) === 'available' ? "bg-emerald-50 text-emerald-600" :
                  getTableStatus(table) === 'occupied' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                )}>
                  <Grid size={24} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenQrModal(table); }}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    title="View QR Code"
                  >
                    <QrCode size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 text-lg mb-1">
                Table {table.table_number || table.name}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{table.capacity || table.seats}</span>
                </div>
                {(table as any).location && (
                  <div className="flex items-center gap-1 truncate">
                    <MapPin size={14} />
                    <span className="truncate text-xs">{(table as any).location}</span>
                  </div>
                )}
              </div>

              <Badge
                variant={
                  getTableStatus(table) === 'available' ? 'success' :
                  getTableStatus(table) === 'occupied' ? 'error' : 'warning'
                }
                className="w-full justify-center"
                size="sm"
              >
                {getTableStatus(table)}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTable ? 'Edit Table' : 'Add New Table'}
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              {selectedTable ? 'Save Changes' : 'Create Table'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Table Name *"
            placeholder="e.g., Main Dining"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            label="Table Number"
            placeholder="e.g., A1, 10"
            value={formTableNumber}
            onChange={(e) => setFormTableNumber(e.target.value)}
          />
          <Input
            label="Seating Capacity"
            type="number"
            min="1"
            max="50"
            value={formSeats}
            onChange={(e) => setFormSeats(parseInt(e.target.value) || 1)}
          />
          <Input
            label="Location (optional)"
            placeholder="e.g., Window, Patio, Bar"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Table is active
            </label>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Table QR Code"
      >
        {selectedTable && (
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 mb-4">
              <img
                src={generateQrUrl(selectedTable)}
                alt="Table QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-center font-medium text-slate-700">
              Table {selectedTable.table_number || selectedTable.name}
            </p>
            <p className="text-center text-sm text-slate-500 mt-1">
              Scan to view menu and order
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tables;
