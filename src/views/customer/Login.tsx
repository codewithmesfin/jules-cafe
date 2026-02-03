import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useNotification } from '../../context/NotificationContext';

const Login: React.FC = () => {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenant_id as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, jwt } = await login(email, password);

      if (user.passwordResetRequired) {
        // We need to send them to reset password, but they need a token.
        // Actually, if it's required, we can just redirect to a special 'change password' page
        // or we can use the forgot password flow.
        // The user request says "they will reset it using their email verification".
        // So I'll redirect them to a page that says "Please reset your password. We've sent a link to your email."
        // Or I can just trigger forgotPassword for them.
        router.push('/forgot-password');
        return;
      }

      // Check if user is active (except for customers)
      const inactiveStatuses = ['inactive', 'pending', 'suspended'];
      if (user.role !== 'customer' && inactiveStatuses.includes(user.status)) {
        router.push('/inactive');
        return;
      }

      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'manager') router.push('/manager');
      else if (user.role === 'cashier') router.push('/cashier');
      else if (tenantId) router.push(`/${tenantId}`);
      else router.push('/');
    } catch (error: any) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#e60023] mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-[#e60023] hover:underline">Forgot password?</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">Sign In</Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              {tenantId ? (
                <Link href={`/${tenantId}/signup`} className="text-[#e60023] font-medium hover:underline">Create an account</Link>
              ) : (
                <>
                  <Link href="/signup" className="text-[#e60023] font-medium hover:underline">register your business</Link>
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
