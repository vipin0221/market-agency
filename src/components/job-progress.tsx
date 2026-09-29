import type { ProjectState } from "@/lib/state";

const labels: Record<string, string> = {
  QUEUED: "Queued",
  RUNNING: "In progress",
  COMPLETED: "Complete",
  FAILED: "Failed",
  CONFLICT: "Needs a decision",
  BLOCKED: "Blocked",
};

export function JobProgress({ jobs, pipeline }: { jobs: ProjectState["jobs"]; pipeline: ProjectState["pipeline"] }) {
  if (jobs.length === 0) return null;
  const done = jobs.filter((job) => job.status === "COMPLETED").length;
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl">Pipeline</h2>
        <p className="text-xs font-medium text-ink-soft">
          {pipeline.label}
          {pipeline.agentName ? ` · ${pipeline.agentName}` : ""} · {done} of {jobs.length} complete
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{pipeline.detail}</p>
      <ol className="mt-4 grid gap-2">
        {jobs.map((job) => (
          <li key={job.id} className="flex min-w-0 flex-wrap items-baseline justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
            <span className="min-w-0 break-words font-medium">{job.agentName}</span>
            <span className={job.status === "FAILED" || job.status === "CONFLICT" ? "font-semibold text-rose-900" : "text-ink-soft"}>
              {labels[job.status] ?? job.status}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
