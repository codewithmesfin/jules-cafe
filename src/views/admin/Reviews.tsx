import React, { useState, useEffect } from 'react';
import { Search, Star, Eye, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import type { Review, User } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';

const Reviews: React.FC = () => {
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revData, userData] = await Promise.all([
        api.reviews.getAll(),
        api.users.getAll(),
      ]);
      setReviews(revData);
      setUsers(userData);
    } catch (error) {
      showNotification('Failed to fetch reviews', 'error');
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (review: Review) => {
    try {
      await api.reviews.update(review.id, { is_approved: !review.is_approved });
      showNotification('Review status updated', 'success');
      fetchData();
    } catch (error) {
      showNotification('Failed to update review', 'error');
    }
  };

  const handleDelete = (id: string) => {
    setReviewToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (reviewToDelete) {
      try {
        await api.reviews.delete(reviewToDelete);
        showNotification('Review deleted successfully', 'success');
        fetchData();
      } catch (error) {
        showNotification('Failed to delete review', 'error');
      } finally {
        setIsConfirmOpen(false);
        setReviewToDelete(null);
      }
    }
  };

  const filteredReviews = reviews.filter(rev => {
    const customerId = typeof rev.customer_id === 'string' ? rev.customer_id : (rev.customer_id as any)?.id;
    const customer = users.find(u => u.id === customerId);
    const name = customer?.full_name || customer?.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rev.comment.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

      {loading ? (
        <div className="text-center py-10">Loading reviews...</div>
      ) : (
        <Table
          data={filteredReviews}
          columns={[
            {
              header: 'Customer',
              accessor: (rev) => {
                const customerId = typeof rev.customer_id === 'string' ? rev.customer_id : (rev.customer_id as any)?.id;
                const customer = users.find(u => u.id === customerId);
                return customer?.full_name || customer?.username || 'Guest';
              }
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
                  <Button
                    variant="ghost"
                    size="sm"
                    title={rev.is_approved ? "Unapprove" : "Approve"}
                    onClick={() => handleToggleApproval(rev)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(rev.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
};

export default Reviews;
