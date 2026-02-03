"use client";
import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ShoppingBag, Clock, DollarSign, Calendar } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Order } from '../../types';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll();
      setOrders(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const response = await api.orders.getOne(order.id || order._id!);
      const details = response.data || response;

      // Fetch items separately as well for detailed view
      const itemsResponse = await api.orders.getItems(order.id || order._id!);
      const items = Array.isArray(itemsResponse) ? itemsResponse : itemsResponse.data || [];

      setSelectedOrder({ ...details, items });
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.orders.update(id, { order_status: status });
      showNotification(`Order status updated to ${status}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      showNotification('Failed to update order status', 'error');
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.id || order._id)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Archives</h1>
          <p className="text-slate-500 font-medium">Review history and manage transaction records</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <input
            placeholder="Search by Order ID..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <div className="p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
            <ShoppingBag size={48} />
          </div>
          <p className="text-slate-400 font-bold text-lg">No records found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id || order._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-900 text-sm">#{(order.id || order._id)?.slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                        {((order.customer_id as any)?.full_name || 'G').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{(order.customer_id as any)?.full_name || 'Guest'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-black text-slate-900">${order.total_amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant={
                        order.order_status === 'completed' ? 'success' :
                        order.order_status === 'cancelled' ? 'error' : 'neutral'
                      }
                      className="capitalize font-black text-[10px] rounded-lg px-2.5 py-1"
                    >
                      {order.order_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-bold text-blue-600 hover:bg-blue-50 h-10 px-4"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye size={16} className="mr-2" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Summary"
          className="max-w-xl"
          footer={
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12 text-red-500 border-red-100 hover:bg-red-50 font-black"
                onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'cancelled')}
              >
                <XCircle size={18} className="mr-2" /> Cancel Record
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 shadow-lg shadow-blue-100 font-black"
                onClick={() => handleUpdateStatus((selectedOrder.id || selectedOrder._id)!, 'completed')}
                disabled={selectedOrder.order_status === 'completed'}
              >
                <CheckCircle size={18} className="mr-2" /> Mark Completed
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <Badge className="bg-white border-slate-100 text-blue-600 font-black rounded-lg capitalize">
                  {selectedOrder.order_status}
                </Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                <Badge className="bg-white border-slate-100 text-slate-600 font-black rounded-lg capitalize">
                  {selectedOrder.payment_status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-4 px-2">Line Items</h4>
              <div className="bg-slate-50/50 rounded-2xl p-6 space-y-4">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-600">{item.quantity}x</span>
                      {item.product_id?.name || 'Item deleted'}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center px-2">
                <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Revenue</span>
                <span className="text-3xl font-black text-blue-600">${selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Internal Audit Notes</p>
                <p className="text-sm text-slate-700 font-medium">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
