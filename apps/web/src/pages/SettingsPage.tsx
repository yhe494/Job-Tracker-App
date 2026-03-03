import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function SettingsPage() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayName = user?.name || user?.email || "there";

  async function onSaveProfile() {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || undefined });
      setMessage("Profile updated");
      nav("/dashboard");
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAccount() {
    if (!window.confirm("This will permanently delete your account and all applications. Continue?")) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      nav("/login", { replace: true });
    } catch {
      setError("Failed to delete account");
      setDeleting(false);
    }
  }

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
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100"
              >
                Applications
              </Link>
            </nav>
          </div>

          <UserMenu displayName={displayName} onLogout={logout} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your personal info and account.</p>
        </div>
        {/* Profile card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Profile</h2>
          <p className="mt-1 text-sm text-slate-600">Update your display name used in greetings.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {message && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={onSaveProfile}
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#0B4B4A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-600">Danger zone</h2>
          <p className="mt-1 text-sm text-rose-700">
            Deleting your account will remove all of your applications and cannot be undone.
          </p>

          <button
            type="button"
            onClick={onDeleteAccount}
            disabled={deleting}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete account"}
          </button>
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
