"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.requiresOnboarding) {
        router.push('/company-setup');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">LunixPOS</h1>
          <p className="text-slate-500 font-medium">SaaS Restaurant Management</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Welcome back</h2>
            <p className="text-slate-500 text-sm text-center">Enter your credentials to access your workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-1">
               <div className="flex items-center justify-between mb-1 ml-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <Link href="#" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot?</Link>
               </div>
               <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 transition-all text-base mt-2"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Don't have a business account?{' '}
              <Link href="/signup" className="text-blue-600 font-bold hover:underline">
                Register Business
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} LunixPOS SaaS Systems
        </p>
      </div>
    </div>
  );
}
