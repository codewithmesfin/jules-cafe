import React from 'react';
import { CheckCircle2, Clock, Package, ChefHat, Check } from 'lucide-react';
import { MOCK_ORDERS } from '../../utils/mockData';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

const OrderTracking: React.FC = () => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'served', label: 'Served', icon: Check },
  ];

  const currentOrder = MOCK_ORDERS[1]; // Simulate an active order

  const getCurrentStepIndex = (status: string) => {
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIndex = getCurrentStepIndex(currentOrder.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <h3 className="text-xl font-bold">{currentOrder.order_number}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge variant="warning" className="text-base px-4 py-1 capitalize">
                {currentOrder.status}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-12 mb-12">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
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
                        'absolute top-12 text-xs font-medium whitespace-nowrap',
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
          <Card title="Order Details">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Items (2)</span>
                <span className="font-medium">$18.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">$1.52</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>$20.51</span>
              </div>
            </div>
          </Card>
          <Card title="Delivery Address">
            <p className="text-gray-600">Table No. 12</p>
            <p className="text-gray-600">Main Hall, Floor 1</p>
            <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
              Estimated delivery in <strong>15-20 minutes</strong>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
