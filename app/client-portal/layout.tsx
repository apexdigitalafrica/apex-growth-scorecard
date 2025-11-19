// app/client-portal/layout.tsx
import { useClientAuth } from '@/hooks/use-client-auth';
import { ClientLoadingScreen } from '@/components/client-loading-screen';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useClientAuth(true);

  if (isLoading) {
    return <ClientLoadingScreen companyName="Apex Client Portal" />;
  }

  if (!isAuthenticated) {
    return null; // redirect happens in hook
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}