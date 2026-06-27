import axios from "axios";
import type {
  ApiError,
  AuthResponse,
  BalanceResponse,
  CapitalGroup,
  Contribution,
  FundingRequest,
  LedgerEntry,
  User,
} from "../types";

export const TOKEN_STORAGE_KEY = "capitalcircle.token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data;
    if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors).join(" ");
    }
    return data?.message ?? data?.error ?? "Something went wrong.";
  }
  return "Something went wrong.";
}

export const authApi = {
  register: (payload: { fullName: string; email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", payload),
  me: () => api.get<User>("/api/auth/me"),
};

export const groupsApi = {
  list: () => api.get<CapitalGroup[]>("/api/groups"),
  create: (payload: {
    name: string;
    description?: string;
    contributionGoal?: number;
  }) => api.post<CapitalGroup>("/api/groups", payload),
  get: (groupId: string) => api.get<CapitalGroup>(`/api/groups/${groupId}`),
  join: (groupId: string) => api.post<CapitalGroup>(`/api/groups/${groupId}/join`),
};

export const contributionsApi = {
  list: (groupId: string) =>
    api.get<Contribution[]>(`/api/groups/${groupId}/contributions`),
  create: (groupId: string, payload: { amount: number; note?: string }) =>
    api.post<Contribution>(`/api/groups/${groupId}/contributions`, payload),
};

export const fundingRequestsApi = {
  list: (groupId: string) =>
    api.get<FundingRequest[]>(`/api/groups/${groupId}/funding-requests`),
  create: (
    groupId: string,
    payload: { title: string; description?: string; amount: number },
  ) => api.post<FundingRequest>(`/api/groups/${groupId}/funding-requests`, payload),
  approve: (requestId: string) =>
    api.post<FundingRequest>(`/api/funding-requests/${requestId}/approve`),
  reject: (requestId: string) =>
    api.post<FundingRequest>(`/api/funding-requests/${requestId}/reject`),
};

export const ledgerApi = {
  list: (groupId: string) => api.get<LedgerEntry[]>(`/api/groups/${groupId}/ledger`),
  balance: (groupId: string) =>
    api.get<BalanceResponse>(`/api/groups/${groupId}/balance`),
};
