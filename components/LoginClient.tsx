// components/LoginClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';
import {
  Building2, User, Shield, Mail, Lock, ArrowRight,
  Plus, Eye, EyeOff, Sparkles, Crown, Zap, Target, Rocket, Star
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
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, delay: number}>>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const next = searchParams.get('next');
    if (next) setNextPath(next);

    // Generate floating particles
    const newParticles = Array.from({ length: 15 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  delay: Math.random() * 5
}));
    setParticles(newParticles);
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
      const redirectTo = (nextPath && nextPath.startsWith('/admin') && isAdmin)
        ? nextPath
        : isAdmin
          ? '/admin/registrations'
          : '/client-portal/dashboard';

      router.replace(redirectTo);
    } catch (err: unknown) {
  setError(err instanceof Error ? err.message : 'Login failed');
}
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 animate-float-slow">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-sm" />
      </div>
      <div className="absolute bottom-1/3 right-12 animate-float-slower">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm" />
      </div>
      <div className="absolute top-1/2 right-1/4 animate-pulse">
        <Sparkles className="w-6 h-6 text-cyan-400/40" />
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Main Card */}
        <div className="backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
          
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-gradient-x" />
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                <Shield className="w-10 h-10 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-2">
                Elite Portal
              </h2>
              <p className="text-blue-200/80 text-sm flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Secure Enterprise Authentication
                <Crown className="w-4 h-4 text-yellow-400" />
              </p>
            </div>

            {/* Portal Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setLoginType('client')} 
                className={`p-4 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                  loginType === 'client' 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 shadow-lg shadow-blue-500/20' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity ${loginType === 'client' && 'opacity-10'}`} />
                <Building2 className={`w-8 h-8 mx-auto mb-2 transition-colors ${loginType === 'client' ? 'text-cyan-300' : 'text-blue-300'}`} />
                <div className={`font-semibold transition-colors ${loginType === 'client' ? 'text-cyan-100' : 'text-white'}`}>Client Portal</div>
                <div className="text-xs text-blue-200/60 mt-1">Business Access</div>
              </button>
              
              <button 
                onClick={() => setLoginType('admin')} 
                className={`p-4 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                  loginType === 'admin' 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-lg shadow-purple-500/20' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity ${loginType === 'admin' && 'opacity-10'}`} />
                <User className={`w-8 h-8 mx-auto mb-2 transition-colors ${loginType === 'admin' ? 'text-pink-300' : 'text-purple-300'}`} />
                <div className={`font-semibold transition-colors ${loginType === 'admin' ? 'text-pink-100' : 'text-white'}`}>Admin Portal</div>
                <div className="text-xs text-purple-200/60 mt-1">System Control</div>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-400/50 text-red-200 p-4 rounded-xl text-sm backdrop-blur-lg animate-shake">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    {error}
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-focus-within:blur-md transition-all duration-300" />
                <input
                  type="text"
                  placeholder={loginType === 'admin' ? 'Admin Email or Username' : 'Company Email Address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 backdrop-blur-lg relative z-10 transition-all duration-300 focus:bg-white/10 focus:border-blue-400/50"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-focus-within:blur-md transition-all duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Secure Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 backdrop-blur-lg relative z-10 transition-all duration-300 focus:bg-white/10 focus:border-blue-400/50"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
                >
                  {showPassword ? 
                    <EyeOff className="w-5 h-5 text-white/60" /> : 
                    <Eye className="w-5 h-5 text-white/60" />
                  }
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/30 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Access {loginType === 'client' ? 'Client' : 'Admin'} Portal
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Additional Actions */}
            <div className="mt-8 space-y-3">
              <button 
                onClick={() => router.push('/register/client')} 
                className="w-full py-3 rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Create Elite Client Account
                </span>
              </button>
              
              <button className="w-full py-3 rounded-xl border border-purple-400/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-all duration-300 group">
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  Request Admin Privileges
                  <Star className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            </div>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                <Shield className="w-3 h-3" />
                Enterprise-Grade Security • SSL Encrypted • 24/7 Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(-40px, 30px) scale(1.2); }
          50% { transform: translate(20px, -20px) scale(0.8); }
          75% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes gradient-x {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}