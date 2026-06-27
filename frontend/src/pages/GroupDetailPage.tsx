import clsx from "clsx";
import { Check, CircleDollarSign, Plus, WalletCards, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  contributionsApi,
  fundingRequestsApi,
  getApiErrorMessage,
  groupsApi,
  ledgerApi,
} from "../api/client";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  LedgerBadge,
  LoadingState,
  StatusBadge,
  formatCurrency,
  formatDate,
  inputClass,
  labelClass,
} from "../components/ui";
import type { CapitalGroup, Contribution, FundingRequest, LedgerEntry } from "../types";

type TabKey = "overview" | "contributions" | "funding" | "ledger";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "contributions", label: "Contributions" },
  { key: "funding", label: "Funding Requests" },
  { key: "ledger", label: "Ledger" },
];

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [group, setGroup] = useState<CapitalGroup | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedGroupRef = useRef(false);

  const groupId = id ?? "";

  const loadGroupData = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      if (!hasLoadedGroupRef.current) {
        setIsLoading(true);
      }
      setError(null);
      const [groupResponse, balanceResponse, contributionsResponse, fundingResponse, ledgerResponse] =
        await Promise.all([
          groupsApi.get(groupId),
          ledgerApi.balance(groupId),
          contributionsApi.list(groupId),
          fundingRequestsApi.list(groupId),
          ledgerApi.list(groupId),
        ]);

      setGroup(groupResponse.data);
      setBalance(Number(balanceResponse.data.balance));
      setContributions(contributionsResponse.data);
      setFundingRequests(fundingResponse.data);
      setLedger(ledgerResponse.data);
      hasLoadedGroupRef.current = true;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    hasLoadedGroupRef.current = false;
    void loadGroupData();
  }, [groupId, loadGroupData]);

  if (isLoading) {
    return <LoadingState label="Loading group..." />;
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!group) {
    return <EmptyState title="Group not found" description="This group could not be loaded." />;
  }

  return (
    <div className="space-y-7">
      <div>
        <Link className="text-sm font-semibold text-slate-500 hover:text-slate-950" to="/groups">
          Back to groups
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-stretch">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{group.name}</h1>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-bold text-white shadow-sm">
                {group.currentUserRole}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {group.description || "No description provided."}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/60">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Current balance</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <WalletCards className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <p className="mt-3 text-4xl font-bold tracking-tight">{formatCurrency(balance)}</p>
              <p className="mt-2 text-xs font-medium text-slate-400">
                Calculated from CREDIT and DEBIT ledger entries.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm shadow-slate-200/70 backdrop-blur">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={clsx(
              "whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition",
              activeTab === tab.key
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          group={group}
          balance={balance}
          contributionsCount={contributions.length}
          fundingRequestsCount={fundingRequests.length}
        />
      )}
      {activeTab === "contributions" && (
        <ContributionsTab
          groupId={group.id}
          contributions={contributions}
          onChanged={loadGroupData}
        />
      )}
      {activeTab === "funding" && (
        <FundingRequestsTab
          group={group}
          fundingRequests={fundingRequests}
          onChanged={loadGroupData}
        />
      )}
      {activeTab === "ledger" && <LedgerTab entries={ledger} />}
    </div>
  );
}

function OverviewTab({
  group,
  balance,
  contributionsCount,
  fundingRequestsCount,
}: {
  group: CapitalGroup;
  balance: number;
  contributionsCount: number;
  fundingRequestsCount: number;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-4">
      <Card className="border-emerald-100 bg-emerald-50/70">
        <Stat label="Balance" value={formatCurrency(balance)} accent />
      </Card>
      <Card>
        <Stat label="Contribution goal" value={formatCurrency(group.contributionGoal)} />
      </Card>
      <Card>
        <Stat label="Contributions" value={String(contributionsCount)} />
      </Card>
      <Card>
        <Stat label="Funding requests" value={String(fundingRequestsCount)} />
      </Card>
    </div>
  );
}

function ContributionsTab({
  groupId,
  contributions,
  onChanged,
}: {
  groupId: string;
  contributions: Contribution[];
  onChanged: () => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await contributionsApi.create(groupId, {
        amount: Number(amount),
        note,
      });
      setAmount("");
      setNote("");
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <Card title="Add contribution" description="Each contribution creates a CREDIT ledger entry.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}
          <div className="space-y-2">
            <label className={labelClass} htmlFor="contributionAmount">
              Amount
            </label>
            <input
              id="contributionAmount"
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="contributionNote">
              Note
            </label>
            <input
              id="contributionNote"
              className={inputClass}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Monthly savings"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Plus className="mr-2 h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add contribution"}
          </Button>
        </form>
      </Card>

      <Card title="Contribution history">
        {contributions.length === 0 ? (
          <EmptyState
            title="No contributions yet"
            description="Add the first contribution to start the ledger."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Amount</Th>
                <Th>Note</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((contribution) => (
                <tr key={contribution.id}>
                  <Td strong>{formatCurrency(contribution.amount)}</Td>
                  <Td>{contribution.note || "No note"}</Td>
                  <Td>{formatDate(contribution.contributedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function FundingRequestsTab({
  group,
  fundingRequests,
  onChanged,
}: {
  group: CapitalGroup;
  fundingRequests: FundingRequest[];
  onChanged: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await fundingRequestsApi.create(group.id, {
        title,
        description,
        amount: Number(amount),
      });
      setTitle("");
      setDescription("");
      setAmount("");
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function decide(requestId: string, action: "approve" | "reject") {
    setActionError(null);
    setBusyRequestId(requestId);

    try {
      if (action === "approve") {
        await fundingRequestsApi.approve(requestId);
      } else {
        await fundingRequestsApi.reject(requestId);
      }
      await onChanged();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError));
    } finally {
      setBusyRequestId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
      <Card title="Create request" description="New funding requests start as PENDING.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}
          <div className="space-y-2">
            <label className={labelClass} htmlFor="requestTitle">
              Title
            </label>
            <input
              id="requestTitle"
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="requestAmount">
              Amount
            </label>
            <input
              id="requestAmount"
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="requestDescription">
              Description
            </label>
            <textarea
              id="requestDescription"
              className={`${inputClass} min-h-24 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <CircleDollarSign className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create request"}
          </Button>
        </form>
      </Card>

      <Card title="Funding requests">
        {actionError && <div className="mb-4"><Alert>{actionError}</Alert></div>}
        {fundingRequests.length === 0 ? (
          <EmptyState
            title="No funding requests"
            description="Create a request when a member needs group capital."
          />
        ) : (
          <div className="space-y-4">
            {fundingRequests.map((request) => (
              <div key={request.id} className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">{request.title}</h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {request.description || "No description provided."}
                    </p>
                  </div>
                  <p className="text-lg font-bold tabular-nums text-slate-950">
                    {formatCurrency(request.amount)}
                  </p>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-slate-500">
                    Created {formatDate(request.createdAt)}
                  </p>
                  {group.currentUserRole === "ADMIN" && request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busyRequestId === request.id}
                        onClick={() => void decide(request.id, "approve")}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={busyRequestId === request.id}
                        onClick={() => void decide(request.id, "reject")}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LedgerTab({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card title="Group ledger" description="Credits increase the balance; debits reduce it.">
      {entries.length === 0 ? (
        <EmptyState
          title="No ledger entries"
          description="Contributions and approved requests will appear here."
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Description</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <Td>
                  <LedgerBadge type={entry.type} />
                </Td>
                <Td strong>{formatCurrency(entry.amount)}</Td>
                <Td>{entry.description}</Td>
                <Td>{formatDate(entry.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className={clsx("text-sm font-medium", accent ? "text-emerald-700" : "text-slate-500")}>{label}</p>
      <p className={clsx("mt-2 text-2xl font-bold tabular-nums", accent ? "text-emerald-950" : "text-slate-950")}>
        {value}
      </p>
    </div>
  );
}

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={clsx(
        "border-b border-slate-100 px-4 py-4 text-slate-600",
        strong && "font-semibold tabular-nums text-slate-950",
      )}
    >
      {children}
    </td>
  );
}
