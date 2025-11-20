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
  Users,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
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

interface ApprovedClient {
  id: string;
  company_name: string;
  contact_email: string;
  full_name: string;
  tempPassword: string;
  isNewUser: boolean;
  approvedAt: string;
}

// 🔹 Password Modal Component
function TempPasswordModal({
  approvedClients,
  onClose,
}: {
  approvedClients: ApprovedClient[];
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPassword = (password: string, id: string) => {
    navigator.clipboard.writeText(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllCredentials = () => {
    const credentials = approvedClients
      .filter(c => c.isNewUser)
      .map(c => `${c.company_name}\nEmail: ${c.contact_email}\nPassword: ${c.tempPassword}\n`)
      .join('\n---\n\n');
    
    navigator.clipboard.writeText(credentials);
    setCopiedId('all');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const newUserClients = approvedClients.filter(c => c.isNewUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 border-2 border-purple-400/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7" />
                Approved Clients & Credentials
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {newUserClients.length} new account{newUserClients.length !== 1 ? 's' : ''} created
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
            >
              <XCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {newUserClients.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No new accounts created in this session</p>
              <p className="text-white/50 text-sm mt-2">
                Existing users were linked to their accounts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Copy All Button */}
              <div className="flex justify-end">
                <button
                  onClick={copyAllCredentials}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-xl text-sm font-medium text-purple-200 flex items-center gap-2 transition-all hover:scale-105"
                >
                  {copiedId === 'all' ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied All!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy All Credentials
                    </>
                  )}
                </button>
              </div>

              {/* Client Cards */}
              {newUserClients.map((client, index) => (
                <div
                  key={client.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Client Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">
                        {client.company_name}
                      </h3>
                      <p className="text-sm text-purple-200">{client.full_name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                        <Mail className="w-3.5 h-3.5" />
                        {client.contact_email}
                      </div>
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(client.approvedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="bg-amber-500/20 border-2 border-amber-400/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="font-bold text-xs uppercase tracking-wide">
                        Temporary Password
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/70 backdrop-blur-xl px-4 py-3 rounded-lg border border-amber-300/30">
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-lg text-amber-100 font-bold break-all select-all flex-1">
                          {client.tempPassword}
                        </code>
                        <button
                          onClick={() => copyPassword(client.tempPassword, client.id)}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 rounded-lg transition-all flex items-center gap-2 text-xs font-medium text-amber-200 flex-shrink-0"
                        >
                          {copiedId === client.id ? (
                            <>
                              <Check className="w-4 h-4 text-green-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-600/20 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-100">
                      <p className="font-semibold mb-1">📧 Send to client:</p>
                      <p className="text-amber-200/90">
                        Email: {client.contact_email}<br />
                        Password: {client.tempPassword}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Existing Users Section */}
          {approvedClients.filter(c => !c.isNewUser).length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Existing Users Linked ({approvedClients.filter(c => !c.isNewUser).length})
              </h3>
              <div className="space-y-2">
                {approvedClients.filter(c => !c.isNewUser).map(client => (
                  <div
                    key={client.id}
                    className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 flex items-center gap-3"
                  >
                    <Building2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{client.company_name}</p>
                      <p className="text-blue-200 text-xs">{client.contact_email}</p>
                    </div>
                    <div className="text-xs text-blue-300 bg-blue-500/20 px-3 py-1 rounded-lg">
                      Existing Account
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">
              ⚠️ Passwords are shown only once. Save them securely.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔹 Approve button component
function ApproveClientButton({
  registrationId,
  onApproved,
  onPasswordGenerated,
}: {
  registrationId: string;
  onApproved: (updated: RegistrationRequest) => void;
  onPasswordGenerated?: (client: ApprovedClient) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    setShowSuccess(false);

    try {
      const res = await fetch('/api/admin/client-registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      const data = await res.json();

      console.log('✅ Approval response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve registration');
      }

      if (data.request) {
        onApproved(data.request as RegistrationRequest);
      }

      // Track this approval with password if available
      if (data.tempPassword && onPasswordGenerated) {
        onPasswordGenerated({
          id: data.request.id,
          company_name: data.request.company_name,
          contact_email: data.request.contact_email,
          full_name: data.request.full_name,
          tempPassword: data.tempPassword,
          isNewUser: data.isNewUser !== false,
          approvedAt: new Date().toISOString(),
        });
      }

      setShowSuccess(true);
    } catch (err: any) {
      console.error('❌ Approval error:', err);
      setError(err.message || 'Approve failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 items-end w-full sm:w-auto">
      <button
        onClick={handleApprove}
        disabled={loading || showSuccess}
        className="px-5 py-2.5 text-sm font-bold rounded-xl border-2 border-transparent text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Approving...
          </span>
        ) : showSuccess ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ✓
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approve & Create User
          </span>
        )}
      </button>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 w-full animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showSuccess && !error && (
        <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Approved! Check the credentials button above.</span>
        </div>
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
  const [mounted, setMounted] = useState(false);
  
  // New state for tracking approved clients
  const [approvedClients, setApprovedClients] = useState<ApprovedClient[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => (r.status || 'pending') === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-200 text-sm">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="max-w-md w-full backdrop-blur-xl bg-red-500/10 border border-red-500/40 text-red-100 rounded-2xl p-8 animate-shake">
          <div className="flex gap-4">
            <ShieldAlert className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-xl mb-2">Authorization Required</h2>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-xl text-sm font-medium transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 px-4 py-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent flex items-center gap-2">
                    Registration Requests
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </h1>
                  <p className="text-sm text-purple-200 mt-1">
                    Review and manage client access requests
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-5 py-3 backdrop-blur-xl bg-white/5 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all hover:scale-105 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Pending', count: counts.pending, color: 'amber', icon: Clock },
                { label: 'Approved', count: counts.approved, color: 'emerald', icon: CheckCircle2 },
                { label: 'Rejected', count: counts.rejected, color: 'rose', icon: XCircle },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    <span className={`text-2xl font-bold text-${stat.color}-300`}>{stat.count}</span>
                  </div>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* View Credentials Button */}
            {approvedClients.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/50 animate-pulse"
                >
                  <AlertCircle className="w-5 h-5" />
                  View Approved Credentials ({approvedClients.filter(c => c.isNewUser).length})
                </button>
              </div>
            )}
          </header>

          {/* Requests List */}
          {requests.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No registration requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req, index) => {
                const status = (req.status || 'pending') as RegistrationStatus;
                const isPending = status === 'pending';

                return (
                  <div
                    key={req.id}
                    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-500 group animate-slide-in`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Building2 className="w-7 h-7 text-purple-300" />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white">
                            {req.company_name}
                          </div>
                          <div className="text-sm text-purple-200">
                            by {req.full_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/60 backdrop-blur-xl bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                        <Clock className="w-4 h-4" />
                        {req.requested_at
                          ? new Date(req.requested_at).toLocaleString()
                          : '—'}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-white/80 backdrop-blur-xl bg-white/5 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                          <Mail className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <a
                            href={`mailto:${req.contact_email}`}
                            className="hover:text-purple-200 transition-colors truncate"
                          >
                            {req.contact_email}
                          </a>
                        </div>
                        {req.phone && (
                          <div className="flex items-center gap-3 text-sm text-white/80 backdrop-blur-xl bg-white/5 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <Phone className="w-4 h-4 text-blue-300 flex-shrink-0" />
                            <a
                              href={`tel:${req.phone}`}
                              className="hover:text-blue-200 transition-colors"
                            >
                              {req.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {req.message && (
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                          <p className="text-sm text-white/70 italic">
                            "{req.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {status === 'approved' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-300">Approved</span>
                          </div>
                        )}
                        {status === 'rejected' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-400/40 rounded-xl">
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-sm font-medium text-rose-300">Rejected</span>
                          </div>
                        )}
                        {isPending && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/40 rounded-xl animate-pulse">
                            <Clock className="w-4 h-4 text-amber-300" />
                            <span className="text-sm font-medium text-amber-200">Pending Review</span>
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={actionLoadingId === req.id}
                            className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-rose-500/60 text-rose-100 bg-rose-500/10 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100"
                          >
                            {actionLoadingId === req.id ? 'Processing...' : 'Reject'}
                          </button>
                          
                          <ApproveClientButton
                            registrationId={req.id}
                            onApproved={updated =>
                              setRequests(prev =>
                                prev.map(r => (r.id === updated.id ? updated : r))
                              )
                            }
                            onPasswordGenerated={client => {
                              setApprovedClients(prev => [...prev, client]);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <TempPasswordModal
          approvedClients={approvedClients}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.5s; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}