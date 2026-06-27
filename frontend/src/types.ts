export type GroupRole = "ADMIN" | "MEMBER";
export type FundingRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LedgerEntryType = "CREDIT" | "DEBIT";

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CapitalGroup {
  id: string;
  name: string;
  description: string | null;
  contributionGoal: number | null;
  createdByUserId: string;
  currentUserRole: GroupRole;
  createdAt: string;
}

export interface Contribution {
  id: string;
  groupId: string;
  contributorUserId: string;
  amount: number;
  note: string | null;
  contributedAt: string;
}

export interface FundingRequest {
  id: string;
  groupId: string;
  requesterUserId: string;
  title: string;
  description: string | null;
  amount: number;
  status: FundingRequestStatus;
  decidedByUserId: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  groupId: string;
  type: LedgerEntryType;
  amount: number;
  description: string;
  contributionId: string | null;
  fundingRequestId: string | null;
  createdAt: string;
}

export interface BalanceResponse {
  groupId: string;
  balance: number;
}

export interface ApiError {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}
