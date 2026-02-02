"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Globe, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const CompanySetup: React.FC = () => {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.companies.setup(formData);
      showNotification('Company setup successfully!', 'success');

      // Refresh user data to get the active status and company_id
      // Since we don't have a getMe that returns updated data easily in AuthContext without re-login
      // or we can just tell the user to re-login, but it's better to update the context.
      // In this case, I'll just redirect to dashboard and hope the next refresh works,
      // or I can implement a refresh logic.

      // For now, let's just use window.location to force a reload of the app state
      window.location.href = '/admin';
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 mb-6 shadow-xl shadow-orange-100">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Setup Your Company</h1>
          <p className="text-gray-500 mt-3 text-lg">Tell us about your business to get started</p>
        </div>

        <Card className="p-8 border-none shadow-2xl shadow-gray-200/50 rounded-[2rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Company Name"
                  placeholder="e.g. Gourmet Kitchen"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<Building2 className="text-gray-400" size={18} />}
                />
              </div>

              <Input
                label="Business Email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail className="text-gray-400" size={18} />}
              />

              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={<Phone className="text-gray-400" size={18} />}
              />

              <div className="md:col-span-2">
                <Input
                  label="Website"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  icon={<Globe className="text-gray-400" size={18} />}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Headquarters Address"
                  placeholder="123 Business Ave, Suite 100"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  icon={<MapPin className="text-gray-400" size={18} />}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-8 py-8 text-xl font-black rounded-2xl bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-200 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? 'Setting up...' : (
                <span className="flex items-center justify-center gap-2">
                  Complete Setup <ArrowRight size={24} />
                </span>
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-gray-400 mt-8 text-sm font-medium uppercase tracking-widest">
          Step 1 of 1: Initial Configuration
        </p>
      </div>
    </div>
  );
};

export default CompanySetup;
