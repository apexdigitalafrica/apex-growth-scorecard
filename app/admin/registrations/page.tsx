// app/admin/registrations/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
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

// 🔹 Approve button component – calls /api/admin/client-registrations/approve
function ApproveClientButton({
  registrationId,
  onApproved,
}: {
  registrationId: string;
  onApproved: (updated: RegistrationRequest) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    setTempPassword(null);

    try {
      const res = await fetch('/api/admin/client-registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve registration');
      }

      if (data.request) {
        onApproved(data.request as RegistrationRequest);
      }

      if (data.tempPassword) {
        setTempPassword(data.tempPassword as string);
      }
    } catch (err: any) {
      setError(err.message || 'Approve failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-emerald-500/70 text-emerald-50 bg-emerald-500/10 hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Approving…' : 'Approve & Create Portal User'}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {tempPassword && (
        <p className="text-xs text-amber-300">
          Temp password:{' '}
          <span className="font-mono">{tempPassword}</span>
        </p>
      )}
    </div>
  );
}

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAdminAccess = () => {
    if (!user) return false;
    return (
      (user as any).role === 'admin' ||
      (Array.isArray((user as any).permissions) &&
        (user as any).permissions.includes('admin'))
    );
  };

  useEffect(() => {
    const init = async () => {
      if (!user) {
        router.replace('/login?next=/admin/registrations');
        return;
      }

      if (!hasAdminAccess()) {
        setError('You do not have permission to view this page.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/registrations', {
          method: 'GET',
          headers: {
            'x-admin-id': (user as any).id,
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Unauthorized');
        }

        const data = await res.json();
        setRequests((data.requests || []) as RegistrationRequest[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load requests'
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, router]);

  // Keep PATCH /api/admin/registrations for REJECT only
  const handleAction = async (id: string, action: 'reject') => {
    if (!user) return;

    setActionLoadingId(id);
    setError(null);

    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': (user as any).id,
        },
        body: JSON.stringify({
          id,
          action,
          adminId: (user as any).id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} request`);
      }

      if (data.request) {
        setRequests(prev =>
          prev.map(r => (r.id === id ? (data.request as RegistrationRequest) : r))
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update request'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-300">Loading registration requests…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/40 text-red-100 rounded-2xl p-6 flex gap-3">
          <ShieldAlert className="w-6 h-6 mt-1 flex-shrink-0" />
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
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 flex items-center gap-3">
      Client Registration Requests
    </h1>
    <p className="text-sm text-slate-400 mt-2">
      Review and manage organizations requesting access to the Apex Growth Portal.
    </p>
  </div>

  <button
    onClick={() => router.push('/dashboard')}
    className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-600 text-slate-100 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-400 transition"
  >
    ← Back to Dashboard
  </button>
</header>


        {requests.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-12 text-center">
            <p className="text-slate-400">No pending registration requests.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map(req => {
              const status = (req.status || 'pending') as RegistrationStatus;
              const isPending = status === 'pending';

              return (
                <div
                  key={req.id}
                  className="bg-slate-900/70 border border-slate-700/70 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-emerald-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-50 text-lg">
                          {req.company_name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Requested by {req.full_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {req.requested_at
                            ? new Date(req.requested_at).toLocaleString()
                            : 'Date unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {status === 'approved' && (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-300 font-medium">
                            Approved
                          </span>
                        </>
                      )}
                      {status === 'rejected' && (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <span className="text-rose-300 font-medium">
                            Rejected
                          </span>
                        </>
                      )}
                      {isPending && (
                        <>
                          <Clock className="w-5 h-5 text-amber-400" />
                          <span className="text-amber-300 font-medium">
                            Pending
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid md:grid-cols-2 gap-5 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a
                          href={`mailto:${req.contact_email}`}
                          className="text-slate-200 hover:underline"
                        >
                          {req.contact_email}
                        </a>
                      </div>
                      {req.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <a
                            href={`tel:${req.phone}`}
                            className="text-slate-200 hover:underline"
                          >
                            {req.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {req.message && (
                      <div className="text-slate-300 text-sm bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <p className="italic">"{req.message}"</p>
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actionLoadingId === req.id}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-rose-500/60 text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {actionLoadingId === req.id
                          ? 'Processing…'
                          : 'Reject'}
                      </button>

                      <ApproveClientButton
                        registrationId={req.id}
                        onApproved={updated =>
                          setRequests(prev =>
                            prev.map(r =>
                              r.id === updated.id ? updated : r
                            )
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
