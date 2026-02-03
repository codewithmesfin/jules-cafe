"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Grid, QrCode, Download, Printer, Users } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Table, Business } from '../../types';

const Tables: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formCapacity, setFormCapacity] = useState(2);
  const [formStatus, setFormStatus] = useState<'available' | 'occupied' | 'reserved'>('available');

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
      setTables(Array.isArray(tableRes) ? tableRes : tableRes.data || []);
      setBusiness(bizRes.data || bizRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  const handleOpenQrModal = (table: Table) => {
    setSelectedTable(table);
    setIsQrModalOpen(true);
  };

  const handleSave = async () => {
    if (!formTableNumber) {
      showNotification('Please enter a table number', 'error');
      return;
    }

    try {
      const tableData = {
        table_number: formTableNumber,
        capacity: formCapacity,
        status: formStatus
      };

      if (selectedTable) {
        await api.tables.update((selectedTable.id || selectedTable._id)!, tableData);
        showNotification('Table updated');
      } else {
        await api.tables.create(tableData);
        showNotification('New table added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showNotification('Failed to save table', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this table permanentely?')) {
      try {
        await api.tables.delete(id);
        showNotification('Table removed', 'warning');
        fetchData();
      } catch (error) {
        showNotification('Failed to delete table', 'error');
      }
    }
  };

  const generateQrUrl = (table: Table) => {
    const baseUrl = window.location.origin;
    const businessSlug = business?.name?.toLowerCase().replace(/\s+/g, '-') || 'business';
    const menuUrl = `${baseUrl}/${businessSlug}/menu?tableId=${table.id || table._id}&tableNo=${table.table_number}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(menuUrl)}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Table Layout</h1>
          <p className="text-slate-500 font-medium">Manage floor capacity and QR-based ordering</p>
        </div>
        <Button
          className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-blue-100"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} /> Add New Table
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Find table by number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-square bg-white border border-slate-100 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <Grid className="mx-auto h-16 w-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No tables configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredTables.map(table => (
            <div
              key={table.id || table._id}
              className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col items-center text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                table.status === 'available' ? "bg-green-50 text-green-600" :
                table.status === 'occupied' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
              )}>
                <Grid size={32} />
              </div>

              <h3 className="font-black text-slate-900 text-xl mb-1">Table {table.table_number}</h3>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs mb-4">
                <Users size={12} />
                <span>Seats {table.capacity}</span>
              </div>

              <Badge
                variant={
                  table.status === 'available' ? 'success' :
                  table.status === 'occupied' ? 'error' : 'warning'
                }
                className="capitalize rounded-lg font-black text-[10px] tracking-widest px-3"
              >
                {table.status}
              </Badge>

              <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenQrModal(table)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Show QR Code"
                >
                  <QrCode size={18} />
                </button>
                <button
                  onClick={() => handleOpenModal(table)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete((table.id || table._id)!)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTable ? 'Modify Table' : 'New Table Setup'}
        className="max-w-md"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100" onClick={handleSave}>
              {selectedTable ? 'Update Table' : 'Add to Layout'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          <Input
            label="Table Identifier *"
            placeholder="e.g. A1, 10, Terrace-1"
            value={formTableNumber}
            onChange={(e) => setFormTableNumber(e.target.value)}
            className="rounded-xl"
          />
          <Input
            label="Seating Capacity"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="4"
            value={formCapacity || ""}
            onChange={(e) => setFormCapacity(parseInt(e.target.value) || 0)}
            className="rounded-xl"
          />
          <div className="space-y-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Initial Status</label>
            <select
              className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
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

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={`Scan-to-Order QR`}
        className="max-w-sm"
        footer={
          <Button className="w-full h-12 rounded-xl font-black gap-2" onClick={() => window.print()}>
            <Printer size={18} /> Print Label
          </Button>
        }
      >
        {selectedTable && (
          <div className="flex flex-col items-center justify-center py-4 space-y-6" id="printable-qr">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 flex flex-col items-center space-y-6 w-full">
              <div className="text-center">
                <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-1">Welcome to</p>
                <h2 className="text-2xl font-black text-slate-900 mb-4">{business?.name || 'Our Restaurant'}</h2>
              </div>

              <div className="relative p-4 bg-white rounded-3xl border-4 border-slate-900 shadow-xl">
                <img
                  src={generateQrUrl(selectedTable)}
                  alt="Table QR Code"
                  className="w-48 h-48"
                />
                <div className="absolute -bottom-3 -right-3 bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-4 border-white">
                  {selectedTable.table_number}
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-black text-slate-900 text-sm">SCAN TO VIEW MENU & ORDER</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No App Required • Direct Payment</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr, #printable-qr * {
            visibility: visible;
          }
          #printable-qr {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Tables;
