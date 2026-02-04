"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Globe, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotification } from '@/context/NotificationContext';

export default function CompanySetup() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    address: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.business.setup(formData);
      await refreshUser();
      showNotification('Business setup complete!');
      router.push('/dashboard');
    } catch (error: any) {
      showNotification(error.message || 'Setup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-6">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Setup Your Business</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Let's configure your primary workspace to get started</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 md:p-14">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Brand Name *</label>
                <Input
                  required
                  placeholder="e.g. Blue Nile Cafe"
                  className="rounded-2xl h-14 text-lg border-slate-100 focus:ring-blue-500/10"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Entity Name</label>
                <Input
                  placeholder="e.g. Blue Nile Trading PLC"
                  className="rounded-2xl h-14 border-slate-100 focus:ring-blue-500/10"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input
                    placeholder="Street, City, Country"
                    className="w-full pl-12 pr-4 h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Brief Description</label>
                <textarea
                  className="w-full rounded-[2rem] border-none bg-slate-50 px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700 min-h-[120px]"
                  placeholder="Tell us about your business..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="w-full rounded-2xl h-16 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 transition-all text-xl gap-3 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Launch Workspace
                  <ArrowRight size={24} />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-10 text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
          You can add more businesses later in the settings
        </p>
      </div>
    </div>
  );
}
