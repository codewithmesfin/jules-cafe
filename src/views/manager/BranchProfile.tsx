"use client";
import React, { useState, useEffect } from 'react';
import { Save, MapPin, Building, Globe, Mail, Phone, Info } from 'lucide-react';
import { api } from '../../utils/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import type { Business } from '../../types';

const BranchProfile: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'saas_admin';
  const { showNotification } = useNotification();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await api.business.getMe();
      const data = response.data || response;
      setBusiness(data);
      setName(data.name || '');
      setLegalName(data.legal_name || '');
      setAddress(data.address || '');
      setDescription(data.description || '');
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    try {
      setSaving(true);
      await api.business.update((business.id || business._id)!, {
        name,
        legal_name: legalName,
        address,
        description,
      });
      showNotification('Business profile updated successfully');
    } catch (error) {
      showNotification('Failed to update business profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Settings</h1>
        <p className="text-slate-500 font-medium">Manage your brand identity and corporate information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card className="border-slate-100 rounded-[2.5rem] bg-white p-8 border shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Building size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">General Profile</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Public Information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Display Name *"
                placeholder="e.g. Blue Nile Restaurant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                className={cn("rounded-xl h-12", !isAdmin && "bg-slate-50")}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Legal Business Name"
                placeholder="e.g. Nile Hospitality Group LLC"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                disabled={!isAdmin}
                className={cn("rounded-xl h-12", !isAdmin && "bg-slate-50")}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Business Description</label>
              <textarea
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
                rows={4}
                placeholder="Briefly describe your business..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
          </div>
        </Card>

        <Card className="border-slate-100 rounded-[2.5rem] bg-white p-8 border shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Contact & Location</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">HQ Details</p>
            </div>
          </div>

          <div className="space-y-6">
            <Input
              label="Physical Address"
              placeholder="Full street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isAdmin}
              className={cn("rounded-xl h-12", !isAdmin && "bg-slate-50")}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-14 px-8 font-black text-slate-400"
            onClick={() => fetchBusiness()}
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            size="lg"
            className="gap-2 rounded-xl h-14 px-10 font-black shadow-xl shadow-blue-100"
            disabled={saving || !isAdmin}
          >
            <Save size={20} />
            {saving ? 'Synchronizing...' : 'Save Configuration'}
          </Button>
        </div>
      </form>

      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 items-start">
          <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-700 font-medium">
            Some settings are locked. Only the Store Owner or Business Admin can modify core profile data.
          </p>
        </div>
      )}
    </div>
  );
};

export default BranchProfile;
