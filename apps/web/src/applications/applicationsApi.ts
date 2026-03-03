
import { del, get, patch, post } from "../lib/api";

export type ApplicationStatus = "applied" | "interviewing" | "offer" | "rejected";

export type Application = {
  id: string;
  userId: string;
  company: string;
  roleTitle: string;
  description?: string;
  status: ApplicationStatus;
  appliedDate?: string;   
  interviewDate?: string;
  offerDate?: string;
  rejectionDate?: string;
  jobUrl?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListApplicationsQuery = {
  status?: ApplicationStatus;
  q?: string;
  page?: number;
  limit?: number;
  sort?:
    | "updatedAt:desc"
    | "updatedAt:asc"
    | "appliedDate:desc"
    | "appliedDate:asc"
    | "company:asc"
    | "company:desc";
};

export type ListApplicationsResponse = {
  items: Application[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApplicationStats = {
  total: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
};

export type CreateApplicationInput = {
  company: string;
  roleTitle: string;
  description?: string;
  status: ApplicationStatus;
  appliedDate?: string; 
  interviewDate?: string;
  offerDate?: string;
  rejectionDate?: string;
  jobUrl?: string;
  location?: string;
};

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

function toQueryString(query: ListApplicationsQuery) {
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.q) params.set("q", query.q);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.sort) params.set("sort", query.sort);

  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function listApplications(query: ListApplicationsQuery = {}) {
  return get<ListApplicationsResponse>(`/api/v1/applications${toQueryString(query)}`);
}

export async function getApplicationById(id: string) {
  // backend returns { application }
  const res = await get<{ application: Application }>(`/api/v1/applications/${id}`);
  return res.application;
}

export async function createApplication(input: CreateApplicationInput) {
  // depending on your backend response shape:
  // - if you return { application } -> use that
  // - if you return application directly -> adjust here
  const res = await post<{ application: Application }>(`/api/v1/applications`, input);
  return res.application;
}

export async function updateApplication(id: string, patchInput: UpdateApplicationInput) {
  const res = await patch<{ application: Application }>(`/api/v1/applications/${id}`, patchInput);
  return res.application;
}

export async function deleteApplication(id: string) {
  // backend returns 204
  await del<void>(`/api/v1/applications/${id}`);
}

export async function getApplicationStats() {
  return get<ApplicationStats>(`/api/v1/applications/stats`);
}