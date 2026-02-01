"use client";
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, Calendar, Users, DollarSign } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Order, Reservation, User as UserType } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordData, resData, userData] = await Promise.all([
          api.orders.getAll(),
          api.reservations.getAll(),
          api.users.getAll(),
        ]);

        // Branch filtering is now handled by the backend
        setOrders(ordData);
        setReservations(resData);
        // We still need to filter for 'staff' role specifically,
        // though backend likely only returned users for this branch anyway.
        setStaff(userData.filter(u => u.role === 'staff'));
      } catch (error: any) {
        console.error('Failed to fetch manager dashboard data:', error);
        showNotification(error.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.branch_id) {
      fetchData();
    }
  }, [user?.branch_id]);

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Assigned</h2>
        <p className="text-gray-500 text-center max-w-md">
          This manager account is not yet associated with any branch.
          Please contact an administrator to assign you to a branch.
        </p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Branch Performance Overview</h1>
        <Badge variant="info" className="px-3 py-1">Branch: {user?.branch_id}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Branch Revenue</p>
            <h3 className="text-xl font-bold">
              ${orders.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}
            </h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Orders</p>
            <h3 className="text-xl font-bold">{orders.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Reservations</p>
            <h3 className="text-xl font-bold">{reservations.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Staff</p>
            <h3 className="text-xl font-bold">{staff.length}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Staff Workload (Orders Assigned)">
          <div className="space-y-4">
            {staff.map((s) => {
              const assignedCount = orders.filter(o => o.waiter_id === s.id).length;
              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.full_name}</span>
                    <span className="text-gray-500">{assignedCount} active orders</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (assignedCount / 10) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {staff.length === 0 && <p className="text-center text-gray-500 text-sm">No staff found for this branch.</p>}
          </div>
        </Card>

        <Card title="Reservation Status Breakdown">
          <div className="flex items-center justify-center h-48 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-600">
                {reservations.filter(r => r.status === 'confirmed').length}
              </div>
              <div className="text-xs text-gray-500">Confirmed</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-600">
                {reservations.filter(r => r.status === 'requested').length}
              </div>
              <div className="text-xs text-gray-500">Requested</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-600">
                {reservations.filter(r => r.status === 'cancelled').length}
              </div>
              <div className="text-xs text-gray-500">Cancelled</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
