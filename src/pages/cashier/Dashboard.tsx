import React from 'react';
import { Card } from '../../components/ui/Card';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Active Orders">
          <p className="text-3xl font-bold">5</p>
        </Card>
        <Card title="New Order">
          <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700">
            Create Walk-in Order
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
