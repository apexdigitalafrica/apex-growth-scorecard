// app/login/page.tsx
import LoginClient from '@/components/LoginClient';

// This stops Next.js from trying to prerender the login page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return <LoginClient />;
}