import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Plus, MapPin } from 'lucide-react';
import { MOCK_ORDERS, MOCK_USERS, MOCK_MENU_ITEMS, MOCK_BRANCHES, MOCK_TABLES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import type { Order } from '../../types';

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || order.branch_id === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            {MOCK_BRANCHES.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Button className="gap-2" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Create Order
          </Button>
        </div>
      </div>

      <Table
        data={filteredOrders}
        columns={[
          { header: 'Order ID', accessor: 'order_number', className: 'font-bold' },
          {
            header: 'Branch',
            accessor: (order) => (
              <div className="flex items-center gap-1 text-xs">
                <MapPin size={12} /> {MOCK_BRANCHES.find(b => b.id === order.branch_id)?.name}
              </div>
            )
          },
          {
            header: 'Customer',
            accessor: (order) => MOCK_USERS.find(u => u.id === order.customer_id)?.full_name || 'Guest'
          },
          { header: 'Date', accessor: (order) => new Date(order.created_at).toLocaleString() },
          { header: 'Total', accessor: (order) => `$${order.total_amount.toFixed(2)}` },
          {
            header: 'Status',
            accessor: (order) => (
              <Badge
                variant={
                  order.status === 'served' ? 'success' :
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
                <Eye size={16} className="mr-2" /> View Details
              </Button>
            )
          }
        ]}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Order"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Create Order</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {MOCK_BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table (Optional)</label>
              <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">None</option>
                {MOCK_TABLES.map(t => (
                  <option key={t.id} value={t.id}>{t.table_number}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              {MOCK_USERS.filter(u => u.role === 'customer').map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
              <option value="guest">Walk-in Guest</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Order Items</label>
            {MOCK_MENU_ITEMS.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">${item.base_price.toFixed(2)}</span>
                  <input type="number" min="0" defaultValue="0" className="w-16 px-2 py-1 border rounded" />
                </div>
              </div>
            ))}
          </div>
          <Input label="Notes" placeholder="Any special instructions..." />
        </div>
      </Modal>

      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.order_number}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                <p className="text-sm font-medium capitalize">{selectedOrder.status}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50"><XCircle size={14} /></Button>
                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50"><CheckCircle size={14} /></Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      <div>
                        <p className="text-sm font-medium">Menu Item Name</p>
                        <p className="text-xs text-gray-500">Qty: 1</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">$12.50</span>
                  </div>
                ))}
              </div>
            </div>

            <hr />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>$25.00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span>$2.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>$27.00</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Customer Details</h4>
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Name:</span> John Customer</p>
                <p><span className="text-gray-500">Email:</span> john@example.com</p>
                <p><span className="text-gray-500">Table:</span> 12</p>
              </div>
            </div>

            <Button className="w-full gap-2">
              <Clock size={18} /> Update Status
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Orders;
