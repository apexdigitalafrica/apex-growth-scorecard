// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/session-client'
import { Building2, User, Shield, Mail, Lock, ArrowRight, Plus, HelpCircle } from 'lucide-react'

type LoginType = 'client' | 'admin';

export default function Login() {
  const [loginType, setLoginType] = useState<LoginType>('client');
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuthStore()

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
          loginType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Login to unified store
      login(data.user)
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.replace('/dashboard')
      } else if (data.user.role === 'client') {
        router.replace('/client-portal/dashboard')
      }
      
    } catch (err) {
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
          message: message || 'No additional details provided'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('✅ Admin access request submitted successfully! We will contact you shortly.')
      } else {
        alert('❌ Failed to submit request: ' + (data.error || 'Please try again or contact support.'))
      }
    } catch (error) {
      alert('❌ Failed to submit request. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Apex Growth Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your portal to continue
          </p>
        </div>

        {/* Login Type Selector */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setLoginType('client')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              loginType === 'client'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                loginType === 'client' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  loginType === 'client' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  Client Portal
                </div>
                <div className="text-xs text-gray-500">For business clients</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              loginType === 'admin'
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                loginType === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  loginType === 'admin' ? 'text-purple-900' : 'text-gray-900'
                }`}>
                  Admin Portal
                </div>
                <div className="text-xs text-gray-500">For Apex team</div>
              </div>
            </div>
          </button>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {loginType === 'admin' ? 'Username or Email' : 'Email Address'}
                </div>
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={loginType === 'admin' ? 'Enter username or email' : 'Enter company email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Password
                </div>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in to {loginType === 'client' ? 'Client Portal' : 'Admin Portal'}...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign in to {loginType === 'client' ? 'Client Portal' : 'Admin Portal'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>

          {/* Registration Links */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
            {/* Client Registration */}
            <button
              type="button"
              onClick={handleClientSignup}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Create Client Account</span>
            </button>

            {/* Admin Access Request */}
            <button
              type="button"
              onClick={handleAdminRequest}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 group"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="font-medium">Request Admin Access</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              {loginType === 'admin' 
                ? 'Use your Apex team credentials'
                : 'Use your company email and password'
              }
            </p>
          </div>
        </form>

        {/* Support Link */}
        <div className="text-center pt-4">
          <div className="text-sm text-gray-600">
            Need help?{' '}
            <a 
              href="mailto:support@apexdigitalafrica.com" 
              className="text-blue-600 hover:text-blue-500 font-medium inline-flex items-center gap-1"
            >
              Contact support
              <HelpCircle className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}