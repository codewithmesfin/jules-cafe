"use client";

import React, { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Phone, Mail, Globe, Clock, FileText } from 'lucide-react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

export default function BusinessSettingsPage() {
  const { currentBusiness, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', legal_name: '', address: '', phone: '', email: '', website: '', 
    opening_hours: { open: '', close: '' }, tax_rate: 0, currency: 'ETB',
    description: '', logo: '', banner: ''
  });

  useEffect(() => {
    if (currentBusiness) {
      setFormData({
        name: currentBusiness.name || '',
        legal_name: (currentBusiness as any).legal_name || '',
        address: currentBusiness.address || '',
        phone: (currentBusiness as any).phone || '',
        email: (currentBusiness as any).email || '',
        website: (currentBusiness as any).website || '',
        opening_hours: { 
          open: (currentBusiness as any).opening_hours?.open || '', 
          close: (currentBusiness as any).opening_hours?.close || '' 
        },
        tax_rate: (currentBusiness as any).tax_rate || 0,
        currency: (currentBusiness as any).currency || 'ETB',
        description: (currentBusiness as any).description || '',
        logo: (currentBusiness as any).logo || '',
        banner: (currentBusiness as any).banner || ''
      });
    }
    setLoading(false);
  }, [currentBusiness]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.business.update((currentBusiness as any)?._id || (currentBusiness as any)?.id, formData);
      await refreshUser();
      showNotification('Settings saved successfully');
    } catch (error: any) {
      showNotification(error.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-48" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Business Settings</h1>
          <p className="text-slate-500 text-sm">Manage your business profile and settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Card title="Basic Information" className="lg:col-span-2" padding="comfortable">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              placeholder="Your business name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
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
