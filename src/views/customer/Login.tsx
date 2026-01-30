import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple logic: determine role based on email content
    let role: UserRole = 'customer';
    if (email.includes('admin')) role = 'admin';
    else if (email.includes('manager')) role = 'manager';
    else if (email.includes('cashier')) role = 'cashier';

    login(email, role);

    if (role === 'admin') router.push('/admin');
    else if (role === 'manager') router.push('/manager');
    else if (role === 'cashier') router.push('/cashier');
    else router.push('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-4">
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
                <button type="button" className="text-sm text-orange-600 hover:underline">Forgot password?</button>
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
              Don't have an account? <button className="text-orange-600 font-medium hover:underline">Create an account</button>
            </p>
          </div>
        </Card>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-500">
          <p className="font-bold mb-1">Demo Credentials:</p>
          <p>Customer: customer@example.com / any</p>
          <p>Admin: admin@example.com / any</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
