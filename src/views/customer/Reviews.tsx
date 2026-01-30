import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { MOCK_REVIEWS } from '../../utils/mockData';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

const Reviews: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
          <p className="text-gray-600">See what our customers have to say about us.</p>
        </div>
        <div className="flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-xl border border-orange-100">
          <div className="text-4xl font-extrabold text-orange-600">4.8</div>
          <div>
            <div className="flex text-orange-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill={i <= 4 ? 'currentColor' : 'none'} />
              ))}
            </div>
            <div className="text-xs text-orange-800 font-medium mt-1">Based on 124 reviews</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Submission */}
        <div className="lg:col-span-1">
          <Card title="Leave a Review" subtitle="Share your experience with us">
            <div className="space-y-6">
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
                />
              </div>
              <Button className="w-full" size="lg">Submit Review</Button>
            </div>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {MOCK_REVIEWS.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                    JC
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">John Customer</h4>
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
              <p className="text-gray-600 mb-6">{review.comment}</p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                  <ThumbsUp size={16} /> Helpfull (12)
                </button>
                <button className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                  <MessageSquare size={16} /> Reply
                </button>
              </div>
            </Card>
          ))}
          <Button variant="outline" className="w-full">Load More Reviews</Button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
