"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Phone, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/utils/api';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await api.auth.signup(formData);
      await login(formData.email, formData.password);
      router.push('/company-setup');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Start Your Business</h1>
          <p className="text-slate-500 font-medium text-center px-4">Create your administrator account and launch your POS in minutes</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
               <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    name="full_name"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
               </div>
            </div>

            <div className="space-y-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
               <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    name="phone"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    placeholder="+251..."
                    value={formData.phone}
                    onChange={handleChange}
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                 </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 transition-all text-base mt-4"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Create Admin Account'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-8 leading-relaxed">
          By registering, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}
