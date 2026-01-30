"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Package, ChefHat, Check } from 'lucide-react';
import { api } from '../../utils/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import type { Order } from '../../types';

const OrderTracking: React.FC = () => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
        const userOrders = data.filter((o: Order) => o.customer_id === user?.id);
        if (userOrders.length > 0) {
          // Sort by date desc
          userOrders.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setOrder(userOrders[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user orders:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchLatestOrder();
  }, [user?.id]);

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  if (loading) return <div className="text-center py-20">Locating your latest order...</div>;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">No active orders found</h1>
        <p className="text-gray-500">Go ahead and order something delicious!</p>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <h3 className="text-xl font-bold">{order.order_number}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge variant="warning" className="text-base px-4 py-1 capitalize">
                {order.status}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-12 mb-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-300',
                        isActive ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={cn(
                        'absolute top-12 text-[10px] sm:text-xs font-medium whitespace-nowrap',
                        isActive ? 'text-orange-600' : 'text-gray-400'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Order Summary">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-lg">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Type</span>
                <span className="capitalize">{order.type}</span>
              </div>
              <hr />
              <p className="text-xs text-gray-400">
                Created on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </Card>
          <Card title="Pickup Info">
            <p className="text-gray-600">Self-service Order</p>
            <p className="text-sm text-gray-500 mt-2">Please proceed to the counter once status is "Ready".</p>
            <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
              Estimated wait: <strong>15-20 minutes</strong>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
