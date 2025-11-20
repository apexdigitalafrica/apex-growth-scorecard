// components/LoginClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';
import {
  Building2, User, Shield, Mail, Lock, ArrowRight,
  Plus, HelpCircle, Eye, EyeOff, Sparkles, CheckCircle2
} from 'lucide-react';

export default function LoginClient() {
  const [loginType, setLoginType] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const next = searchParams.get('next');
    if (next) setNextPath(next);
  }, [searchParams]);

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

      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user);

      const isAdmin = data.user.permissions?.includes('admin') || data.user.role === 'admin';
      const redirectTo = nextPath && nextPath.startsWith('/admin') && isAdmin
        ? nextPath
        : isAdmin
          ? '/admin/registrations'
          : '/client-portal/dashboard';

      router.replace(redirectTo);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSignup = () => router.push('/register/client');
  const handleAdminRequest = () => alert('Admin request feature coming soon');

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,...')]"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-float">
              <Shield className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Apex Growth Portal
            </h2>
            <p className="mt-2 text-sm text-purple-200 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Secure authentication portal
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button onClick={() => setLoginType('client')} className={`p-4 rounded-2xl border-2 transition-all ${loginType === 'client' ? 'border-blue-400 bg-blue-500/20 shadow-lg scale-105' : 'border-white/20 bg-white/5'}`}>
              <Building2 className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Client Portal</div>
            </button>
            <button onClick={() => setLoginType('admin')} className={`p-4 rounded-2xl border-2 transition-all ${loginType === 'admin' ? 'border-purple-400 bg-purple-500/20 shadow-lg scale-105' : 'border-white/20 bg-white/5'}`}>
              <User className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Admin Portal</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">{error}</div>}

            <input
              type="text"
              placeholder={loginType === 'admin' ? 'Username or Email' : 'Email Address'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 pl-11 rounded-xl bg-white/5 border-2 border-white/20 text-white placeholder-white/40"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 pl-11 pr-11 rounded-xl bg-white/5 border-2 border-white/20 text-white"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-white/40" /> : <Eye className="w-5 h-5 text-white/40" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:scale-105 transition"
            >
              {loading ? 'Authenticating...' : `Sign in to ${loginType === 'client' ? 'Client' : 'Admin'} Portal`}
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            <button onClick={handleClientSignup} className="w-full py-2.5 rounded-xl border border-blue-400/50 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20">
              Create Client Account
            </button>
            <button onClick={handleAdminRequest} className="w-full py-2.5 rounded-xl border border-purple-400/50 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20">
              Request Admin Access
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-blob { animation: blob 7s infinite }
        .animation-delay-2000 { animation-delay: 2s }
        .animation-delay-4000 { animation-delay: 4s }
        .animate-float { animation: float 3s ease-in-out infinite }
      `}</style>
    </div>
  );
}