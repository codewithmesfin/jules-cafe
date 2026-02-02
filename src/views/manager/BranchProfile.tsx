"use client";
import React, { useState, useEffect } from 'react';
import { Save, MapPin } from 'lucide-react';
import { api } from '../../utils/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import type { Branch } from '../../types';

const BranchProfile: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { showNotification } = useNotification();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');

  // Company is automatically set from the logged-in user's company
  const userCompanyId = user?.company_id || '';

  useEffect(() => {
    if (user?.branch_id) {
      fetchBranch();
    }
  }, [user?.branch_id]);

  const fetchBranch = async () => {
    const branchId = user?.branch_id;
    if (!branchId) return;
    try {
      setLoading(true);
      const data = await api.branches.getOne(branchId);
      setBranch(data);
      setName(data.branch_name || '');
      setLocation(data.location_address || '');
      setCapacity(data.capacity || 0);
      setOpenTime(data.opening_time || '');
      setCloseTime(data.closing_time || '');
    } catch (error) {
      console.error('Failed to fetch branch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch) return;

    try {
      setSaving(true);
      await api.branches.update(branch.id, {
        branch_name: name,
        location_address: location,
        capacity,
        opening_time: openTime,
        closing_time: closeTime,
      });
      showNotification('Branch profile updated successfully');
    } catch (error) {
      showNotification('Failed to update branch', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.branch_id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
          <MapPin size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Branch Associated</h2>
        <p className="text-gray-500 text-center max-w-md">
          No branch is associated with this account. Please contact an administrator.
        </p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-20">Loading branch profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Branch Profile Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="General Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="md:col-span-2">
              <Input
                label="Branch Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                className={!isAdmin ? 'bg-gray-50' : ''}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Location Address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Input
              label="Total Seating Capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
            />
          </div>
        </Card>

        <Card title="Operating Hours">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <Input
              label="Opening Time"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
            />
            <Input
              label="Closing Time"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2" disabled={saving}>
            <Save size={20} />
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BranchProfile;
