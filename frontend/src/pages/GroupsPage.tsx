import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage, groupsApi } from "../api/client";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  LoadingState,
  formatCurrency,
  formatDate,
} from "../components/ui";
import type { CapitalGroup } from "../types";

export function GroupsPage() {
  const [groups, setGroups] = useState<CapitalGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await groupsApi.list();
        setGroups(response.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    }

    void loadGroups();
  }, []);

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Groups
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Your capital groups</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review the groups you belong to, their contribution goals, and your current role.
          </p>
        </div>
        <Link to="/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create group
          </Button>
        </Link>
      </div>

      {error && <Alert>{error}</Alert>}

      <Card className="p-5 sm:p-6">
        {isLoading ? (
          <LoadingState label="Loading groups..." />
        ) : groups.length === 0 ? (
          <EmptyState
            title="No groups yet"
            description="Create your first capital group to start tracking contributions."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="group rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{group.name}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {group.description || "No description provided."}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    {group.currentUserRole}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-slate-500">Goal</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatCurrency(group.contributionGoal)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatDate(group.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
