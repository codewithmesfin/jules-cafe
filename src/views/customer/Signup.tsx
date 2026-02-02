"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, User, Mail, Phone, Lock, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { api } from '../../utils/api';
import Link from 'next/link';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const Signup: React.FC = () => {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'customer';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: initialRole,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'admin') {
      setFormData(prev => ({ ...prev, role: 'admin' }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.auth.signup(formData);

      // Auto-login
      if (data.jwt && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('jwt', data.jwt);
        // Force refresh context or redirect
        showNotification('Account created successfully!', 'success');

        if (data.user.status === 'onboarding') {
          window.location.href = '/company-setup';
        } else {
          window.location.href = '/';
        }
      } else {
        showNotification('Account created successfully! Please log in.', 'success');
        router.push('/login');
      }
    } catch (error: any) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {formData.role === 'admin' ? 'Business Registration' : 'Create Account'}
          </h1>
          <p className="text-gray-500 mt-2">
            {formData.role === 'admin'
              ? 'Register your restaurant and start growing your business'
              : 'Join us and start ordering your favorites'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="555-0123"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link href="/login" className="text-orange-600 font-medium hover:underline">Sign In</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
