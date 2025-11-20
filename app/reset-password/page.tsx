// app/reset-password/page.tsx
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Shield, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Create a browser Supabase client using public env vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

function ResetPasswordInner() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // On mount: validate link and set Supabase session from hash/query
  useEffect(() => {
    const prepareSession = async () => {
      try {
        let token = searchParams.get('token')
        let type = searchParams.get('type')
        let accessToken: string | null = null
        let refreshToken: string | null = null

        // Supabase usually sends everything in the hash:
        // #access_token=...&refresh_token=...&type=recovery
        if (typeof window !== 'undefined') {
          const hash = window.location.hash // "#access_token=...&type=recovery..."
          if (hash) {
            const hashParams = new URLSearchParams(hash.replace(/^#/, ''))
            // Prefer token from query, but fall back to hash
            token = token ?? hashParams.get('access_token')
            type = type ?? hashParams.get('type')
            accessToken = hashParams.get('access_token')
            refreshToken = hashParams.get('refresh_token')
          }
        }

        if (type !== 'recovery' || !token) {
          setError(
            'Invalid or expired reset link. Please request a new password reset.'
          )
          return
        }

        // If we have tokens, set the Supabase session so updateUser will work
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Failed to set Supabase session:', sessionError)
            setError(
              'Unable to start a secure reset session. Please request a new reset link.'
            )
            return
          }
        }

        setSessionReady(true)
      } catch (e) {
        console.error('Error preparing reset session:', e)
        setError(
          'Something went wrong with this reset link. Please request a new one.'
        )
      }
    }

    prepareSession()
     
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!sessionReady) {
      setError(
        'Your reset session is not ready yet. Please refresh the page or request a new reset link.'
      )
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // THIS is the real Supabase password update
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        console.error('Supabase updateUser error:', updateError)
        setError(updateError.message || 'Failed to update password')
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Password Updated!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to
            the login page shortly.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a new password for your account
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="text-center pt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center text-gray-600 text-sm">
            Preparing secure reset page...
          </div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}
