"use client";
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Reservation, Branch } from '../../types';

const Reservations: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(() => Math.random().toString(36).substring(2, 15));

  const [formData, setFormData] = useState({
    branch_id: '',
    date: '',
    time: '19:00',
    guests: '2',
    note: '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resData, brData] = await Promise.all([
        user ? api.reservations.getAll() : Promise.resolve([]),
        api.public.branches.getAll(),
      ]);
      // API returns data in standard format with id transformation
      const branchesData = brData?.data || brData;
      if (user) {
        setReservations(resData.filter((r: Reservation) => {
          const customerId = typeof r.customer_id === 'string' ? r.customer_id : (r.customer_id as any)?.id;
          return customerId === user?.id;
        }));
      } else {
        setReservations([]);
      }
      setBranches(branchesData);
      if (branchesData.length > 0) setFormData(prev => ({ ...prev, branch_id: branchesData[0].id }));
    } catch (error) {
      console.error('Failed to fetch user reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please login to make a reservation', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.reservations.create({
        customer_id: user.id,
        branch_id: formData.branch_id,
        reservation_date: formData.date,
        reservation_time: formData.time,
        guests_count: parseInt(formData.guests),
        note: formData.note,
        status: 'requested',
        client_request_id: clientRequestId,
        email: formData.email,
        phone: formData.phone,
      });
      showNotification('Reservation requested! We will notify you once it is confirmed.');
      fetchData();
      setFormData(prev => ({ ...prev, note: '' }));
      setClientRequestId(Math.random().toString(36).substring(2, 15));
    } catch (error: any) {
      showNotification(error.message || 'Failed to book reservation', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reservations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reservation Form */}
        <div>
          <Card title="Book a Table" subtitle="Fill in the details to reserve your spot">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023]"
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.branch_name} - {b.location_address}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="Time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <Input
                label="Number of Guests"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max="20"
                required
                value={formData.guests || ""}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e60023] min-h-[100px]"
                  placeholder="Allergies, special occasions, etc."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={saving}>
                {saving ? 'Requesting...' : 'Request Reservation'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Reservation History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Recent Reservations</h2>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : reservations.length > 0 ? (
            reservations.map((res) => (
              <Card key={res.id}>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <CalendarIcon size={18} className="text-[#e60023]" />
                      {new Date(res.reservation_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {(() => {
                        const branchId = typeof res.branch_id === 'string' ? res.branch_id : (res.branch_id as any)?.id;
                        return branches.find(b => b.id === branchId)?.name;
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {res.reservation_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {res.guests_count} Guests
                      </div>
                    </div>
                    {res.note && (
                      <div className="flex items-start gap-1 text-xs text-gray-400 mt-2 italic">
                        <MessageSquare size={14} className="mt-0.5" />
                        {res.note}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-end justify-between">
                    <Badge
                      variant={
                        res.status === 'confirmed' ? 'success' :
                        res.status === 'requested' ? 'warning' :
                        res.status === 'cancelled' ? 'error' : 'neutral'
                      }
                      className="capitalize"
                    >
                      {res.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400 mt-auto">
                      Booked on {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No previous reservations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
