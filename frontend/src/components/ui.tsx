import clsx from "clsx";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { FundingRequestStatus, LedgerEntryType } from "../types";

export function Card({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-[1.75rem] border border-slate-200/80 bg-white/95 p-6 shadow-sm shadow-slate-200/70 ring-1 ring-white/70",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold tracking-tight text-slate-950">{title}</h2>}
            {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-slate-950 text-white shadow-slate-300 hover:-translate-y-0.5 hover:bg-slate-800 focus:ring-slate-200",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 focus:ring-slate-100",
        variant === "danger" &&
          "bg-rose-600 text-white shadow-rose-200 hover:-translate-y-0.5 hover:bg-rose-700 focus:ring-rose-100",
        variant === "ghost" &&
          "shadow-none text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 shadow-sm shadow-rose-100/70">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        {label}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: FundingRequestStatus }) {
  const className = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  }[status];

  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold", className)}>
      {status}
    </span>
  );
}

export function LedgerBadge({ type }: { type: LedgerEntryType }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        type === "CREDIT"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-slate-100 text-slate-700",
      )}
    >
      {type}
    </span>
  );
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

export const labelClass = "text-sm font-semibold text-slate-700";
