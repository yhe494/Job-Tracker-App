import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { ApiError } from "../lib/api";
import { getApplicationStats, type ApplicationStats } from "../applications/applicationsApi";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
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
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/applications")}
              className="flex items-center gap-2"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0B4B4A] text-white">
                <span className="text-base font-semibold">{"{ }"}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">JobTracker</span>
            </button>

            <nav className="ml-6 hidden gap-4 text-sm font-medium text-slate-600 sm:flex">
              <Link
                to="/dashboard"
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100 text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100"
              >
                Applications
              </Link>
              <Link
                to="/resume-match"
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100"
              >
                Resume Match
              </Link>
            </nav>
          </div>

          <UserMenu displayName={displayName} onLogout={logout} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
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
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
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
      </div>
    </div>
  );
}

function UserMenu({
  displayName,
  onLogout,
}: {
  displayName: string;
  onLogout: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0B4B4A] text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-slate-800 sm:inline">{displayName}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg">
          <Link
            to="/settings"
            className="block px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await onLogout();
            }}
            className="block w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}