import React from 'react';
import { ShoppingBag, Users, Calendar, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { MOCK_ORDERS } from '../../utils/mockData';
import { cn } from '../../utils/cn';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Today Revenue', value: '$4,350', icon: DollarSign, trend: '+15.2%', trendType: 'up' },
    { label: 'Total Orders', value: '1,284', icon: ShoppingBag, trend: '+12.5%', trendType: 'up' },
    { label: 'Total Customers', value: '842', icon: Users, trend: '+5.2%', trendType: 'up' },
    { label: 'Reservations', value: '42', icon: Calendar, trend: '-2.4%', trendType: 'down' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                'flex items-center text-sm font-medium',
                stat.trendType === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {stat.trend}
                {stat.trendType === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Preview */}
        <div className="lg:col-span-2">
          <Card title="Revenue Overview (Last 7 Days)">
            <div className="h-64 flex items-end justify-between gap-2 px-2 pb-2">
              {[45, 60, 55, 75, 90, 85, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-orange-100 rounded-t-sm relative group">
                    <div
                      className="w-full bg-orange-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ${(height * 50).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">Day {i+1}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Branches */}
        <div className="lg:col-span-1">
          <Card title="Top Branches by Sales">
            <div className="space-y-4">
              {[
                { name: 'Downtown', sales: '$45,000', growth: '+12%' },
                { name: 'Westside', sales: '$32,500', growth: '+8%' },
                { name: 'East Side', sales: '$28,400', growth: '+5%' },
              ].map((branch) => (
                <div key={branch.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold text-sm">{branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.sales}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">{branch.growth}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card title="Recent Orders">
            <Table
              data={MOCK_ORDERS}
              columns={[
                { header: 'Order ID', accessor: 'order_number' },
                { header: 'Date', accessor: (item) => new Date(item.created_at).toLocaleDateString() },
                { header: 'Amount', accessor: (item) => `$${item.total_amount.toFixed(2)}` },
                {
                  header: 'Status',
                  accessor: (item) => (
                    <Badge
                      variant={
                        item.status === 'completed' ? 'success' :
                        item.status === 'cancelled' ? 'error' : 'warning'
                      }
                      className="capitalize"
                    >
                      {item.status}
                    </Badge>
                  )
                },
              ]}
            />
          </Card>
        </div>

        {/* Popular Categories */}
        <div className="lg:col-span-1">
          <Card title="Sales by Category">
            <div className="space-y-6">
              {[
                { name: 'Main Courses', percentage: 65, color: 'bg-orange-500' },
                { name: 'Beverages', percentage: 20, color: 'bg-blue-500' },
                { name: 'Appetizers', percentage: 10, color: 'bg-green-500' },
                { name: 'Desserts', percentage: 5, color: 'bg-purple-500' },
              ].map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-gray-500">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', cat.color)} style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
