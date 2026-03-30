import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AlertMessage } from "../components/ui/AlertMessage";
import { formControlClassName } from "../components/ui/formControlClassName";
import { AuthSplitLayout } from "../components/auth/AuthSplitLayout";

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 7.5 12 12l5.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7.5 11V8.8A4.5 4.5 0 0 1 12 4.3a4.5 4.5 0 0 1 4.5 4.5V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.8 11h10.4A2.8 2.8 0 0 1 20 13.8v4.4A2.8 2.8 0 0 1 17.2 21H6.8A2.8 2.8 0 0 1 4 18.2v-4.4A2.8 2.8 0 0 1 6.8 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("test1@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthSplitLayout
      title="Welcome Back!"
      subtitle="Sign in to access your dashboard and continue tracking your applications."
      rightTitle={
        <>
          Track your job search <br />
          with clarity
        </>
      }
      quote="JobTracker keeps everything organized. I can see what I applied to, what’s next, and never miss a follow-up."
      footer="Build for your portfolio • Secure auth • Clean CRUD"
    >
      <form
        className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            await login({ email, password });
            nav("/dashboard");
          } catch (err: unknown) {
            const message =
              err instanceof Error && err.message.trim().length > 0
                ? err.message
                : "Login failed";
            setError(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MailIcon className="h-5 w-5" />
                  </span>
                  <input
                    className={`${formControlClassName} pl-11`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <LockIcon className="h-5 w-5" />
                  </span>
                  <input
                    className={`${formControlClassName} pl-11`}
                    placeholder="Enter your password"
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#0B4B4A] hover:opacity-80"
                    onClick={() => alert("Forgot password can be added later.")}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <AlertMessage>
                  {error}
                </AlertMessage>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#0B4B4A] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => nav("/register")}
              >
                Create an account
              </button>

              {/* Divider + placeholder social button (optional) */}
              <div className="flex items-center gap-4 pt-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-500">OR</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => alert("Google login can be added later.")}
              >
                Continue with Google
              </button>
      </form>
    </AuthSplitLayout>
  );
}
