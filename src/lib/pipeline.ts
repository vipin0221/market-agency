import { agentByKey } from "./catalog";

export type PipelineJob = {
  id: string;
  agentKey: string;
  agentName: string;
  status: string;
  error: string;
  sequence: number;
  attempts: number;
  updatedAt: string;
};

export type PipelineState = "idle" | "queued" | "running" | "failed" | "needs_human" | "done";

export type PipelineView = {
  state: PipelineState;
  label: string;
  detail: string;
  agentKey: string | null;
  agentName: string | null;
  error: string | null;
  jobId: string | null;
  canRetry: boolean;
  stalled: boolean;
};

const STALL_MS = 45_000;

export function describePipeline(input: {
  workflow: { status: string; outcome: string; error: string; blockerSummary: string } | null;
  approvalStatus: string;
  jobs: PipelineJob[];
}): PipelineView {
  if (!input.workflow) {
    return {
      state: "idle",
      label: "Idle",
      detail: "No request is in the queue.",
      agentKey: null,
      agentName: null,
      error: null,
      jobId: null,
      canRetry: false,
      stalled: false,
    };
  }

  const latest = input.jobs[input.jobs.length - 1] ?? null;
  const failedJob = [...input.jobs].reverse().find((job) => job.status === "FAILED" || job.status === "CONFLICT");
  const workflowFailed = input.workflow.status === "FAILED" || input.workflow.status === "CONFLICT";
  if (workflowFailed || (failedJob && latest?.id === failedJob.id)) {
    const name = failedJob?.agentName || (failedJob ? agentByKey(failedJob.agentKey)?.name : null) || failedJob?.agentKey || "This step";
    const error = clean(failedJob?.error || input.workflow.error || input.workflow.blockerSummary) || "The step stopped before it wrote a result.";
    const conflict = failedJob?.status === "CONFLICT" || input.workflow.status === "CONFLICT";
    return {
      state: "failed",
      label: conflict ? "Needs a decision" : "Failed",
      detail: `${name} ${conflict ? "needs a decision" : "failed"}. ${error} Retry runs this step again and does not invent a result. You can also start another request.`,
      agentKey: failedJob?.agentKey ?? null,
      agentName: name,
      error,
      jobId: failedJob?.id ?? null,
      canRetry: Boolean(failedJob),
      stalled: false,
    };
  }

  if (
    input.approvalStatus === "AWAITING_APPROVAL" ||
    input.approvalStatus === "HOLD" ||
    input.workflow.status === "AWAITING_APPROVAL" ||
    input.workflow.status === "HOLD"
  ) {
    const held = input.approvalStatus === "HOLD" || input.workflow.status === "HOLD";
    return {
      state: "needs_human",
      label: "Needs you",
      detail: held
        ? "This round is on hold until you approve, ask for a revision, or start another request."
        : "Drafts are waiting for a recorded decision. Silence is not approval, and nothing is posted.",
      agentKey: null,
      agentName: "Review",
      error: null,
      jobId: null,
      canRetry: false,
      stalled: false,
    };
  }

  const active =
    input.workflow.status === "QUEUED" ||
    input.workflow.status === "RUNNING" ||
    latest?.status === "QUEUED" ||
    latest?.status === "RUNNING";
  if (active) {
    const running = latest?.status === "RUNNING";
    const name = latest?.agentName || (latest ? agentByKey(latest.agentKey)?.name : null) || "The next step";
    const stalled =
      !running &&
      latest?.status === "QUEUED" &&
      Number.isFinite(new Date(latest.updatedAt).getTime()) &&
      Date.now() - new Date(latest.updatedAt).getTime() > STALL_MS;
    return {
      state: running ? "running" : "queued",
      label: running ? "In progress" : "Queued",
      detail: running
        ? `${name} is running. This page updates on its own. If the step fails, the error stays on screen.`
        : stalled
          ? `${name} is still queued. Run the queue now. If the step fails, the error stays on screen.`
          : `${name} is queued and has not started.`,
      agentKey: latest?.agentKey ?? null,
      agentName: name,
      error: null,
      jobId: latest?.id ?? null,
      canRetry: false,
      stalled,
    };
  }

  return {
    state: "done",
    label: "Complete",
    detail:
      input.workflow.outcome === "ACTIVATION_BLOCKED"
        ? "The round finished. Accounts stay NOT_CONNECTED, and nothing was posted."
        : clean(input.workflow.blockerSummary) || "This round is finished. Nothing was posted.",
    agentKey: latest?.agentKey ?? null,
    agentName: latest?.agentName ?? null,
    error: null,
    jobId: null,
    canRetry: false,
    stalled: false,
  };
}

function clean(summary: string) {
  return summary.replace(/^(BLOCKED|FAILED)\.\s*/i, "").trim();
}
