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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100 ${
                  activeTab === item.key ? "text-slate-900" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <UserMenu displayName={displayName} onLogout={onLogout} />
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
