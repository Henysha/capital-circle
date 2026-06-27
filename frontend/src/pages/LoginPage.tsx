import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api/client";
import { Alert, Button, Card, inputClass, labelClass } from "../components/ui";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from ?? "/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your capital circle"
      subtitle="Track contributions, funding decisions, and transparent group balances."
    >
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}

          <div className="space-y-2">
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-sm text-slate-500">
            New to CapitalCircle?{" "}
            <Link className="font-semibold text-slate-950 hover:underline" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </Card>
    </AuthShell>
  );
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
            CapitalCircle
          </div>
          <div className="mt-24 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-tight">{title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">{subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Built for pooled savings, accountable ledgers, and modern fintech workflows.
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-100 p-5">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              CapitalCircle
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
