// components/client-loading-screen.tsx
'use client';

import { Sparkles, Shield, TrendingUp, BarChart3 } from 'lucide-react';

interface ClientLoadingScreenProps {
  companyName?: string;
  message?: string;
  showSecurityBadge?: boolean;
}

export function ClientLoadingScreen({ 
  companyName = "Your Company",
  message = "Loading your analytics dashboard",
  showSecurityBadge = true
}: ClientLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-ping">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        {/* Company Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {companyName} Portal
          </h2>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>

        {/* Security Badge */}
        {showSecurityBadge && (
          <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-white rounded-lg border border-gray-200 shadow-sm max-w-xs mx-auto">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700 font-medium">Secure Client Portal</span>
          </div>
        )}

        {/* Loading Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Initializing</span>
            <span>Authenticating</span>
            <span>Loading Data</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Growth Analytics</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Live Insights</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Secure Data</div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>This may take a few moments...</p>
          <p className="mt-1">Your data is being securely loaded</p>
        </div>
      </div>
    </div>
  );
}

// Alternative compact version for inline loading
export function CompactClientLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-6">
      <div className="relative">
        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <div className="text-sm text-gray-600">{message}</div>
    </div>
  );
}

// Loading screen for specific sections
export function SectionLoading({ title = "Loading Data" }: { title?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">Please wait while we load your information</p>
    </div>
  );
}

// Error loading state
export function ClientErrorScreen({ 
  title = "Unable to Load", 
  message = "There was an error loading your dashboard",
  onRetry 
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg border border-red-200 p-8">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">!</span>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>If this continues, please contact support</p>
        </div>
      </div>
    </div>
  );
}

export default ClientLoadingScreen;