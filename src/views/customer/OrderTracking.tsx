"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Package, ChefHat, Check, LogIn, UserPlus, ShoppingBag as ShoppingBagIcon, ChevronRight, X, Info, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../utils/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { getSocket, joinBusinessRoom } from '../../utils/socket';
import type { Order } from '../../types';

const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = params?.tenant_id as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { key: 'pending', label: 'Queued', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'preparing', label: 'In Kitchen', icon: ChefHat },
    { key: 'ready', label: 'Ready for Pickup', icon: Package },
    { key: 'completed', label: 'Enjoy!', icon: Check },
  ];

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll();
      const allOrders = Array.isArray(response) ? response : response.data || [];
      // Filter for customer's orders
      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();

    socket.on('order-status-update', (data: any) => {
      setOrders(prev => prev.map(order =>
        (order.id === data.orderId || order._id === data.orderId)
          ? { ...order, order_status: data.status as any }
          : order
      ));
    });

    return () => {
      socket.off('order-status-update');
    };
  }, []);

  const handleOrderClick = async (order: Order) => {
    try {
      const response = await api.orders.getOne(order.id || order._id!);
      const details = response.data || response;
      const itemsRes = await api.orders.getItems(order.id || order._id!);
      const items = Array.isArray(itemsRes) ? itemsRes : itemsRes.data || [];

      setSelectedOrder({ ...details, items });
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 max-w-sm w-full">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600">
            <ShoppingBagIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Track Your Order</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Please sign in to view your live orders and track kitchen progress in real-time.
          </p>
          <div className="space-y-4">
            <Link href={`/${tenantId}/login`} className="block">
              <Button className="w-full h-14 rounded-2xl font-black shadow-lg shadow-blue-100">
                Sign In
              </Button>
            </Link>
            <Link href={`/${tenantId}/signup`} className="block">
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black border-slate-100">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Trackings</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
              <Activity size={14} className="text-blue-600 animate-pulse" /> Live Status Updates
            </p>
          </div>
          <Link href={`/${tenantId}/menu`}>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-black px-6 h-12">
              Back to Menu
            </Button>
          </Link>
        </div>

        {loading && orders.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse border border-slate-100" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center shadow-xl shadow-slate-200/50 border border-slate-50">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <ShoppingBagIcon size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">No Active Orders</h2>
             <p className="text-slate-500 font-medium mb-8">Hungry? Our kitchen is ready for your next request.</p>
             <Link href={`/${tenantId}/menu`}>
               <Button size="lg" className="rounded-2xl px-10 h-14 font-black shadow-lg shadow-blue-100">Start Order</Button>
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order) => {
              const currentStepIndex = getCurrentStepIndex(order.order_status);
              const isActive = !['completed', 'cancelled'].includes(order.order_status);

              return (
                <div
                  key={order.id || order._id}
                  className={cn(
                    "bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all cursor-pointer flex flex-col",
                    isActive && "ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-50 shadow-xl"
                  )}
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="p-6 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Order ID</p>
                         <h3 className="font-black text-slate-900 leading-none">#{(order.id || order._id)?.slice(-8).toUpperCase()}</h3>
                      </div>
                      <Badge className={cn(
                        "rounded-lg font-black text-[10px] uppercase px-2.5 py-1",
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {order.order_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                       <Clock size={12} />
                       <span>Placed {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/30 flex-1">
                    <div className="space-y-5 relative">
                      {/* Vertical line */}
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                      {steps.slice(0, 4).map((step, idx) => {
                        const isDone = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div key={step.key} className="flex gap-4 items-center relative z-10">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500",
                              isDone ? "bg-blue-600 text-white shadow-lg shadow-blue-100" :
                              isCurrent ? "bg-slate-900 text-white shadow-xl scale-110" : "bg-white text-slate-200 border border-slate-100"
                            )}>
                              {isDone ? <Check size={16} strokeWidth={3} /> : <step.icon size={16} />}
                            </div>
                            <span className={cn(
                              "text-xs font-black transition-colors duration-500",
                              isCurrent ? "text-slate-900 uppercase tracking-widest" : isDone ? "text-slate-500" : "text-slate-300"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-6 bg-white flex items-center justify-between border-t border-slate-50">
                    <span className="font-black text-slate-900 text-lg">${order.total_amount.toFixed(2)}</span>
                    <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-widest">
                      <span>View Receipt</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transaction Details"
        className="max-w-xl"
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white">
               <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
                  <h3 className="text-2xl font-black capitalize tracking-tight">{selectedOrder.order_status}</h3>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Order #</p>
                  <p className="font-bold">{(selectedOrder.id || selectedOrder._id)?.slice(-12).toUpperCase()}</p>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] px-2">Your Items</h4>
               <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start font-bold text-slate-700">
                       <div className="flex gap-3">
                          <span className="text-blue-600">{item.quantity}x</span>
                          <span>{item.product_id?.name || 'Delicacy'}</span>
                       </div>
                       <span className="text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-900">Paid Amount</span>
                    <span className="text-2xl font-black text-blue-600">${selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
               <Info className="text-blue-600 shrink-0" />
               <p className="text-xs text-blue-700 font-medium leading-relaxed">
                 Estimated preparation time: 15-20 minutes. Please keep this screen open or refresh periodically for live updates from our kitchen staff.
               </p>
            </div>

            <Button onClick={() => setIsModalOpen(false)} className="w-full h-14 rounded-2xl font-black">
              Return to Trackings
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTracking;
