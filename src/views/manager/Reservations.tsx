"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, XCircle, Calendar, User, Users, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getSocket, joinManagerRoom } from '../../utils/socket';
import type { Reservation, ReservationStatus, User as UserType } from '../../types';

const Reservations: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formGuests, setFormGuests] = useState(2);
  const [formWaiterId, setFormWaiterId] = useState('');
  const [formStatus, setFormStatus] = useState<any>('requested');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    fetchData();
    
    // Join manager room for real-time updates
    joinManagerRoom();
    
    const socket = getSocket();
    
    // Listen for new reservations
    socket.on('new-reservation', (newRes: Reservation) => {
      setReservations(prev => {
        const branchId = typeof newRes.branch_id === 'string' ? newRes.branch_id : (newRes.branch_id as any)?.id;
        const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
        if (branchId === userBId) {
          showNotification(`New reservation received!`, 'info');
          return [newRes, ...prev];
        }
        return prev;
      });
    });
    
    // Listen for reservation status updates
    socket.on('reservation-status-update', (data: { reservationId: string; status: ReservationStatus }) => {
      setReservations(prev => prev.map(res => 
        res.id === data.reservationId ? { ...res, status: data.status } : res
      ));
    });
    
    return () => {
      socket.off('new-reservation');
      socket.off('reservation-status-update');
    };
  }, [user?.branch_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, userData] = await Promise.all([
        api.reservations.getAll(),
        api.users.getAll(),
      ]);
    setReservations(resData.filter((r: Reservation) => {
      const branchId = typeof r.branch_id === 'string' ? r.branch_id : (r.branch_id as any)?.id;
      const userBId = typeof user?.branch_id === "string" ? user?.branch_id : (user?.branch_id as any)?.id;
      return branchId === userBId;
    }));
      setAllUsers(userData);
    } catch (error) {
      console.error('Failed to fetch manager reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (res: Reservation | null = null) => {
    setSelectedRes(res);
    if (res) {
      const customerId = typeof res.customer_id === 'string' ? res.customer_id : (res.customer_id as any)?.id;
      setFormCustomerId(customerId || '');
      setFormDate(res.reservation_date);
      setFormTime(res.reservation_time);
      setFormGuests(res.guests_count);
      setFormWaiterId(res.waiter_id || '');
      setFormStatus(res.status);
      setFormNote(res.note || '');
    } else {
      setFormCustomerId(allUsers.find(u => u.role === 'customer')?.id || '');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormTime('19:00');
      setFormGuests(2);
      setFormWaiterId('');
      setFormStatus('requested');
      setFormNote('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const resData = {
        customer_id: formCustomerId,
        branch_id: user?.branch_id,
        reservation_date: formDate,
        reservation_time: formTime,
        guests_count: formGuests,
        waiter_id: formWaiterId || undefined,
        status: formStatus,
        note: formNote
      };

      if (selectedRes) {
        await api.reservations.update(selectedRes.id, resData);
        showNotification('Reservation updated successfully');
      } else {
        await api.reservations.create(resData);
        showNotification('Reservation created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showNotification('Failed to save reservation', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.reservations.update(id, { status });
      showNotification(`Reservation ${status}`);
      fetchData();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reservation?')) {
      try {
        await api.reservations.delete(id);
        showNotification('Reservation deleted', 'warning');
        fetchData();
      } catch (error) {
        showNotification('Failed to delete reservation', 'error');
      }
    }
  };

  const filteredReservations = reservations.filter(res => {
    const customerId = typeof res.customer_id === 'string' ? res.customer_id : (res.customer_id as any)?.id;
    const customer = allUsers.find(u => u.id === customerId);
    const name = customer?.full_name || customer?.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-[#e60023] rounded-full">
          <Calendar size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to manage reservations.
        </p>
      </div>
    );
  }

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
                const customer = allUsers.find(u => u.id === customerId);
                return (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-900">
                      {customer?.full_name || customer?.username || 'Guest'}
                    </span>
                  </div>
                );
              }
            },
            {
              header: 'Waiter',
              accessor: (res) => (
                <span className="text-sm text-gray-600">
                  {allUsers.find(u => u.id === res.waiter_id)?.full_name || '-'}
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
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(res.id)} title="Delete"><Trash2 size={16} /></Button>
                  {res.status === 'requested' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleUpdateStatus(res.id, 'confirmed')} title="Approve"><CheckCircle size={16} /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleUpdateStatus(res.id, 'cancelled')} title="Reject"><XCircle size={16} /></Button>
                    </>
                  )}
                </div>
              )
            }
          ]}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRes ? 'Reservation Details' : 'New Reservation'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {selectedRes ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
              value={formCustomerId}
              onChange={(e) => setFormCustomerId(e.target.value)}
            >
              {allUsers.filter(u => u.role === 'customer').map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Number of Guests"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formGuests || ""}
              onChange={(e) => setFormGuests(parseInt(e.target.value) || 0)}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Waiter</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                value={formWaiterId}
                onChange={(e) => setFormWaiterId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {allUsers.filter(u => {
                  const uBId = typeof u.branch_id === 'string' ? u.branch_id : (u.branch_id as any)?.id;
                  const userBId = typeof user?.branch_id === 'string' ? user?.branch_id : (user?.branch_id as any)?.id;
                  return u.role === 'staff' && uBId === userBId;
                }).map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
            >
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] min-h-[80px]"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="Any special requests..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
