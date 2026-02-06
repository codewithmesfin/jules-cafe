"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Building2, MapPin, Calendar, Trash2 } from 'lucide-react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import type { Business } from '@/types';

export default function BusinessesPage() {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await api.business.getMyBusinesses();
      setBusinesses(response.data || []);
    } catch (error: any) {
      showNotification(error.message || 'Failed to load businesses', 'error');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name || '',
        legal_name: (business as any).legal_name || '',
        address: business.address || '',
        description: (business as any).description || ''
      });
    } else {
      setEditingBusiness(null);
      setFormData({ name: '', legal_name: '', address: '', description: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBusiness) {
        await api.business.update(editingBusiness.id, formData);
        showNotification('Business updated successfully');
      } else {
        await api.business.create(formData);
        showNotification('Business created successfully');
      }
      setShowModal(false);
      fetchBusinesses();
      refreshUser();
    } catch (error: any) {
      showNotification(error.message || 'Failed to save business', 'error');
    }
  };

  const handleSwitchBusiness = async (businessId: string) => {
    try {
      await api.business.switch(businessId);
      await refreshUser();
      showNotification('Switched business successfully');
    } catch (error: any) {
      showNotification(error.message || 'Failed to switch business', 'error');
    }
  };

  const getBusinessId = (business: any) => business._id || business.id;

  const isOwner = (business: any) => {
    return business.owner_id === user?.id || (user as any)?.businesses?.some((b: any) => getBusinessId(b) === getBusinessId(business));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Businesses</h1>
          <p className="text-slate-500 text-sm">Manage your businesses</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={16} className="mr-2" /> Add Business
        </Button>
      </div>

      {/* Business List */}
      {businesses.length === 0 ? (
        <Card padding="comfortable" className="text-center py-12">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No businesses yet</h3>
          <p className="text-slate-500 mb-6">Create your first business to get started</p>
          <Link href="/dashboard/settings/businesses/new">
            <Button>
              <Plus size={16} className="mr-2" /> Add Business
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business: any) => (
            <Card key={business._id || business.id} padding="comfortable" className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{business.name}</h3>
                    {(business as any).owner_id === user?.id && (
                      <Badge variant="primary" className="text-xs">Owner</Badge>
                    )}
                  </div>
                </div>
                {business.is_active === false && (
                  <Badge variant="error">Inactive</Badge>
                )}
              </div>

              {(business as any).legal_name && (
                <p className="text-sm text-slate-600 mb-2">{(business as any).legal_name}</p>
              )}

              {business.address && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <MapPin size={14} />
                  <span>{business.address}</span>
                </div>
              )}

              {(business as any).created_at && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Calendar size={14} />
                  <span>Created: {new Date((business as any).created_at).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchBusiness(getBusinessId(business))}
                  disabled={(user as any)?.default_business_id === getBusinessId(business)}
                  className="flex-1"
                >
                  {(user as any)?.default_business_id === getBusinessId(business) ? 'Active' : 'Switch'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenModal(business)}
                  disabled={business.is_active === false}
                >
                  <Edit size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">
                {editingBusiness ? 'Edit Business' : 'Add New Business'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Business Name"
                placeholder="Your business name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input
                label="Legal Name"
                placeholder="Legal business name"
                value={formData.legal_name}
                onChange={e => setFormData({...formData, legal_name: e.target.value})}
              />
              <Input
                label="Address"
                placeholder="Business address"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us about your business..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingBusiness ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
