import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AppHeader } from "../components/AppHeader";
import { PageContainer } from "../components/ui/PageContainer";
import { AlertMessage } from "../components/ui/AlertMessage";
import { FieldLabel, TextInput } from "../components/ui/FormControls";
import { PrimaryButton, SecondaryButton } from "../components/ui/Buttons";

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
      <AppHeader displayName={displayName} onLogout={logout} />

      <PageContainer>
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(11,75,74,0.08),rgba(15,23,42,0.02))] px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B4B4A]">Settings</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Manage your account</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Keep profile details current and handle account changes from one clean settings page.
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
            <div className="px-6 py-6 sm:px-8">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Update the name used across your dashboard and application workspace.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Name</FieldLabel>
                    <TextInput
                      className="mt-2"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {message && (
                    <AlertMessage variant="success">
                      {message}
                    </AlertMessage>
                  )}

                  {error && (
                    <AlertMessage>
                      {error}
                    </AlertMessage>
                  )}

                  <PrimaryButton
                    type="button"
                    onClick={onSaveProfile}
                    disabled={saving}
                    className="mt-1"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </PrimaryButton>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-50/80 px-6 py-6 sm:px-8 lg:border-l lg:border-t-0">
              <h2 className="text-lg font-semibold text-slate-900">Account actions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review higher-impact actions before you continue.
              </p>

              <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-700">Danger zone</h3>
                <p className="mt-2 text-sm leading-6 text-rose-700">
                  Deleting your account removes all applications and cannot be undone.
                </p>

                <SecondaryButton
                  type="button"
                  onClick={onDeleteAccount}
                  disabled={deleting}
                  className="mt-5 border-rose-300 px-5 py-3 text-rose-700 hover:bg-rose-100"
                >
                  {deleting ? "Deleting..." : "Delete account"}
                </SecondaryButton>
              </div>
            </aside>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
