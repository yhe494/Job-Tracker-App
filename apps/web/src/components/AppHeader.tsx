import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type AppHeaderTab = "dashboard" | "applications" | "resume-match";

type AppHeaderProps = {
  activeTab?: AppHeaderTab;
  displayName: string;
  onLogout: () => Promise<void>;
};

const NAV_ITEMS: { key: AppHeaderTab; label: string; to: string }[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  { key: "applications", label: "Applications", to: "/applications" },
  { key: "resume-match", label: "Resume Match", to: "/resume-match" },
];

export function AppHeader({ activeTab, displayName, onLogout }: AppHeaderProps) {
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav("/applications")}
              className="flex items-center gap-3"
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0B4B4A] text-white shadow-sm shadow-[#0B4B4A]/20">
                <span className="text-sm font-semibold">{"{ }"}</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">JobTracker</div>
                <div className="hidden text-xs text-slate-500 sm:block">Organize your search</div>
              </div>
            </button>

            <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 p-1 text-sm font-medium text-slate-600 lg:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`rounded-full px-4 py-2 transition ${
                    activeTab === item.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <UserMenu displayName={displayName} onLogout={onLogout} />
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-4 text-sm font-medium text-slate-600 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`whitespace-nowrap rounded-full border px-4 py-2 transition ${
                activeTab === item.key
                  ? "border-[#0B4B4A]/15 bg-[#0B4B4A]/10 text-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
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
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:px-3"
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
