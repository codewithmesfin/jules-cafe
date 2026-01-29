import React, { useState } from 'react';
import { Search, Star, MapPin, Check, X } from 'lucide-react';
import { MOCK_REVIEWS, MOCK_USERS, MOCK_BRANCHES } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

const Reviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search reviews..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <Table
        data={MOCK_REVIEWS}
        columns={[
          {
            header: 'Branch',
            accessor: (rev) => (
              <div className="flex items-center gap-1 text-xs">
                <MapPin size={12} /> {MOCK_BRANCHES.find(b => b.id === rev.branch_id)?.name}
              </div>
            )
          },
          {
            header: 'Customer',
            accessor: (rev) => MOCK_USERS.find(u => u.id === rev.customer_id)?.full_name || 'Guest'
          },
          {
            header: 'Rating',
            accessor: (rev) => (
              <div className="flex text-orange-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill={i <= rev.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            )
          },
          { header: 'Comment', accessor: 'comment', className: 'max-w-xs truncate' },
          {
            header: 'Status',
            accessor: (rev) => (
              <Badge variant={rev.is_approved ? 'success' : 'neutral'}>
                {rev.is_approved ? 'Approved' : 'Pending'}
              </Badge>
            )
          },
          { header: 'Date', accessor: (rev) => new Date(rev.created_at).toLocaleDateString() },
          {
            header: 'Actions',
            accessor: (rev) => (
              <div className="flex items-center gap-2">
                {!rev.is_approved && (
                  <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                    <Check size={14} className="mr-1" /> Approve
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-600">
                  <X size={14} className="mr-1" /> Delete
                </Button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default Reviews;
