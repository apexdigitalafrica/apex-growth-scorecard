// app/admin/registrations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';
import {
  Building2,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from 'lucide-react';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';

interface RegistrationRequest {
  id: string;
  company_name: string;
  contact_email: string;
  full_name: string;
  phone: string | null;
  message: string | null;
  status: RegistrationStatus | null;
  requested_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

// TEMPORARY - remove after testing
const isAdmin = true; // Force admin access

  // Load requests + basic admin guard
 useEffect(() => {
  const init = async () => {
    // Give auth store time to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!user) {
      router.replace('/login?next=/admin/registrations');
      return;
    }

    // More flexible admin check
    const isAdmin = user?.role === 'admin' || 
                   user?.permissions?.includes('admin') ||
                   user?.isAdmin === true;

    console.log('Admin access check:', { 
      hasUser: !!user, 
      userRole: user?.role, 
      userPermissions: user?.permissions,
      isAdmin 
    });

    if (!isAdmin) {
      setError('You do not have permission to view this page.');
      setLoading(false);
      return;
    }

    // Load requests if user is admin
    try {
      const res = await fetch('/api/admin/registrations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load requests');
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  init();
}, [user, router]);

// Add to dashboard component
useEffect(() => {
  console.log('🔍 DASHBOARD USER DEBUG:', user);
}, [user]);

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject',
  ): Promise<void> => {
    if (!user) return;

    setActionLoadingId(id);
    setError(null);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          adminId: user.id, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      // Update local list
      setRequests(prev =>
        prev.map(r => (r.id === id ? (data.request as RegistrationRequest) : r)),
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to update request status',
      );
    } finally {
      setActionLoadingId(null);
    }
  };
// Add this debug code - remove after fixing
useEffect(() => {
  console.log('🔍 ADMIN PAGE DEBUG:');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('User permissions:', user?.permissions);
  console.log('User isAdmin:', user?.isAdmin);
  console.log('Full user object:', JSON.stringify(user, null, 2));
}, [user]);


  /* ---------- RENDER ---------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-200 text-sm">Loading registrations…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/40 text-red-100 rounded-2xl p-6 flex gap-3">
          <ShieldAlert className="w-6 h-6 mt-1" />
          <div>
            <h2 className="font-semibold mb-1">Authorization issue</h2>
            <p className="text-sm mb-3">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-medium underline hover:text-red-50"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-2">
              Client Registration Requests
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review and approve new organisations requesting access to the
              Apex Growth Portal.
            </p>
          </div>
        </header>

        {/* List */}
        {requests.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-8 text-center text-slate-300">
            <p>No registration requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => {
              const status = (req.status || 'pending') as RegistrationStatus;
              const isPending = status === 'pending';

              return (
                <div
                  key={req.id}
                  className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-5 sm:p-6 flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-50">
                          {req.company_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Requested by {req.full_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">
                        {req.requested_at
                          ? new Date(req.requested_at).toLocaleString()
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Contact + message */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a
                          href={`mailto:${req.contact_email}`}
                          className="hover:underline"
                        >
                          {req.contact_email}
                        </a>
                      </div>
                      {req.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <a
                            href={`tel:${req.phone}`}
                            className="hover:underline"
                          >
                            {req.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {req.message && (
                      <div className="text-xs sm:text-sm text-slate-300 bg-slate-800/60 border border-slate-700/70 rounded-xl p-3">
                        {req.message}
                      </div>
                    )}
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {status === 'approved' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Approved</span>
                        </>
                      )}
                      {status === 'rejected' && (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-300">Rejected</span>
                        </>
                      )}
                      {status === 'pending' && (
                        <>
                          <Clock className="w-4 h-4 text-amber-300" />
                          <span className="text-amber-200">Pending review</span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        type="button"
                        disabled={!isPending || actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, 'reject')}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-500/60 text-rose-100 bg-rose-500/5 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {actionLoadingId === req.id ? 'Updating…' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        disabled={!isPending || actionLoadingId === req.id}
                        onClick={() => handleAction(req.id, 'approve')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-500/70 text-emerald-50 bg-emerald-500/10 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {actionLoadingId === req.id ? 'Updating…' : 'Approve'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
