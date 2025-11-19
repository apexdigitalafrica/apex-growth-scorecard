'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/session-client'
import {
  Building2,
  User,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Plus,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

type LoginType = 'client' | 'admin'

function LoginInner() {
  const [loginType, setLoginType] = useState<LoginType>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuthStore()

  // For animation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Read ?next=/... for post-login redirect (e.g. from /admin/registrations)
  useEffect(() => {
    const next = searchParams.get('next')
    if (next) {
      setNextPath(next)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          loginType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Save user in unified store (Zustand)
      login(data.user)

      // Determine user role, fallback to permissions/client
      const userRole: 'admin' | 'client' =
        data.user.role ??
        (data.user.permissions?.includes('admin') ? 'admin' : 'client')

      console.log('✅ Login success:', {
        email,
        loginType,
        userRole,
        nextPath,
      })

      // Give store a tick to update, then redirect
      setTimeout(() => {
        // If coming from a protected admin page with ?next=/admin/registrations
        if (userRole === 'admin' && nextPath) {
          router.replace(nextPath)
          return
        }

        if (userRole === 'admin') {
          router.replace('/dashboard')
        } else if (userRole === 'client') {
          router.replace('/client-portal/dashboard')
        } else {
          // Safety fallback
          router.replace('/dashboard')
        }
      }, 50)
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClientSignup = () => {
    router.push('/register/client')
  }

  const handleAdminRequest = async () => {
    const userEmail = prompt('Please enter your email address:')
    if (!userEmail) return

    const fullName = prompt('Please enter your full name:')
    if (!fullName) return

    const message = prompt('Please describe why you need admin access:')

    try {
      setLoading(true)
      const response = await fetch('/api/auth/admin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_email: userEmail,
          full_name: fullName,
          message: message || 'No additional details provided',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(
          '✅ Admin access request submitted successfully! We will contact you shortly.'
        )
      } else {
        alert(
          '❌ Failed to submit request: ' +
            (data.error || 'Please try again or contact support.')
        )
      }
    } catch (error) {
      alert('❌ Failed to submit request. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        {/* Animated Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div
        className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden group hover:shadow-purple-500/20 transition-all duration-500">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50 animate-float">
                <Shield className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Apex Growth Portal
              </h2>
              <p className="mt-2 text-sm text-purple-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Secure authentication portal
              </p>
            </div>

            {/* Login Type Selector */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setLoginType('client')}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  loginType === 'client'
                    ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/50 scale-105'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      loginType === 'client'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-semibold transition-colors ${
                        loginType === 'client'
                          ? 'text-blue-200'
                          : 'text-white/70'
                      }`}
                    >
                      Client Portal
                    </div>
                    <div className="text-xs text-white/50">
                      Business access
                    </div>
                  </div>
                  {loginType === 'client' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-400 animate-scale-in" />
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  loginType === 'admin'
                    ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/50 scale-105'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      loginType === 'admin'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-semibold transition-colors ${
                        loginType === 'admin'
                          ? 'text-purple-200'
                          : 'text-white/70'
                      }`}
                    >
                      Admin Portal
                    </div>
                    <div className="text-xs text-white/50">Team access</div>
                  </div>
                  {loginType === 'admin' && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400 animate-scale-in" />
                  )}
                </div>
              </button>
            </div>

            {/* Login Form */}
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              aria-live="polite"
              aria-atomic="true"
            >
              {error && (
                <div
                  className="bg-red-500/20 border border-red-500/50 backdrop-blur-xl text-red-200 px-4 py-3 rounded-xl text-sm animate-shake"
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-purple-200 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-purple-300 group-focus-within:text-blue-400 transition-colors" />
                      {loginType === 'admin'
                        ? 'Username or Email'
                        : 'Email Address'}
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="text"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                      placeholder={
                        loginType === 'admin'
                          ? 'Enter username or email'
                          : 'Enter company email'
                      }
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-purple-200 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-300 group-focus-within:text-blue-400 transition-colors" />
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-11 pr-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border-2 border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/50 hover:shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Sign in to{' '}
                      {loginType === 'client' ? 'Client Portal' : 'Admin Portal'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Registration Links */}
              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/10">
                {/* Client Registration */}
                <button
                  type="button"
                  onClick={handleClientSignup}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-blue-400/30 bg-blue-500/10 text-blue-200 rounded-xl hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-200 group backdrop-blur-xl"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-medium">Create Client Account</span>
                </button>

                {/* Admin Access Request */}
                <button
                  type="button"
                  onClick={handleAdminRequest}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-purple-400/30 bg-purple-500/10 text-purple-200 rounded-xl hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-200 group backdrop-blur-xl"
                >
                  <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">Request Admin Access</span>
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-2">
                <p className="text-xs text-white/50">
                  {loginType === 'admin'
                    ? '🔐 Use your Apex team credentials'
                    : '🏢 Use your company email and password'}
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center">
          <div className="text-sm text-white/70 backdrop-blur-xl bg-white/5 rounded-xl py-3 px-4 border border-white/10">
            Need help?{' '}
            <a
              href="mailto:support@apexdigitalafrica.com"
              className="text-blue-300 hover:text-blue-200 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Contact support
              <HelpCircle className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 text-sm">
          Preparing secure login...
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  )
}
