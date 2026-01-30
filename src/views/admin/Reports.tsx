import React from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, TrendingUp, Star } from 'lucide-react';
import { cn } from '../../utils/cn';

const Reports: React.FC = () => {
  const branchData = [
    { name: 'Downtown', value: 400, max: 500, color: 'bg-orange-500' },
    { name: 'Westside', value: 300, max: 500, color: 'bg-orange-500' },
    { name: 'North End', value: 200, max: 500, color: 'bg-orange-500' },
    { name: 'East Side', value: 278, max: 500, color: 'bg-orange-500' },
  ];

  const itemData = [
    { name: 'Garlic Bread', value: 450, total: 1440, color: 'bg-orange-500' },
    { name: 'Beef Burger', value: 380, total: 1440, color: 'bg-blue-500' },
    { name: 'Calamari', value: 320, total: 1440, color: 'bg-green-500' },
    { name: 'Grilled Salmon', value: 290, total: 1440, color: 'bg-purple-500' },
  ];

  const ratingData = [
    { name: 'Downtown', rating: 4.8 },
    { name: 'Westside', rating: 4.5 },
    { name: 'North End', rating: 4.2 },
    { name: 'East Side', rating: 4.6 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">1,178</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Gross Sales</p>
            <h3 className="text-2xl font-bold text-gray-900">$24,840</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
            <h3 className="text-2xl font-bold text-gray-900">4.6</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Orders per Branch">
          <div className="space-y-6 py-4">
            {branchData.map((branch) => (
              <div key={branch.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{branch.name}</span>
                  <span className="text-gray-500">{branch.value} orders</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", branch.color)}
                    style={{ width: `${(branch.value / branch.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Selling Items">
          <div className="space-y-6 py-4">
            {itemData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.value} units</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                    style={{ width: `${(item.value / 500) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Average Rating per Branch" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 py-4">
            {ratingData.map((branch) => (
              <div key={branch.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{branch.name}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-orange-400 text-orange-400" />
                    <span className="font-bold">{branch.rating}</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(branch.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
