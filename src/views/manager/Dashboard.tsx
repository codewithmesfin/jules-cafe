import React from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, Calendar, Users, DollarSign } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { MOCK_ORDERS, MOCK_RESERVATIONS, MOCK_USERS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const branchOrders = MOCK_ORDERS.filter(o => o.branch_id === user?.branch_id);
  const branchReservations = MOCK_RESERVATIONS.filter(r => r.branch_id === user?.branch_id);
  const branchStaff = MOCK_USERS.filter(u => u.role === 'staff' && u.branch_id === user?.branch_id);

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
            <p className="text-xs text-gray-500 font-medium">Daily Revenue</p>
            <h3 className="text-xl font-bold">$1,250</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Orders Today</p>
            <h3 className="text-xl font-bold">{branchOrders.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Reservations</p>
            <h3 className="text-xl font-bold">{branchReservations.length}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Staff</p>
            <h3 className="text-xl font-bold">{branchStaff.length}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Staff Workload (Orders Assigned)">
          <div className="space-y-4">
            {branchStaff.map((staff) => {
              const assignedCount = MOCK_ORDERS.filter(o => o.waiter_id === staff.id).length;
              return (
                <div key={staff.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{staff.full_name}</span>
                    <span className="text-gray-500">{assignedCount} active orders</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(assignedCount / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Reservation Status Breakdown">
          <div className="flex items-center justify-center h-48 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-orange-600">
                {branchReservations.filter(r => r.status === 'confirmed').length}
              </div>
              <div className="text-xs text-gray-500">Confirmed</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-600">
                {branchReservations.filter(r => r.status === 'requested').length}
              </div>
              <div className="text-xs text-gray-500">Requested</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-600">
                {branchReservations.filter(r => r.status === 'cancelled').length}
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
