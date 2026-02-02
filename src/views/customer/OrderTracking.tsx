"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Package, ChefHat, Check, LogIn, UserPlus, ShoppingBag as ShoppingBagIcon, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../utils/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { getSocket, joinCustomerRoom } from '../../utils/socket';
import type { Order } from '../../types';

const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const params = useParams();
  const tenantId = params?.tenant_id as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'completed', label: 'Delivered', icon: Check },
  ];

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      const userOrders = data.filter((o: Order) => {
        const customerId = typeof o.customer_id === 'string' ? o.customer_id : (o.customer_id as any)?.id;
        return customerId === user?.id;
      });
      userOrders.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(userOrders);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
      joinCustomerRoom(user.id);
      
      const socket = getSocket();
      
      socket.on('new-order', (data: any) => {
        console.log('Customer received new-order event:', data);
        fetchOrders();
      });
      
      socket.on('order-status-update', (data: { orderId: string; orderNumber: string; status: string }) => {
        console.log('Customer received order-status-update:', data);
        setOrders(prev => prev.map(order => 
          order.id === data.orderId ? { ...order, status: data.status as any } : order
        ));
        fetchOrders();
      });
      
      return () => {
        socket.off('new-order');
        socket.off('order-status-update');
      };
    }
  }, [user?.id]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // 1. Guest State
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-orange-50 text-[#e60023] rounded-3xl flex items-center justify-center shadow-inner mb-8">
          <ShoppingBagIcon className="w-12 h-12" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Track Your Feast</h1>
        <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
          Log in or create an account to view your active orders and track their status in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href={tenantId ? `/${tenantId}/login` : "/login"} className="flex-1">
            <Button className="w-full h-14 rounded-2xl bg-[#e60023] hover:bg-[#ad081b] shadow-xl shadow-orange-100 font-black gap-2">
              <LogIn size={20} /> Login Now
            </Button>
          </Link>
          <Link href={tenantId ? `/${tenantId}/signup` : "/signup"} className="flex-1">
            <Button variant="outline" className="w-full h-14 rounded-2xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 font-black gap-2 text-gray-900">
              <UserPlus size={20} /> Sign Up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-10 h-10 border-4 border-orange-200 border-t-[#e60023] rounded-full animate-spin"></div>
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading your orders...</p>
    </div>
  );

  // 2. No Orders State
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mb-8">
           <Package size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No orders found</h1>
        <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't placed any orders yet. Ready to try something new?</p>
        <Link href={tenantId ? `/${tenantId}/menu` : "/menu"}>
          <Button className="rounded-2xl px-12 py-6 font-black bg-[#e60023] shadow-xl shadow-orange-100">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  // 3. Orders List
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Orders</h1>
           <p className="text-gray-500 font-medium italic">Track all your orders in real-time</p>
        </div>
        <Badge variant="info" className="px-4 py-2 font-black rounded-xl text-sm uppercase tracking-widest">
           Live Update
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => {
          const currentStepIndex = getCurrentStepIndex(order.status);
          const isActive = !['completed', 'cancelled'].includes(order.status);
          const orderItems = (order as any).items || [];

          return (
            <Card 
              key={order.id} 
              className={cn(
                "p-0 overflow-hidden flex flex-col border-gray-100 rounded-[2rem] transition-all cursor-pointer hover:shadow-2xl hover:shadow-gray-200/50",
                isActive && "hover:border-orange-200"
              )}
              onClick={() => handleOrderClick(order)}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-[#e60023] uppercase tracking-widest mb-1">
                      Order #{order.order_number.split('-').pop()}
                    </span>
                    <h3 className="font-black text-gray-900 truncate">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h3>
                  </div>
                  <Badge variant={order.type === 'walk-in' ? 'info' : 'neutral'} className="font-black shrink-0">
                    {order.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  <div className="flex items-center gap-1">
                    <Package size={12} className="text-gray-300" />
                    <span>{orderItems.length} items</span>
                  </div>
                  <span className="font-black text-gray-900">ETB {order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="p-5 bg-gray-50/30">
                <div className="space-y-3 relative z-10">
                  {steps.map((step, index) => {
                    const isStepActive = index <= currentStepIndex;
                    const isStepCompleted = index < currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {index < steps.length - 1 && (
                          <div className={cn(
                            "absolute left-5 top-8 w-0.5 h-6 -ml-px transition-colors duration-500",
                            index < currentStepIndex ? "bg-[#e60023]" : "bg-gray-100"
                          )} />
                        )}

                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                          isStepActive ? "bg-[#e60023] text-white" : "bg-gray-50 text-gray-300 border border-gray-100"
                        )}>
                          {isStepCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                        </div>

                        <div className="flex flex-col justify-center">
                          <h4 className={cn(
                            "text-sm font-bold transition-colors duration-500",
                            isStepActive ? "text-gray-900" : "text-gray-300"
                          )}>
                            {step.label}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white flex items-center justify-between border-t border-gray-50">
                <Badge
                  variant={
                    order.status === 'preparing' ? 'warning' :
                    order.status === 'ready' ? 'info' :
                    order.status === 'completed' ? 'success' : 
                    order.status === 'cancelled' ? 'error' : 'neutral'
                  }
                  className="capitalize px-3 py-1 rounded-lg font-black text-xs"
                >
                  {order.status}
                </Badge>
                <div className="flex items-center gap-2 text-[#e60023] font-black text-sm">
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Order #${selectedOrder?.order_number.split('-').pop()}`}>
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-bold">Status</span>
              <Badge
                variant={
                  selectedOrder.status === 'preparing' ? 'warning' :
                  selectedOrder.status === 'ready' ? 'info' :
                  selectedOrder.status === 'completed' ? 'success' : 
                  selectedOrder.status === 'cancelled' ? 'error' : 'neutral'
                }
                className="capitalize px-3 py-1 rounded-lg font-black"
              >
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Order Progress */}
            <div className="space-y-4">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Order Progress</h4>
              <div className="space-y-3 relative z-10">
                {steps.map((step, index) => {
                  const isStepActive = index <= getCurrentStepIndex(selectedOrder.status);
                  const isStepCompleted = index < getCurrentStepIndex(selectedOrder.status);
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex gap-4 relative">
                      {index < steps.length - 1 && (
                        <div className={cn(
                          "absolute left-5 top-8 w-0.5 h-6 -ml-px transition-colors duration-500",
                          index < getCurrentStepIndex(selectedOrder.status) ? "bg-[#e60023]" : "bg-gray-100"
                        )} />
                      )}

                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500",
                        isStepActive ? "bg-[#e60023] text-white" : "bg-gray-50 text-gray-300 border border-gray-100"
                      )}>
                        {isStepCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                      </div>

                      <div className="flex flex-col justify-center">
                        <h4 className={cn(
                          "text-base font-bold transition-colors duration-500",
                          isStepActive ? "text-gray-900" : "text-gray-300"
                        )}>
                          {step.label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Order Items</h4>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {(selectedOrder as any).items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[#e60023] font-black">{item.quantity}x</span>
                      <div>
                        <p className="font-bold text-gray-900">{item.menu_item_name}</p>
                        {item.variant_name && (
                          <p className="text-xs text-gray-500">{item.variant_name}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-gray-900">ETB {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-black text-gray-900">ETB {(selectedOrder.total_amount + (selectedOrder.discount_amount || 0)).toFixed(2)}</span>
              </div>
              {!!selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-ETB {selectedOrder.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Total</span>
                <span className="text-2xl font-black text-[#e60023]">ETB {selectedOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order Type</span>
                <span className="font-bold text-gray-900 capitalize">{selectedOrder.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order Date</span>
                <span className="font-bold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm">Order Time</span>
                <span className="font-bold text-gray-900">{new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <Button onClick={handleCloseModal} className="w-full h-12 rounded-xl font-black">
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTracking;
