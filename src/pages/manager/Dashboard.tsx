import React from 'react';
import { Card } from '../../components/ui/Card';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Today's Orders">
          <p className="text-3xl font-bold">24</p>
        </Card>
        <Card title="Reservations">
          <p className="text-3xl font-bold">12</p>
        </Card>
        <Card title="Active Tables">
          <p className="text-3xl font-bold">8 / 15</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
