"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Building2,
  Globe,
  Save,
  Edit,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Mock profile data
const mockProfile = {
  full_name: 'Super Admin',
  email: 'admin@abccafe.com',
  phone: '+251 912 345 678',
  role: 'saas_admin',
  status: 'active',
  avatar: null,
  created_at: new Date('2023-01-01'),
  last_login: new Date('2024-01-15'),
};

// Mock notification settings
const notificationSettings = {
  email_notifications: true,
  admin_created: true,
  business_registered: true,
  payment_received: true,
  invoice_overdue: true,
  system_updates: false,
};

// Mock security settings
const securitySettings = {
  two_factor_enabled: true,
  last_password_change: new Date('2024-01-01'),
  active_sessions: 2,
};

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'system'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [security, setSecurity] = useState(securitySettings);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'system', label: 'System', icon: Globe },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // API call to save profile
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <Button
                  variant={isEditing ? 'primary' : 'secondary'}
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.full_name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {profile.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-gray-100 rounded-full border border-white shadow-sm">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{profile.full_name}</p>
                  <p className="text-sm text-gray-500">{profile.role}</p>
                </div>
              </div>

              {/* Profile form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    disabled={!isEditing}
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <Input
                    value={profile.role}
                    disabled
                    leftIcon={<Shield className="w-5 h-5 text-gray-400" />}
                  />
                </div>
              </div>

              {/* Account status */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-500">Your account is verified and active</p>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        email_notifications: !notifications.email_notifications,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email_notifications
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email_notifications
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Admin Created</p>
                    <p className="text-sm text-gray-500">
                      When a new admin account is created
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        admin_created: !notifications.admin_created,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.admin_created ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.admin_created
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Business Registered</p>
                    <p className="text-sm text-gray-500">
                      When a new business registers on the platform
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        business_registered: !notifications.business_registered,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.business_registered
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.business_registered
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Payment Received</p>
                    <p className="text-sm text-gray-500">
                      When a payment is successfully received
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        payment_received: !notifications.payment_received,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.payment_received
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.payment_received
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Invoice Overdue</p>
                    <p className="text-sm text-gray-500">
                      When an invoice becomes overdue
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        invoice_overdue: !notifications.invoice_overdue,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.invoice_overdue
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.invoice_overdue
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">System Updates</p>
                    <p className="text-sm text-gray-500">
                      Receive updates about system maintenance
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        system_updates: !notifications.system_updates,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.system_updates
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.system_updates
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Security Settings
                </h2>

                {/* Password */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Lock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">
                        Last changed:{' '}
                        {security.last_password_change.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-500">
                        {security.two_factor_enabled
                          ? 'Enabled - Extra security is active'
                          : 'Disabled - Enable for extra security'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={security.two_factor_enabled ? 'success' : 'warning'}
                  >
                    {security.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                {/* Active Sessions */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Active Sessions</p>
                      <p className="text-sm text-gray-500">
                        {security.active_sessions} active sessions
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary">Manage Sessions</Button>
                </div>
              </Card>

              {/* Login Activity */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Login Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Current session
                        </p>
                        <p className="text-xs text-gray-500">
                          Addis Ababa, Ethiopia • Chrome on macOS
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Previous session
                        </p>
                        <p className="text-xs text-gray-500">
                          Addis Ababa, Ethiopia • Firefox on Windows
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Billing Information
              </h2>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Enterprise Plan</p>
                    <p className="text-sm text-blue-700">
                      You have full access to all features
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input defaultValue="ABC Cafe Technologies" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ID
                  </label>
                  <Input defaultValue="TAX-123456789" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Email
                  </label>
                  <Input type="email" defaultValue="billing@abccafe.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input defaultValue="+251 912 345 678" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Billing Info
                </Button>
              </div>
            </Card>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  System Configuration
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <Input defaultValue="ABC Cafe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <Input type="email" defaultValue="support@abccafe.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Currency
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="USD">USD - US Dollar</option>
                      <option value="ETB">ETB - Ethiopian Birr</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Africa/Addis_Ababa">
                        Africa/Addis_Ababa (UTC+3)
                      </option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save System Settings
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            placeholder="Enter current password"
          />
          <Input
            type="password"
            label="New Password"
            placeholder="Enter new password"
          />
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm new password"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button>Update Password</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
