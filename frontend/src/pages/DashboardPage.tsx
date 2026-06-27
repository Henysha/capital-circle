import { ArrowRight, Landmark, ShieldCheck, TrendingUp, UsersRound, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button, Card } from "../components/ui";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl shadow-slate-300/50 md:p-10">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-32 h-40 w-40 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Community capital platform
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            Welcome, {user?.fullName ?? "member"}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Create groups, collect contributions, review funding requests, and keep every
            credit and debit visible through a shared ledger.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/groups/new">
              <Button>Create a group</Button>
            </Link>
            <Link to="/groups">
              <Button variant="secondary">
                View groups
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard
          icon={<UsersRound />}
          label="Group ledgers"
          value="Transparent"
          text="Every member sees the same contribution and funding history."
        />
        <MetricCard
          icon={<WalletCards />}
          label="Balance logic"
          value="Credits - Debits"
          text="Balances come from ledger entries, not mutable summary fields."
        />
        <MetricCard
          icon={<ShieldCheck />}
          label="Admin controls"
          value="Role-based"
          text="Only group admins approve or reject funding requests."
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card title="Current user" description="Loaded from GET /api/auth/me">
        <dl className="grid gap-4 sm:grid-cols-3">
          <UserField label="Name" value={user?.fullName ?? "Unknown"} />
          <UserField label="Email" value={user?.email ?? "Unknown"} />
          <UserField label="User ID" value={user?.id ?? "Unknown"} />
        </dl>
        </Card>
        <Card title="MVP flow" description="Built around transparent movement of funds.">
          <div className="space-y-4">
            <FlowItem icon={<Landmark />} title="Contribute" text="Credits enter the group ledger." />
            <FlowItem icon={<TrendingUp />} title="Request" text="Members submit funding needs." />
            <FlowItem icon={<ShieldCheck />} title="Approve" text="Admins convert approved requests to debits." />
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  text,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        {icon}
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </Card>
  );
}

function FlowItem({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function UserField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-2 break-all text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
