import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AlertMessage } from "../components/ui/AlertMessage";
import { formControlClassName } from "../components/ui/FormControls";
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

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <AuthSplitLayout
      title="Create your account"
      subtitle="Sign up to start tracking your job applications in one place."
      rightTitle="Stay ahead in your search"
      quote='"Create an account and keep every application, interview, and offer in one clean view."'
      footer="Built for your portfolio with Secure auth and Clean CRUD"
    >
      <form
        className="mt-8 space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            await register({ email, password, name: name || undefined });
            nav("/dashboard");
          } catch (err: unknown) {
            const message =
              err instanceof Error && err.message.trim().length > 0
                ? err.message
                : "Registration failed";
            setError(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  className={formControlClassName}
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

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
                    placeholder="Create a password"
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
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
                {submitting ? "Creating account..." : "Sign Up"}
              </button>

              <p className="pt-2 text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-[#0B4B4A] hover:opacity-80">
                  Sign in
                </Link>
              </p>
      </form>
    </AuthSplitLayout>
  );
}
