"use client";
import React, { useState } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';

const ChangePasswordPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formCurrentPassword, setFormCurrentPassword] = useState('');
  const [formNewPassword, setFormNewPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!formCurrentPassword || !formNewPassword) {
      showNotification("Current and new password required", "error");
      return;
    }
    
    if (formNewPassword !== formConfirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.users.updatePassword(currentUser?.id || currentUser?._id, {
        current_password: formCurrentPassword,
        new_password: formNewPassword
      });
      showNotification("Password changed successfully");
      setFormCurrentPassword('');
      setFormNewPassword('');
      setFormConfirmPassword('');
    } catch (error: any) {
      showNotification(error.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Change Password</h1>
          <p className="text-slate-500 text-sm">Update your account password</p>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="space-y-4">
          <Input
            label="Current Password *"
            type="password"
            placeholder="Enter current password"
            value={formCurrentPassword}
            onChange={(e) => setFormCurrentPassword(e.target.value)}
          />
          <Input
            label="New Password *"
            type="password"
            placeholder="Enter new password"
            value={formNewPassword}
            onChange={(e) => setFormNewPassword(e.target.value)}
          />
          <Input
            label="Confirm New Password *"
            type="password"
            placeholder="Confirm new password"
            value={formConfirmPassword}
            onChange={(e) => setFormConfirmPassword(e.target.value)}
          />
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => {
              setFormCurrentPassword('');
              setFormNewPassword('');
              setFormConfirmPassword('');
            }}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;