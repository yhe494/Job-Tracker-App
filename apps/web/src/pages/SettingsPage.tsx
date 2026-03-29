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

      <PageContainer className="space-y-8">
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
              <FieldLabel>Email</FieldLabel>
              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
              className="mt-2"
            >
              {saving ? "Saving..." : "Save changes"}
            </PrimaryButton>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-600">Danger zone</h2>
          <p className="mt-1 text-sm text-rose-700">
            Deleting your account will remove all of your applications and cannot be undone.
          </p>

          <SecondaryButton
            type="button"
            onClick={onDeleteAccount}
            disabled={deleting}
            className="mt-4 border-rose-300 px-5 py-3 text-rose-700 hover:bg-rose-100"
          >
            {deleting ? "Deleting..." : "Delete account"}
          </SecondaryButton>
        </div>
      </PageContainer>
    </div>
  );
}
