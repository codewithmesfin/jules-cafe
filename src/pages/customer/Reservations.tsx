import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_RESERVATIONS } from '../../utils/mockData';

const Reservations: React.FC = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Reservation requested! We will notify you once it is confirmed.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reservations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reservation Form */}
        <div>
          <Card title="Book a Table" subtitle="Fill in the details to reserve your spot">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <Input
                  label="Time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <Input
                label="Number of Guests"
                type="number"
                min="1"
                max="20"
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                  placeholder="Allergies, special occasions, etc."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Request Reservation
              </Button>
            </form>
          </Card>
        </div>

        {/* Reservation History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Recent Reservations</h2>
          {MOCK_RESERVATIONS.length > 0 ? (
            MOCK_RESERVATIONS.map((res) => (
              <Card key={res.id}>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <CalendarIcon size={18} className="text-orange-600" />
                      {new Date(res.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        {res.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {res.number_of_people} Guests
                      </div>
                    </div>
                    {res.note && (
                      <div className="flex items-start gap-1 text-xs text-gray-400 mt-2 italic">
                        <MessageSquare size={14} className="mt-0.5" />
                        {res.note}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-end justify-between">
                    <Badge
                      variant={
                        res.status === 'approved' ? 'success' :
                        res.status === 'pending' ? 'warning' :
                        res.status === 'cancelled' ? 'error' : 'neutral'
                      }
                      className="capitalize"
                    >
                      {res.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400 mt-auto">
                      Booked on {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No previous reservations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
