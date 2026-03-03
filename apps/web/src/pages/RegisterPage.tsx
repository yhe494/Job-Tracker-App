import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

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
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-md">
            {/* Brand */}
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B4B4A] text-white">
                <span className="text-lg font-semibold">{"{ }"}</span>
              </div>
              <div className="text-xl font-semibold text-slate-900">JobTrackr</div>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign up to start tracking your job applications in one place.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setSubmitting(true);
                try {
                  await register({ email, password, name: name || undefined });
                  nav("/dashboard");
                } catch (err: any) {
                  setError(err?.message ?? "Registration failed");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
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
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                    placeholder="Create a password"
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
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
          </div>
        </div>

        {/* RIGHT (marketing panel) */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B4B4A] via-[#0A5452] to-[#0B3F43]" />
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_30%,white,transparent_50%)]" />
          <div className="relative flex h-full flex-col justify-center px-14 text-white">
            <h2 className="text-5xl font-semibold leading-tight tracking-tight">
              Stay ahead in your search
            </h2>

            <div className="mt-10 max-w-lg">
              <div className="text-4xl leading-none opacity-70">“</div>
              <p className="mt-3 text-lg leading-8 text-white/85">
                "Create an account and keep every application, interview, and offer in one clean view."
              </p>
            </div>

            <div className="mt-16 text-sm text-white/60">
              Built for your portfolio with Secure auth and Clean CRUD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
