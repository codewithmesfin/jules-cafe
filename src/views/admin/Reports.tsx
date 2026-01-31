import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ShoppingBag, TrendingUp, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../utils/api';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.stats.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20">Loading Reports...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Gross Sales</p>
            <h3 className="text-2xl font-bold text-gray-900">
              ${stats?.revenuePerDay.reduce((acc: number, curr: any) => acc + curr.total, 0).toLocaleString()}
            </h3>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.avgRating.toFixed(1) || '0.0'}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Orders per Branch">
          <div className="space-y-6 py-4">
            {stats?.topBranches.map((branch: any) => (
              <div key={branch.branch_name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{branch.branch_name}</span>
                  <span className="text-gray-500">{branch.count} orders</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-orange-500"
                    style={{ width: `${Math.min(100, (branch.count / (stats.totalOrders || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Revenue Growth (Daily)">
          <div className="space-y-6 py-4">
            {stats?.revenuePerDay.map((day: any) => (
              <div key={day._id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{day._id}</span>
                  <span className="text-gray-500">${day.total.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-blue-500"
                    style={{ width: `${Math.min(100, (day.total / (stats.revenuePerDay.reduce((a: any, b: any) => Math.max(a, b.total), 0) || 1)) * 100)}%` }}
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
