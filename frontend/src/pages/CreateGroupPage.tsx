import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage, groupsApi } from "../api/client";
import { Alert, Button, Card, inputClass, labelClass } from "../components/ui";

export function CreateGroupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contributionGoal, setContributionGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await groupsApi.create({
        name,
        description,
        contributionGoal: contributionGoal ? Number(contributionGoal) : undefined,
      });
      navigate(`/groups/${response.data.id}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div>
        <Link className="text-sm font-semibold text-slate-500 hover:text-slate-950" to="/groups">
          Back to groups
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Create a capital group</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Define the group, set an optional contribution goal, and you will become the admin.
        </p>
      </div>

      <Card title="Group details" description="Keep it concise and clear for members.">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}

          <div className="space-y-2">
            <label className={labelClass} htmlFor="name">
              Group name
            </label>
            <input
              id="name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={`${inputClass} min-h-28 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass} htmlFor="contributionGoal">
              Contribution goal
            </label>
            <input
              id="contributionGoal"
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={contributionGoal}
              onChange={(event) => setContributionGoal(event.target.value)}
              placeholder="1000.00"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create group"}
            </Button>
            <Link to="/groups">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
