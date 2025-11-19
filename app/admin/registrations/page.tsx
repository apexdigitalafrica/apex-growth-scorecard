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
  Users,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
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
  const [filteredRequests, setFilteredRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | RegistrationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load requests + basic admin guard
  useEffect(() => {
    const init = async () => {
      if (!user) {
        router.replace('/login?next=/admin/registrations');
        return;
      }

      const isAdmin = user.role === 'admin' || user.permissions?.includes('admin');

      if (!isAdmin) {
        setError('You do not have permission to view this page.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/registrations');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load registration requests');
        }

        setRequests(data.requests || []);
        setFilteredRequests(data.requests || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Failed to load registration requests',
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, router]);

  // Filter and search logic
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => (r.status || 'pending') === filterStatus);
    }

    // Search by company or name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.company_name.toLowerCase().includes(query) ||
          r.full_name.toLowerCase().includes(query) ||
          r.contact_email.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchQuery]);

  const handleAction = async (id: string, action: 'approve' | 'reject'): Promise<void> => {
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

      setRequests(prev =>
        prev.map(r => (r.id === id ? (data.request as RegistrationRequest) : r)),
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update request status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => (r.status || 'pending') === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const counts = getStatusCounts();

  /* ---------- RENDER ---------- */

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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnptMCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className={`relative z-10 px-4 py-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total', count: counts.all, color: 'blue', icon: Users },
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
          </header>

          {/* Filters and Search */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by company, name, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                {searchQuery || filterStatus !== 'all'
                  ? 'No requests match your filters'
                  : 'No registration requests found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req, index) => {
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
                        {status === 'pending' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-400/40 rounded-xl animate-pulse">
                            <Clock className="w-4 h-4 text-amber-300" />
                            <span className="text-sm font-medium text-amber-200">Pending Review</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={!isPending || actionLoadingId === req.id}
                          onClick={() => handleAction(req.id, 'reject')}
                          className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-rose-500/60 text-rose-100 bg-rose-500/10 hover:bg-rose-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100"
                        >
                          {actionLoadingId === req.id ? 'Updating...' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          disabled={!isPending || actionLoadingId === req.id}
                          onClick={() => handleAction(req.id, 'approve')}
                          className="px-5 py-2.5 text-sm font-bold rounded-xl border-2 border-transparent text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 disabled:hover:scale-100"
                        >
                          {actionLoadingId === req.id ? 'Updating...' : 'Approve'}
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}
