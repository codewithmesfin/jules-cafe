import React, { useState } from 'react';
import { User, Calendar, Shield, ShoppingBag, Star, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.users.update(user.id, formData);
      showNotification("Profile updated successfully");
      // Note: Ideally we would refresh the auth user state here too
    } catch (error) {
      showNotification("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="text-center py-8">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <User size={48} />
            </div>
            <h3 className="text-xl font-bold">{user.full_name || user.username || 'User'}</h3>
            <p className="text-gray-500 capitalize mb-6">{user.role}</p>
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline">Change Photo</Button>
            </div>
          </Card>

          <Card title="Activity Stats">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <ShoppingBag size={20} className="mx-auto mb-2 text-orange-500" />
                <p className="text-xl font-bold">12</p>
                <p className="text-[10px] text-gray-500 uppercase">Orders</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Star size={20} className="mx-auto mb-2 text-yellow-500" />
                <p className="text-xl font-bold">5</p>
                <p className="text-[10px] text-gray-500 uppercase">Reviews</p>
              </div>
            </div>
          </Card>

          <Card title="Account Info">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Shield size={18} className="text-gray-400" />
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium capitalize">{user.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <p className="text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Personal Details">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
                <Input label="Email Address" defaultValue={user.email} disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button">Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Favorite Dish">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Heart size={24} className="text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="font-bold">Beef Burger</p>
                  <p className="text-xs text-gray-500">Ordered 4 times</p>
                </div>
              </div>
            </Card>

            <Card title="Security">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm">Update Password</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
