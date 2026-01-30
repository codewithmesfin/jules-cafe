import React, { useState } from 'react';
import { Search, Plus, CheckCircle, XCircle, Calendar, User, Users, Trash2 } from 'lucide-react';
import { MOCK_RESERVATIONS, MOCK_USERS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import type { Reservation } from '../../types';

const Reservations: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  const filteredReservations = MOCK_RESERVATIONS.filter(res =>
    res.branch_id === user?.branch_id &&
    (MOCK_USERS.find(u => u.id === res.customer_id)?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const handleOpenModal = (res: Reservation | null = null) => {
    setSelectedRes(res);
    setIsModalOpen(true);
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
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Create Reservation
        </Button>
      </div>

      <Table
        data={filteredReservations}
        columns={[
          {
            header: 'Customer',
            accessor: (res) => (
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <span className="font-bold text-gray-900">
                  {MOCK_USERS.find(u => u.id === res.customer_id)?.full_name || 'Guest'}
                </span>
              </div>
            )
          },
          {
            header: 'Waiter',
            accessor: (res) => (
              <span className="text-sm text-gray-600">
                {MOCK_USERS.find(u => u.id === res.waiter_id)?.full_name || '-'}
              </span>
            )
          },
          {
            header: 'Date & Time',
            accessor: (res) => (
              <div className="text-sm">
                <p className="font-medium">{res.reservation_date}</p>
                <p className="text-gray-500">{res.reservation_time}</p>
              </div>
            )
          },
          {
            header: 'Guests',
            accessor: (res) => (
              <div className="flex items-center gap-1">
                <Users size={14} className="text-gray-400" />
                {res.guests_count}
              </div>
            )
          },
          {
            header: 'Status',
            accessor: (res) => (
              <Badge
                variant={
                  res.status === 'confirmed' ? 'success' :
                  res.status === 'cancelled' ? 'error' :
                  res.status === 'requested' ? 'warning' : 'neutral'
                }
                className="capitalize"
              >
                {res.status.replace('_', ' ')}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (res) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(res)} title="View/Edit"><Calendar size={16} /></Button>
                <Button variant="ghost" size="sm" className="text-red-600" title="Delete"><Trash2 size={16} /></Button>
                {res.status === 'requested' && (
                  <>
                    <Button variant="ghost" size="sm" className="text-green-600" title="Approve"><CheckCircle size={16} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-600" title="Reject"><XCircle size={16} /></Button>
                  </>
                )}
              </div>
            )
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRes ? 'Reservation Details' : 'New Reservation'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>
              {selectedRes ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedRes?.customer_id}>
              {MOCK_USERS.filter(u => u.role === 'customer').map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" defaultValue={selectedRes?.reservation_date} />
            <Input label="Time" type="time" defaultValue={selectedRes?.reservation_time} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Number of Guests" type="number" defaultValue={selectedRes?.guests_count} />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Waiter</label>
              <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedRes?.waiter_id}>
                <option value="">Unassigned</option>
                {MOCK_USERS.filter(u => u.role === 'staff' && u.branch_id === user?.branch_id).map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue={selectedRes?.status || 'confirmed'}>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
              defaultValue={selectedRes?.note}
              placeholder="Any special requests..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
