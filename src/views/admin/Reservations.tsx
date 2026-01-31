import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Check, X, User, Plus } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import type { Reservation, User as UserType } from '../../types';

const Reservations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Reservation Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [resNote, setResNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, userData] = await Promise.all([
        api.reservations.getAll(),
        api.users.getAll(),
      ]);
      setReservations(resData);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(res => {
    const customerId = typeof res.customer_id === 'string' ? res.customer_id : (res.customer_id as any)?.id;
    const customer = users.find(u => u.id === customerId);
    return customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.reservations.update(id, { status });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedCustomer || !resDate || !resTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const customer = users.find(u => u.id === selectedCustomer);
      const resData = {
        customer_id: selectedCustomer,
        branch_id: customer?.branch_id || '654321098765432109876543', // Fallback
        reservation_date: resDate,
        reservation_time: resTime,
        guests_count: guestsCount,
        note: resNote,
        status: 'requested'
      };

      await api.reservations.create(resData);
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert('Failed to create reservation');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setResDate('');
    setResTime('');
    setGuestsCount(2);
    setResNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by customer name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

      {loading ? (
        <div className="text-center py-10">Loading reservations...</div>
      ) : (
        <Table
          data={filteredReservations}
          columns={[
            {
              header: 'Customer',
              accessor: (res) => {
                const customerId = typeof res.customer_id === 'string' ? res.customer_id : (res.customer_id as any)?.id;
                const customer = users.find(u => u.id === customerId);
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
            { header: 'Date', accessor: (res) => res.reservation_date },
            { header: 'Time', accessor: (res) => res.reservation_time },
            { header: 'Guests', accessor: (res) => res.guests_count },
            {
              header: 'Status',
              accessor: (res) => (
                <Badge
                  variant={
                    res.status === 'confirmed' ? 'success' :
                    res.status === 'requested' ? 'warning' : 'neutral'
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
                  {res.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded border border-green-200"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">Details</Button>
                </div>
              )
            }
          ]}
        />
      )}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Reservation"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>Cancel</Button>
            <Button onClick={handleCreateReservation} disabled={saving}>
              {saving ? 'Creating...' : 'Create Reservation'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {users.filter(u => u.role === 'customer').map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={resDate}
              onChange={(e) => setResDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={resTime}
              onChange={(e) => setResTime(e.target.value)}
            />
          </div>
          <Input
            label="Guests Count"
            type="number"
            min="1"
            value={guestsCount}
            onChange={(e) => setGuestsCount(parseInt(e.target.value) || 0)}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              value={resNote}
              onChange={(e) => setResNote(e.target.value)}
              placeholder="Any special requests..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
