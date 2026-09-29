export function FailedJobs({
  jobs,
}: {
  jobs: { id: string; agentName: string; status: string; error: string; attempts: number }[];
}) {
  const failed = jobs.filter((job) => job.status === "FAILED" || job.status === "CONFLICT");
  if (failed.length === 0) return null;
  return (
    <ul className="mt-4 grid gap-2">
      {failed.map((job) => (
        <li key={job.id} className="break-words rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm leading-6 text-rose-950">
          <span className="font-semibold">{job.agentName}</span>
          {" · "}
          {job.status === "CONFLICT" ? "Needs a decision" : "Failed"}
          {job.attempts > 0 ? ` · ${job.attempts} attempt${job.attempts === 1 ? "" : "s"}` : ""}
          <span className="mt-1 block">{job.error || "The step stopped without writing a result."}</span>
        </li>
      ))}
    </ul>
  );
}
