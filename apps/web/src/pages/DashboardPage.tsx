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

      <PageContainer className="space-y-8">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(11,75,74,0.08),rgba(15,23,42,0.02))] px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B4B4A]">
                  Search overview
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  Welcome back, {displayName}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                  Keep a clear view of your pipeline, then jump into the tracker when it is time
                  to update statuses, follow up, or add new roles.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/applications"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0B4B4A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C]"
                >
                  Open tracker
                </Link>
                <Link
                  to="/resume-match"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Resume match
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <AlertMessage className="mx-6 mt-6 sm:mx-8">
              {error}
            </AlertMessage>
          )}

          <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm">
                  <div className="text-slate-600">Total applications</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">
                    {loading ? "--" : stats?.total ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                  <div className="text-slate-600">Applied</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {loading ? "--" : stats?.applied ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                  <div className="text-slate-600">Interviewing</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {loading ? "--" : stats?.interviewing ?? 0}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                  <div className="text-slate-600">Offer</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {loading ? "--" : stats?.offer ?? 0}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Pipeline focus</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      The healthiest trackers keep momentum high and the next step obvious.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Link
                    to="/applications"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="text-sm font-semibold text-slate-900">Update statuses</div>
                    <p className="mt-1 text-sm text-slate-600">
                      Keep your tracker current so the latest roles stay visible.
                    </p>
                  </Link>
                  <Link
                    to="/resume-match"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="text-sm font-semibold text-slate-900">Tailor your resume</div>
                    <p className="mt-1 text-sm text-slate-600">
                      Compare your resume against a role before you apply.
                    </p>
                  </Link>
                  <Link
                    to="/settings"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="text-sm font-semibold text-slate-900">Profile settings</div>
                    <p className="mt-1 text-sm text-slate-600">
                      Review your account details and update your display name.
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Quick read
              </p>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">What good trackers surface</h2>
              <div className="mt-5 space-y-4">
                <div className="border-l-2 border-[#0B4B4A] pl-4">
                  <div className="text-sm font-medium text-slate-900">A clear top summary</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Start with totals and active stages instead of many equal-weight panels.
                  </p>
                </div>
                <div className="border-l-2 border-slate-300 pl-4">
                  <div className="text-sm font-medium text-slate-900">One main workspace</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Treat the applications view like the center of the product, not another card page.
                  </p>
                </div>
                <div className="border-l-2 border-slate-300 pl-4">
                  <div className="text-sm font-medium text-slate-900">Lighter visual grouping</div>
                  <p className="mt-1 text-sm text-slate-600">
                    Use spacing, dividers, and subtle surfaces before adding more boxes.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
