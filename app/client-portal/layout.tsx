// app/client-portal/layout.tsx
'use client'

import { useAuthStore } from '@/lib/session-client'
import { ClientLoadingScreen } from '@/components/client-loading-screen'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clientUser, isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    console.log('🔐 Auth state:', { isAuthenticated, isLoading, clientUser })
    
    // Only redirect if we're sure user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login')
      router.push('/client-portal/login')
    }
  }, [isAuthenticated, isLoading, router])

  console.log('🎨 Layout rendering:', { isLoading, isAuthenticated })

  // Show loading screen
  if (isLoading) {
    console.log('⏳ Showing loading screen')
    return <ClientLoadingScreen companyName="Apex Client Portal" />
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, returning null')
    return null
  }

  console.log('✅ Authenticated, rendering children')
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}