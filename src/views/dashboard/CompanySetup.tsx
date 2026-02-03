"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Globe, Mail, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const CompanySetup: React.FC = () => {
  const { showNotification } = useNotification();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [businessData, setBusinessData] = useState({
    name: '',
    legal_name: '',
    address: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.name.trim()) {
      showNotification('Business name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.business.setup(businessData);
      showNotification('Business setup completed successfully!', 'success');
      
      // Logout and redirect to login to refresh the token with the new business context
      logout();
      window.location.href = '/login';
    } catch (error: any) {
      showNotification(error.message || 'Failed to setup business', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white mb-6 shadow-xl shadow-blue-200">
            <Zap className="fill-current" size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Setup Your Business
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Connect your store to the Lunix POS ecosystem.
          </p>
        </div>

        <Card className="p-10 border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Business Name"
                placeholder="e.g. Lunix Coffee House"
                required
                className="rounded-2xl border-slate-200 focus:ring-blue-500/20"
                value={businessData.name}
                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
              />

              <Input
                label="Legal Business Name (Optional)"
                placeholder="e.g. Lunix Enterprises LLC"
                className="rounded-2xl border-slate-200 focus:ring-blue-500/20"
                value={businessData.legal_name}
                onChange={(e) => setBusinessData({ ...businessData, legal_name: e.target.value })}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[100px]"
                  placeholder="Tell us a bit about your business..."
                  value={businessData.description}
                  onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                />
              </div>

              <Input
                label="Business Address"
                placeholder="123 Main St, City, Country"
                className="rounded-2xl border-slate-200 focus:ring-blue-500/20"
                value={businessData.address}
                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-8 py-4 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Finalizing Setup...' : (
                <span className="flex items-center justify-center gap-2">
                  Complete Setup <ArrowRight size={20} />
                </span>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <span className="text-xs font-bold uppercase tracking-widest">Powered by Lunix POS</span>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
