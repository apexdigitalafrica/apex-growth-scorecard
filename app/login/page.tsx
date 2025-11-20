// app/login/page.tsx
import LoginClient from '@/components/LoginClient';

// This is the ONLY thing needed to stop Next.js from trying to prerender this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginPage() {
  return <LoginClient />;
}