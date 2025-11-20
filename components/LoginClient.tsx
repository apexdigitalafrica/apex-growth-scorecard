// components/LoginClient.tsx - SIMPLE WORKING VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';
import { Building2, User, Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginClient() {
  const [loginType, setLoginType] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user);
      
      // Simple redirect logic
      if (data.user.role === 'admin') {
        router.push('/admin/registrations');
      } else {
        router.push('/client-portal/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Apex Growth Portal</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setLoginType('client')}
              className={`flex-1 py-2 px-4 rounded-md border ${
                loginType === 'client' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Client</span>
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 px-4 rounded-md border ${
                loginType === 'admin' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Admin</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : `Sign in as ${loginType}`}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <button 
              onClick={() => router.push('/register/client')}
              className="w-full py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              Create Client Account
            </button>
            <button className="w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Request Admin Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}