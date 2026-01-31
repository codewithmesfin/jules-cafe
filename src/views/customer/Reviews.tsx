"use client";
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Review, User, Branch } from '../../types';

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revData, userData, brData] = await Promise.all([
        api.reviews.getAll(),
        api.users.getAll(),
        api.branches.getAll(),
      ]);
      setReviews(revData.filter((r: Review) => r.is_approved));
      setUsers(userData);
      setBranches(brData);
      if (brData.length > 0) setSelectedBranchId(brData[0].id);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification('Please login to leave a review', 'error');
      return;
    }
    if (rating === 0) {
      showNotification('Please select a rating', 'error');
      return;
    }

    try {
      await api.reviews.create({
        customer_id: user.id,
        branch_id: selectedBranchId,
        rating,
        comment,
        is_approved: false // Needs moderation
      });
      showNotification('Thank you! Your review has been submitted for approval.');
      setRating(0);
      setComment('');
      fetchData();
    } catch (error) {
      showNotification('Failed to submit review', 'error');
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
          <p className="text-gray-600">See what our customers have to say about us.</p>
        </div>
        <div className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-xl border border-orange-100">
          <div className="text-4xl font-extrabold text-orange-600">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex text-orange-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill={i <= Math.round(averageRating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <div className="text-xs text-orange-800 font-medium mt-1">Based on {reviews.length} reviews</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Submission */}
        <div className="lg:col-span-1">
          <Card title="Leave a Review" subtitle="Share your experience with us">
            <div className="space-y-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.branch_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoveredRating(i)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(i)}
                      className="transition-colors"
                    >
                      <Star
                        size={32}
                        className={cn(
                          'transition-colors',
                          (hoveredRating || rating) >= i ? 'text-orange-400 fill-orange-400' : 'text-gray-300'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
                  placeholder="Tell us what you liked or how we can improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleSubmit}>Submit Review</Button>
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="text-center py-10">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => {
              const customerId = typeof review.customer_id === 'string' ? review.customer_id : (review.customer_id as any)?.id;
              const customer = users.find(u => u.id === customerId);
              return (
                <Card key={review.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {(customer?.full_name || customer?.username || 'A').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{customer?.full_name || customer?.username || 'Anonymous'}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-orange-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={14} fill={i <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{review.comment}"</p>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                      <ThumbsUp size={16} /> Helpful
                    </button>
                    <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                      <MessageSquare size={16} /> Reply
                    </button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No reviews found yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
