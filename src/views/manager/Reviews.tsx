"use client";
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User } from 'lucide-react';
import { api } from '../../utils/api';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { Review, User as UserType } from '../../types';

const Reviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.branch_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revData, userData] = await Promise.all([
        api.reviews.getAll(),
        api.users.getAll(),
      ]);
    setReviews(revData.filter((r: Review) => {
      const branchId = typeof r.branch_id === 'string' ? r.branch_id : (r.branch_id as any)?.id;
      const userBId = typeof user?.branch_id === "string" ? user?.branch_id : (user?.branch_id as any)?.id;
      return branchId === userBId;
    }));
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch manager reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <Star size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          Please associate this account with a branch to view reviews.
        </p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Branch Reviews</h1>
        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full text-orange-700 font-bold">
          <Star size={16} className="fill-orange-500" />
          {reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : 'N/A'
          }
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No reviews yet for this branch.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map(review => {
            const customerId = typeof review.customer_id === 'string' ? review.customer_id : (review.customer_id as any)?.id;
            const customer = users.find(u => u.id === customerId);
            return (
              <Card key={review.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{customer?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-orange-400">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} fill={i <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
                {!review.is_approved && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                      Pending Approval
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reviews;
