"use client";
import React, { useState, useEffect } from 'react';
import { Edit, User as UserIcon } from 'lucide-react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const ProfilePage: React.FC = () => {
  const { user: currentUser, currentBusiness } = useAuth();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formCurrentPassword, setFormCurrentPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormFullName(currentUser.full_name || '');
      setFormEmail(currentUser.email);
      setFormPhone(currentUser.phone || '');
      setLoading(false);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!formFullName || !formEmail) {
      showNotification("Name and email required", "error");
      return;
    }
    
    try {
      const userData = { 
        full_name: formFullName, 
        email: formEmail, 
        phone: formPhone, 
        password: formPassword || undefined,
        current_password: formCurrentPassword
      };
      
      const userId = currentUser?.id || currentUser?._id;
      if (!userId) {
        showNotification("User not found", "error");
        return;
      }
      
      const response = await api.users.update(userId, userData);
      showNotification("Profile updated");
      setIsModalOpen(false);
      
      // Update auth context
      setUser(response.data || response);
      
    } catch (error: any) {
      showNotification(error.message || "Failed to update profile", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-500 text-sm">Manage your account</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Edit size={18} className="mr-2" /> Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xl">
            {(user.full_name || 'U').charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{user.full_name || 'User'}</h2>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 font-medium mb-1">Role</p>
            <Badge variant="neutral" size="sm" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">Status</p>
            <Badge variant={user.status === 'active' ? 'success' : 'neutral'} size="sm">
              {user.status}
            </Badge>
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">Phone</p>
            <p className="text-slate-900">{user.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium mb-1">Business</p>
            <p className="text-slate-900">{currentBusiness?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Profile"
        size="lg"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Update</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Staff name"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="email@example.com"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <Input
            label="Phone"
            placeholder="+251..."
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={formCurrentPassword}
            onChange={(e) => setFormCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password (optional)"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;