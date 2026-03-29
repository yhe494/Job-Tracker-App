import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { ApiError } from "../lib/api";
import { getApplicationStats, type ApplicationStats } from "../applications/applicationsApi";
import { AppHeader } from "../components/AppHeader";
import { PageContainer } from "../components/ui/PageContainer";
import { AlertMessage } from "../components/ui/AlertMessage";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await getApplicationStats();
        if (mounted) setStats(s);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Failed to load stats";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = user?.name || user?.email || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader activeTab="dashboard" displayName={displayName} onLogout={logout} />

      <PageContainer>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {displayName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              See how your applications are progressing at a glance.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/applications"
              className="inline-flex items-center justify-center rounded-xl bg-[#0B4B4A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C]"
            >
              View applications
            </Link>
            <Link
              to="/settings"
              className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              Settings
            </Link>
          </div>
        </div>

        {error && (
          <AlertMessage className="mb-4">
            {error}
          </AlertMessage>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="text-slate-600">Total applications</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">
              {loading ? "--" : stats?.total ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="text-slate-600">Applied</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {loading ? "--" : stats?.applied ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="text-slate-600">Interviewing</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {loading ? "--" : stats?.interviewing ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <div className="text-slate-600">Offer</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {loading ? "--" : stats?.offer ?? 0}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}