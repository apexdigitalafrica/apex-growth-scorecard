// app/register/client/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, User, Mail, Phone, ArrowLeft, CheckCircle, Sparkles, MessageSquare, Shield, ArrowRight } from 'lucide-react'

export default function ClientRegistration() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    full_name: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register-client-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      alert('Registration failed. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          <div className="absolute top-0 -left-4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Success Card */}
        <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent mb-4">
              Request Received!
            </h2>
            <p className="text-green-100 mb-6 leading-relaxed">
              Thank you for your interest in <span className="font-bold text-white">Apex Growth Portal</span>. Our team will review your request and contact you within <span className="font-bold text-white">24 hours</span> to set up your account.
            </p>
            
            {/* Info Cards */}
            <div className="space-y-3 mb-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Mail className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">Check Your Email</div>
                    <div className="text-xs text-green-200">Confirmation sent to {formData.contact_email}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">What's Next?</div>
                    <div className="text-xs text-green-200">Our team will verify and activate your account</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/50 hover:shadow-emerald-500/50 hover:scale-105 flex items-center justify-center gap-2"
            >
              Return to Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes scale-in {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0); opacity: 1; }
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
          .animate-scale-in {
            animation: scale-in 0.6s ease-out;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Form Card */}
      <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden group hover:shadow-blue-500/20 transition-all duration-500">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-6 transition-colors group/back"
              >
                <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                Back to Login
              </button>
              
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/50 animate-float">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Client Registration
              </h2>
              <p className="mt-2 text-sm text-purple-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Request access to Apex Growth Portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div className="group/input">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-300 group-focus-within/input:text-blue-400 transition-colors" />
                    Company Name
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your company name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="group/input">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-300 group-focus-within/input:text-blue-400 transition-colors" />
                    Work Email
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your work email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Full Name */}
              <div className="group/input">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-300 group-focus-within/input:text-blue-400 transition-colors" />
                    Full Name
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Phone */}
              <div className="group/input">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-300 group-focus-within/input:text-blue-400 transition-colors" />
                    Phone Number <span className="text-white/40 text-xs">(Optional)</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className="w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div className="group/input">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-300 group-focus-within/input:text-blue-400 transition-colors" />
                    Additional Information <span className="text-white/40 text-xs">(Optional)</span>
                  </div>
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 pl-11 border-2 border-white/20 bg-white/5 backdrop-blur-xl placeholder-white/40 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/10 resize-none"
                    placeholder="Tell us about your business and how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/50 hover:shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Request Access
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <div className="text-sm text-white/70 backdrop-blur-xl bg-white/5 rounded-xl py-3 px-4 border border-white/10">
            Questions? Contact{' '}
            <a 
              href="mailto:support@apexdigitalafrica.com" 
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
            >
              support@apexdigitalafrica.com
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
      `}</style>
    </div>
  )
}
