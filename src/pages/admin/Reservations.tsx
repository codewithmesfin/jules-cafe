import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, Check, X, User } from 'lucide-react';
import { MOCK_RESERVATIONS, MOCK_USERS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

const Reservations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by customer name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon size={16} /> Today
          </Button>
          <Button variant="outline" size="sm">History</Button>
        </div>
      </div>

      <Table
        data={MOCK_RESERVATIONS}
        columns={[
          {
            header: 'Customer',
            accessor: (res) => {
              const customer = MOCK_USERS.find(u => u.id === res.customer_id);
              return (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{customer?.full_name || 'Guest'}</span>
                </div>
              );
            }
          },
          { header: 'Date', accessor: (res) => res.reservation_date },
          { header: 'Time', accessor: (res) => res.reservation_time },
          { header: 'Guests', accessor: (res) => res.guests_count },
          {
            header: 'Status',
            accessor: (res) => (
              <Badge
                variant={
                  res.status === 'confirmed' ? 'success' :
                  res.status === 'requested' ? 'warning' : 'neutral'
                }
                className="capitalize"
              >
                {res.status}
              </Badge>
            )
          },
          {
            header: 'Actions',
            accessor: (res) => (
              <div className="flex items-center gap-2">
                {res.status === 'requested' && (
                  <>
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                      <Check size={16} />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <X size={16} />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">Details</Button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default Reservations;
