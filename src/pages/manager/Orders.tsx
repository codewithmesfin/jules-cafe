import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import { MOCK_ORDERS, MOCK_USERS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = MOCK_ORDERS.filter(order =>
    order.branch_id === user?.branch_id &&
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search branch orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Table
        data={filteredOrders}
        columns={[
          { header: 'Order ID', accessor: 'order_number', className: 'font-bold' },
          {
            header: 'Customer',
            accessor: (order) => MOCK_USERS.find(u => u.id === order.customer_id)?.full_name || 'Walk-in'
          },
          { header: 'Amount', accessor: (order) => `$${order.total_amount.toFixed(2)}` },
          {
            header: 'Status',
            accessor: (order) => (
              <Badge
                variant={
                  order.status === 'completed' ? 'success' :
                  order.status === 'cancelled' ? 'error' : 'warning'
                }
                className="capitalize"
              >
                {order.status}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (order) => (
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                <Eye size={16} className="mr-2" /> Details
              </Button>
            )
          }
        ]}
      />

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.order_number}`}
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setSelectedOrder(null)}>
                <XCircle size={18} className="mr-2" /> Cancel Order
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button className="gap-2" onClick={() => setSelectedOrder(null)}>
                  <CheckCircle size={18} /> Mark as Ready
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <p className="font-medium capitalize">{selectedOrder.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold">Type</p>
                <p className="font-medium capitalize">{selectedOrder.type}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
