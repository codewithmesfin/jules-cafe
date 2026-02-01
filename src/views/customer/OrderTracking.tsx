"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Package, ChefHat, Check, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { api } from '../../utils/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';

const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!user); // Only loading if user exists initially

  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'completed', label: 'Delivered', icon: Check },
  ];

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        setLoading(true);
        const data = await api.orders.getAll();
        const userOrders = data.filter((o: Order) => {
           const customerId = typeof o.customer_id === 'string' ? o.customer_id : (o.customer_id as any)?.id;
           return customerId === user?.id;
        });
        if (userOrders.length > 0) {
          userOrders.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setOrder(userOrders[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user orders:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchLatestOrder();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  // 1. Guest State - Login/Signup CTA
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner mb-8">
          <ShoppingBag className="w-12 h-12" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Track Your Feast</h1>
        <p className="text-gray-500 max-w-md mb-10 text-lg leading-relaxed">
          Log in or create an account to view your active orders and track their status in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/login" className="flex-1">
            <Button className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-100 font-black gap-2">
              <LogIn size={20} /> Login Now
            </Button>
          </Link>
          <Link href="/signup" className="flex-1">
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
      <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Locating your latest order...</p>
    </div>
  );

  // 2. No Orders State
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mb-8">
           <Package size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No active orders found</h1>
        <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't placed any orders yet. Ready to try something new?</p>
        <Link href="/menu">
          <Button className="rounded-2xl px-12 py-6 font-black bg-orange-600 shadow-xl shadow-orange-100">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);

  // 3. Active Order State
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Live Order Tracker</h1>
           <p className="text-gray-500 font-medium italic">We're working hard on your meal!</p>
        </div>
        <Badge variant="info" className="px-4 py-2 font-black rounded-xl text-sm uppercase tracking-widest">
           Live Update
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Status Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 relative z-10">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">Receipt ID</p>
                <h3 className="text-2xl font-black text-gray-900">#{order.order_number.split('-').pop()}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Status</p>
                <Badge variant={order.status === 'completed' ? 'success' : 'warning'} className="text-xs px-4 py-1.5 capitalize font-black rounded-lg">
                  {order.status}
                </Badge>
              </div>
            </div>

            {/* Visual Progress Steps */}
            <div className="space-y-10 relative z-10">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex gap-6 relative">
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "absolute left-6 top-12 w-0.5 h-10 -ml-px transition-colors duration-500",
                        index < currentStepIndex ? "bg-orange-600" : "bg-gray-100"
                      )} />
                    )}

                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg",
                      isActive ? "bg-orange-600 text-white shadow-orange-200" : "bg-gray-50 text-gray-300 shadow-none border border-gray-100"
                    )}>
                      {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={24} />}
                    </div>

                    <div className="flex flex-col justify-center">
                      <h4 className={cn(
                        "text-lg font-black transition-colors duration-500",
                        isActive ? "text-gray-900" : "text-gray-300"
                      )}>
                        {step.label}
                      </h4>
                      {isActive && !isCompleted && (
                        <p className="text-orange-600 text-xs font-black uppercase tracking-widest mt-0.5 animate-pulse">In Progress</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Details Column */}
        <div className="space-y-8">
          <Card title="Order Summary" className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] bg-white p-8">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Subtotal</span>
                <span className="font-black text-gray-900">${(order.total_amount + (order.discount_amount || 0)).toFixed(2)}</span>
              </div>
              {!!order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-bold">
                  <span>Loyalty Discount</span>
                  <span>-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-900 font-black uppercase tracking-widest text-sm">Grand Total</span>
                <span className="text-3xl font-black text-orange-600">${order.total_amount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4">
                Ordered on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </Card>

          <Card title="Delivery Details" className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] bg-gray-900 text-white p-8">
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Package className="text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Type</p>
                    <p className="font-black capitalize">{order.type}</p>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-sm font-medium text-gray-300 leading-relaxed">
                  Please proceed to the counter or await server once status reaches <span className="text-orange-500 font-black">"Ready"</span>.
                </p>
              </div>

              <div className="flex items-center gap-3 text-orange-500 font-black">
                 <Clock size={18} />
                 <span className="text-sm uppercase tracking-widest">Est. Wait: 15-20 Mins</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Simple icon for placeholder
const ShoppingBag = ({ className, size, strokeWidth }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

export default OrderTracking;
