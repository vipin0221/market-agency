import { StatusPill } from "./status-pill";
import type { ProjectState } from "@/lib/state";

export function OutcomeBanner({
  workflow,
  llmConfigured,
  llmProvider,
  llmModel,
}: {
  workflow: NonNullable<ProjectState["workflow"]>;
  llmConfigured: boolean;
  llmProvider?: string | null;
  llmModel?: string | null;
}) {
  const tone =
    workflow.outcome === "ACTIVATION_BLOCKED" || workflow.status === "BLOCKED" || workflow.status === "FAILED" || workflow.status === "CONFLICT"
      ? "border-rose-200 bg-rose-50"
      : workflow.status === "AWAITING_APPROVAL" || workflow.status === "HOLD"
        ? "border-amber-200 bg-amber-50"
        : "border-line bg-panel";
  return (
    <section className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill value={workflow.status} />
        {workflow.outcome && workflow.outcome !== workflow.status ? <StatusPill value={workflow.outcome} /> : null}
        <span className="text-xs uppercase tracking-wide text-ink-soft">{workflow.mode}</span>
      </div>
      <p className="mt-2 text-sm leading-6">{workflow.blockerSummary || "The queue is working from the database."}</p>
      {workflow.error ? <p className="mt-1 text-sm text-rose-900">{workflow.error}</p> : null}
      {llmConfigured ? (
        <p className="mt-2 text-sm text-ink-soft">
          Text specialists are calling {llmProvider || "the configured model"}
          {llmModel ? ` · ${llmModel}` : ""}. Drafts are labeled LLM draft. They are not approved, and nothing is published.
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          No LLM API key is configured. Content is labeled No LLM and uses only this project’s fields. Research and metrics are not invented.
        </p>
      )}
    </section>
  );
}
