import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Alert, Button, Card, inputClass, labelClass } from "../components/ui";
import { AuthShell } from "./LoginPage";

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ fullName, email, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Start a circle"
      title="Create your CapitalCircle account"
      subtitle="Launch a transparent community capital group with contributions and funding records."
    >
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}

          <div className="space-y-2">
            <label className={labelClass} htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className={inputClass}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <p className="text-xs text-slate-500">Use at least 8 characters.</p>
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-950 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </Card>
    </AuthShell>
  );
}
