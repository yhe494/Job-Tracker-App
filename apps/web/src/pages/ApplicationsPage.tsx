import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ApiError } from "../lib/api";
import {
  type Application,
  type ApplicationStatus,
  type UpdateApplicationInput,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "../applications/applicationsApi";
import { useAuth } from "../auth/useAuth";
import { Link, useNavigate } from "react-router-dom";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function statusBadge(status: ApplicationStatus) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset";
  switch (status) {
    case "applied":
      return `${base} bg-slate-50 text-slate-700 ring-slate-200`;
    case "interviewing":
      return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
    case "offer":
      return `${base} bg-emerald-50 text-emerald-800 ring-emerald-200`;
    case "rejected":
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    default:
      return `${base} bg-slate-50 text-slate-700 ring-slate-200`;
  }
}

export function ApplicationsPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const displayName = user?.name || user?.email || "there";
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  type SortOption =
    | "updatedAt:desc"
    | "updatedAt:asc"
    | "appliedDate:desc"
    | "appliedDate:asc"
    | "company:asc"
    | "company:desc";
  const [sort, setSort] = useState<SortOption>("updatedAt:desc");

  // create form
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("");
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("applied");
  const [creating, setCreating] = useState(false);

  // edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("applied");

  const query = useMemo(
    () => ({
      q: q.trim() || undefined,
      status: status || undefined,
      sort,
      page,
      limit: 10,
    }),
    [q, status, sort, page]
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listApplications(query);
      setItems(res.items);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load applications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.q, query.status, query.sort, query.page]);

  async function onCreate() {
    setError(null);

    if (!company.trim() || !roleTitle.trim()) {
      setError("Company and Role Title are required.");
      return;
    }

    setCreating(true);
    try {
      const created = await createApplication({
        company: company.trim(),
        roleTitle: roleTitle.trim(),
        location: location.trim() || undefined,
        status: newStatus,
      });

      // optimistic: add on top
      setItems((prev) => [created, ...prev]);

      // reset form
      setCompany("");
      setRoleTitle("");
      setLocation("");
      setNewStatus("applied");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to create application";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await deleteApplication(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to delete application";
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(app: Application) {
    setEditingId(app.id);
    setEditCompany(app.company);
    setEditRoleTitle(app.roleTitle);
    setEditLocation(app.location ?? "");
    setEditStatus(app.status);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function onSaveEdit(id: string) {
    setError(null);
    setSavingId(id);
    const patch: UpdateApplicationInput = {
      company: editCompany.trim() || undefined,
      roleTitle: editRoleTitle.trim() || undefined,
      location: editLocation.trim() || undefined,
      status: editStatus,
    };

    try {
      const updated = await updateApplication(id, patch);
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingId(null);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to update application";
      setError(msg);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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
                className="rounded-full px-3 py-1 hover:text-slate-900 hover:bg-slate-100 text-slate-900"
              >
                Applications
              </Link>
            </nav>
          </div>

          <UserMenu displayName={displayName} onLogout={logout} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Hello {displayName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Keep every application, interview, and offer organized in one clear view.
          </p>
        </div>
        {/* Create card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Company</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="e.g. Shopify"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Role Title</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="e.g. Backend Developer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                placeholder="e.g. Toronto / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="md:w-56">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onCreate}
              disabled={creating}
              className="rounded-xl bg-[#0B4B4A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Add"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
              placeholder="Search company or role..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="w-44 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
              value={status}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setStatus(e.target.value as ApplicationStatus | "")
              }
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <select
            className="sm:w-60 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
            value={sort}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSort(e.target.value as SortOption)
            }
          >
            <option value="updatedAt:desc">Recently updated</option>
            <option value="updatedAt:asc">Least recently updated</option>
            <option value="appliedDate:desc">Applied date (newest)</option>
            <option value="appliedDate:asc">Applied date (oldest)</option>
            <option value="company:asc">Company (A–Z)</option>
            <option value="company:desc">Company (Z–A)</option>
          </select>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Your applications</div>
              <div className="text-sm text-slate-600">
                {loading ? "Loading..." : `${items.length} shown • ${total} total`}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-slate-600">Loading applications…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">
              No applications yet. Add your first one above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((app) => (
                <div key={app.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {editingId === app.id ? (
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-700">Company</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                              value={editCompany}
                              onChange={(e) => setEditCompany(e.target.value)}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-700">Role</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                              value={editRoleTitle}
                              onChange={(e) => setEditRoleTitle(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-slate-700">Location</label>
                            <input
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                            />
                          </div>
                          <div className="sm:w-44">
                            <label className="text-xs font-medium text-slate-700">Status</label>
                            <select
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Updated {formatDate(app.updatedAt)}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {app.company}
                          </div>
                          <span className={statusBadge(app.status)}>{app.status}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">{app.roleTitle}</span>
                          {app.location ? <span className="text-slate-400"> • </span> : null}
                          {app.location ? <span>{app.location}</span> : null}
                          <span className="text-slate-400"> • </span>
                          <span>Updated {formatDate(app.updatedAt)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {editingId === app.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSaveEdit(app.id)}
                          disabled={savingId === app.id}
                          className="rounded-xl bg-[#0B4B4A] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {savingId === app.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(app)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(app.id)}
                      disabled={busyId === app.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {busyId === app.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                type="button"
                disabled={page === 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page === totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Next
              </button>
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