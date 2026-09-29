import { Section } from "@/components/ui";
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
    <Section
      title="Pipeline"
      lede={pipeline.detail}
      action={
        <p className="text-xs font-medium text-ink-soft">
          {pipeline.label}
          {pipeline.agentName ? ` · ${pipeline.agentName}` : ""} · {done} of {jobs.length}
        </p>
      }
      padded={false}
    >
      <ol>
        {jobs.map((job) => (
          <li key={job.id} className="flex min-w-0 items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-sm first:border-t-0">
            <span className="min-w-0 break-words">{job.agentName}</span>
            <span className={job.status === "FAILED" || job.status === "CONFLICT" ? "shrink-0 font-medium text-rose-800" : "shrink-0 text-ink-soft"}>
              {labels[job.status] ?? job.status}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
