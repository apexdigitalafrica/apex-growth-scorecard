// app/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, BarChart3, Award, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" 
                alt="Apex Digital Africa" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-gray-900">Apex Digital Africa</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-1"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <TrendingUp className="w-4 h-4" />
              <span>Trusted by 100+ African Businesses</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Discover Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Growth Potential
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Take our 5-minute <strong>Apex Growth Scorecard™</strong> and get a comprehensive analysis 
              of your digital marketing performance with actionable insights.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { icon: '🎯', title: '5-Minute Assessment', desc: 'Quick, comprehensive evaluation' },
                { icon: '📊', title: 'Detailed Analytics', desc: '8 key dimensions analyzed' },
                { icon: '🏆', title: 'Verified Certificate', desc: 'Professional completion badge' }
              ].map((benefit, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/scorecard"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-3"
              >
                <span>Start Free Assessment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/dashboard"
                className="group bg-white text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center space-x-3"
              >
                <BarChart3 className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>What You&apos;ll Get</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {[
                  'Comprehensive score analysis',
                  'Dimension-by-dimension breakdown', 
                  'Actionable recommendations',
                  'Professional certificate',
                  'Industry benchmarking',
                  'Priority improvement areas'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" 
                alt="Apex Digital Africa" 
                className="h-6 w-auto"
              />
              <span className="text-gray-600">© 2025 Apex Digital Africa. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/scorecard" className="hover:text-gray-900">Take Assessment</Link>
              <Link href="/dashboard" className="hover:text-gray-900">Analytics</Link>
              <a href="https://apexdigitalafrica.com" className="hover:text-gray-900">Main Website</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </div>
  );
}
