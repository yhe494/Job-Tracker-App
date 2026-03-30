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
import { AppHeader } from "../components/AppHeader";
import { PageContainer } from "../components/ui/PageContainer";
import { AlertMessage } from "../components/ui/AlertMessage";

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

  const stageSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      {
        applied: 0,
        interviewing: 0,
        offer: 0,
        rejected: 0,
      } satisfies Record<ApplicationStatus, number>
    );
  }, [items]);

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
      <AppHeader activeTab="applications" displayName={displayName} onLogout={logout} />

      <PageContainer className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 border-b border-slate-200 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0B4B4A]">
                Application tracker
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Keep your search organized in one workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Inspired by cleaner tracker layouts from tools like Teal and Huntr, this page
                now treats your applications list as the main product surface instead of wrapping
                every section in a separate card.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Total roles
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-slate-900">{total}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Applied
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {stageSummary.applied}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Interviewing
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {stageSummary.interviewing}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Offers
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {stageSummary.offer}
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-900">Add a new application</h2>
              <p className="mt-1 text-sm text-slate-600">
                Capture the basics fast, then manage everything from the tracker below.
              </p>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Company</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                    placeholder="e.g. Shopify"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Role title</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                    placeholder="e.g. Backend Developer"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Location</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                      placeholder="e.g. Toronto / Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
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
                </div>

                <button
                  type="button"
                  onClick={onCreate}
                  disabled={creating}
                  className="rounded-xl bg-[#0B4B4A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#083D3C] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? "Creating..." : "Add application"}
                </button>

                {error && (
                  <AlertMessage>
                    {error}
                  </AlertMessage>
                )}
              </div>
            </aside>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your applications</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Search, sort, and update everything from a single view.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_220px] xl:min-w-[760px]">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                  placeholder="Search company or role..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
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
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
                  value={sort}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSort(e.target.value as SortOption)
                  }
                >
                  <option value="updatedAt:desc">Recently updated</option>
                  <option value="updatedAt:asc">Least recently updated</option>
                  <option value="appliedDate:desc">Applied date (newest)</option>
                  <option value="appliedDate:asc">Applied date (oldest)</option>
                  <option value="company:asc">Company (A-Z)</option>
                  <option value="company:desc">Company (Z-A)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[minmax(0,2fr)_140px_170px] border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <div>Role</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {loading ? (
                <div className="p-6 text-sm text-slate-600">Loading applications...</div>
              ) : items.length === 0 ? (
                <div className="p-6 text-sm text-slate-600">
                  No applications yet. Add your first one from the panel above.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map((app) => (
                    <div
                      key={app.id}
                      className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,2fr)_140px_170px] md:items-center"
                    >
                      <div className="min-w-0">
                        {editingId === app.id ? (
                          <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="text-xs font-medium text-slate-700">Company</label>
                                <input
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                                  value={editCompany}
                                  onChange={(e) => setEditCompany(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-700">Role</label>
                                <input
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                                  value={editRoleTitle}
                                  onChange={(e) => setEditRoleTitle(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                              <div>
                                <label className="text-xs font-medium text-slate-700">Location</label>
                                <input
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 placeholder:text-slate-400 focus:border-[#0B4B4A] focus:ring-4"
                                  value={editLocation}
                                  onChange={(e) => setEditLocation(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-700">Status</label>
                                <select
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-[#0B4B4A]/25 focus:border-[#0B4B4A] focus:ring-4"
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
                            <div className="text-xs text-slate-500">Updated {formatDate(app.updatedAt)}</div>
                          </div>
                        ) : (
                          <>
                            <div className="text-base font-semibold text-slate-900">{app.company}</div>
                            <div className="mt-1 text-sm text-slate-700">{app.roleTitle}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                              {app.location ? <span>{app.location}</span> : <span>No location added</span>}
                              <span className="text-slate-300">•</span>
                              <span>Updated {formatDate(app.updatedAt)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="md:justify-self-start">
                        <span className={statusBadge(app.status)}>{app.status}</span>
                      </div>

                      <div className="flex items-center gap-2 md:justify-self-end">
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
          </div>
        </section>

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
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
      </PageContainer>
    </div>
  );
}
