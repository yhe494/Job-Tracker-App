import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postResumeMatch } from "../ai/aiApi";
import type { ResumeMatchResult } from "../ai/aiApi";
import { useAuth } from "../auth/useAuth";

export default function ResumeMatchPage() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || "there";

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResumeMatchResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await postResumeMatch({
        resumeText,
        jobDescription,
      });

      setResult(response.data);
    } catch (err) {
      console.error("Error matching resume:", err);
      setError("Failed to get match result. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                to="/applications"
                className="rounded-full px-3 py-1 hover:bg-slate-100 hover:text-slate-900"
              >
                Applications
              </Link>
              <Link
                to="/resume-match"
                className="rounded-full px-3 py-1 text-slate-900 hover:bg-slate-100 hover:text-slate-900"
              >
                Resume Match
              </Link>
            </nav>
          </div>

          <UserMenu displayName={displayName} onLogout={logout} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Resume Match</h1>
          <p className="mt-1 text-sm text-slate-600">
            Compare your resume against a job description and get targeted improvement tips.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Resume</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="Paste your resume content"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="Paste the role description"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-[#0B4B4A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Match Score: {result.matchScore}%</h2>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Matched Skills
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.matchedSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Missing Skills
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.missingSkills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Suggestions
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.suggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h3>
              <p className="mt-2 text-sm text-slate-700">{result.summary}</p>
            </div>
          </div>
        )}
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