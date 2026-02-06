"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, MapPin, Phone, Mail, Globe, Clock, ArrowLeft } from 'lucide-react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useNotification } from '@/context/NotificationContext';

export default function AddBusinessPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: { open: '', close: '' },
    tax_rate: 0,
    currency: 'ETB',
    description: '',
    logo: '',
    banner: ''
  });

  const handleSave = async () => {
    if (!formData.name) {
      showNotification('Business name is required', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.business.create(formData);
      showNotification('Business created successfully');
      router.push('/dashboard/settings/businesses');
    } catch (error: any) {
      showNotification(error.message || 'Failed to create business', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/settings/businesses')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Add New Business</h1>
            <p className="text-slate-500 text-sm">Create a new business for your account</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" /> {saving ? 'Creating...' : 'Create Business'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card title="Basic Information" className="lg:col-span-2" padding="comfortable">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
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
              label="Phone"
              placeholder="+251..."
              leftIcon={<Phone size={16} />}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            <Input
              label="Email"
              placeholder="contact@business.com"
              leftIcon={<Mail size={16} />}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Website"
              placeholder="https://..."
              leftIcon={<Globe size={16} />}
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
            />
            <Input
              label="Currency"
              placeholder="ETB"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Tell us about your business..."
            />
          </div>
        </Card>

        {/* Location & Hours */}
        <div className="space-y-6">
          <Card title="Location" padding="comfortable">
            <div className="space-y-4">
              <Input
                label="Address"
                placeholder="Full address"
                leftIcon={<MapPin size={16} />}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </Card>

          <Card title="Operating Hours" padding="comfortable">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={14} />
                <span>Opening & Closing Times</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Open"
                  type="time"
                  value={formData.opening_hours.open}
                  onChange={e => setFormData({...formData, opening_hours: {...formData.opening_hours, open: e.target.value}})}
                />
                <Input
                  label="Close"
                  type="time"
                  value={formData.opening_hours.close}
                  onChange={e => setFormData({...formData, opening_hours: {...formData.opening_hours, close: e.target.value}})}
                />
              </div>
            </div>
          </Card>

          <Card title="Tax & Billing" padding="comfortable">
            <div className="space-y-4">
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                value={formData.tax_rate || ''}
                onChange={e => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
              />
            </div>
          </Card>
        </div>

        {/* Branding */}
        <Card title="Branding" className="lg:col-span-3" padding="comfortable">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Upload size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Logo URL"
                    value={formData.logo}
                    onChange={e => setFormData({...formData, logo: e.target.value})}
                  />
                  <p className="text-xs text-slate-400 mt-1">Paste image URL or upload from settings</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Banner</label>
              <div className="h-20 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
                {formData.banner ? (
                  <img src={formData.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 text-sm">No banner set</div>
                )}
              </div>
              <Input
                placeholder="Banner URL"
                value={formData.banner}
                onChange={e => setFormData({...formData, banner: e.target.value})}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
