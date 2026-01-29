import React from 'react';
import { TrendingUp, ShoppingBag, Star, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MOCK_BRANCHES } from '../../utils/mockData';

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue</p>
              <h3 className="text-2xl font-bold">$12,450.00</h3>
            </div>
            <TrendingUp className="text-orange-200" size={32} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">458</h3>
            </div>
            <ShoppingBag className="text-gray-400" size={32} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Rating</p>
              <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
            </div>
            <Star className="text-gray-400" size={32} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Customers</p>
              <h3 className="text-2xl font-bold text-gray-900">1,240</h3>
            </div>
            <Users className="text-gray-400" size={32} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Revenue by Branch">
          <div className="space-y-4 mt-4">
            {MOCK_BRANCHES.map(branch => (
              <div key={branch.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{branch.name}</span>
                  <span className="text-gray-500">$4,200</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Selling Items">
          <div className="divide-y divide-gray-100 mt-4">
            {[
              { name: 'Beef Burger', sales: 145, revenue: '$2,463' },
              { name: 'Grilled Salmon', sales: 98, revenue: '$2,352' },
              { name: 'Calamari', sales: 120, revenue: '$1,500' },
            ].map((item, i) => (
              <div key={i} className="py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400">#{i+1}</span>
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{item.revenue}</p>
                  <p className="text-xs text-gray-500">{item.sales} sold</p>
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
