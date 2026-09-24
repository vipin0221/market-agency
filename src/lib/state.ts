import { AGENTS } from "./catalog";
import { prisma } from "./db";
import { llmStatus } from "./llm";
import { parseJson } from "./types";

export async function getProjectState(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      workflows: { orderBy: { createdAt: "desc" } },
      outputs: { orderBy: { createdAt: "desc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      campaigns: { orderBy: { createdAt: "desc" } },
      contentAssets: { orderBy: { createdAt: "desc" } },
      creativeAssets: { orderBy: { createdAt: "desc" } },
      integrations: { orderBy: { label: "asc" } },
      metrics: { orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 100 },
      agentRuns: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!project) return null;

  const workflow = project.workflows[0] ?? null;
  const plan = workflow ? parseJson<string[]>(workflow.planJson, []) : [];
  const gateIndex = plan.indexOf("APPROVAL_GATE");
  const terminal = workflow ? ["COMPLETED", "BLOCKED", "FAILED", "CONFLICT", "HOLD"].includes(workflow.status) : false;
  const runs = workflow ? project.agentRuns.filter((run) => run.workflowId === workflow.id) : [];

  const agents = AGENTS.map((agent) => {
    const latest = [...runs].reverse().find((run) => run.agentKey === agent.key);
    if (latest) {
      return {
        ...agent,
        status: latest.status,
        summary: latest.summary,
        qa: latest.qa,
        error: latest.error,
        startedAt: latest.startedAt.toISOString(),
        finishedAt: latest.finishedAt?.toISOString() ?? null,
      };
    }
    const planIndex = plan.indexOf(agent.key);
    if (!workflow || planIndex === -1) {
      return {
        ...agent,
        status: "SKIPPED",
        summary: workflow ? "Not in scope for this request." : "No workflow yet.",
        qa: "",
        error: "",
        startedAt: null,
        finishedAt: null,
      };
    }
    if (terminal) {
      return {
        ...agent,
        status: "SKIPPED",
        summary: "This step did not run.",
        qa: "",
        error: "",
        startedAt: null,
        finishedAt: null,
      };
    }
    if (workflow.status === "AWAITING_APPROVAL" && planIndex > gateIndex) {
      return {
        ...agent,
        status: "WAITING",
        summary: "Held until a person records a decision. Silence is not approval.",
        qa: "",
        error: "",
        startedAt: null,
        finishedAt: null,
      };
    }
    return {
      ...agent,
      status: "IDLE",
      summary: "In the plan. The queue has not reached this step.",
      qa: "",
      error: "",
      startedAt: null,
      finishedAt: null,
    };
  });

  const workflowApprovals = workflow ? project.approvals.filter((item) => item.workflowId === workflow.id) : [];
  const pending = workflowApprovals.find((item) => item.status === "PENDING") ?? null;
  const latestDecision = workflowApprovals[0] ?? null;
  let approvalStatus = "IDLE";
  if (!workflow) approvalStatus = "IDLE";
  else if (pending || workflow.status === "AWAITING_APPROVAL") approvalStatus = "AWAITING_APPROVAL";
  else if (latestDecision?.status === "APPROVED") approvalStatus = "APPROVED";
  else if (latestDecision?.status === "HOLD" || workflow.status === "HOLD") approvalStatus = "HOLD";
  else if (latestDecision?.status === "REVISION_REQUESTED") approvalStatus = "REVISION_REQUESTED";
  else if (gateIndex === -1 || workflow.cursor < gateIndex) approvalStatus = "WAITING";

  const connected = project.integrations.filter((item) => item.status === "CONNECTED").length;

  return {
    llmConfigured: llmStatus().configured,
    llmProvider: llmStatus().provider,
    project: {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    client: project.client,
    counts: {
      workflows: project.workflows.length,
      outputs: project.outputs.length,
      contentAssets: project.contentAssets.length,
      pendingApprovals: project.approvals.filter((item) => item.status === "PENDING").length,
      connectedIntegrations: connected,
      integrations: project.integrations.length,
      metrics: project.metrics.length,
    },
    workflow: workflow
      ? {
          id: workflow.id,
          requestText: workflow.requestText,
          status: workflow.status,
          outcome: workflow.outcome,
          mode: workflow.mode,
          blockerSummary: workflow.blockerSummary,
          error: workflow.error,
          createdAt: workflow.createdAt.toISOString(),
          updatedAt: workflow.updatedAt.toISOString(),
          plan,
        }
      : null,
    workflows: project.workflows.map((item) => ({
      id: item.id,
      requestText: item.requestText,
      status: item.status,
      outcome: item.outcome,
      blockerSummary: item.blockerSummary,
      createdAt: item.createdAt.toISOString(),
    })),
    agents,
    approval: {
      status: approvalStatus,
      pendingId: pending?.id ?? null,
      note: latestDecision?.note ?? "",
      decidedAt: latestDecision?.decidedAt?.toISOString() ?? null,
    },
    approvals: project.approvals.map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      outputId: item.outputId,
      status: item.status,
      note: item.note,
      decidedAt: item.decidedAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    })),
    outputs: project.outputs.map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      agentKey: item.agentKey,
      kind: item.kind,
      title: item.title,
      status: item.status,
      summary: item.summary,
      generationMode: item.generationMode,
      body: parseJson<Record<string, unknown>>(item.bodyJson, {}),
      createdAt: item.createdAt.toISOString(),
    })),
    campaigns: project.campaigns.map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      name: item.name,
      objective: item.objective,
      channels: item.channels,
      status: item.status,
      body: parseJson<Record<string, unknown>>(item.bodyJson, {}),
      createdAt: item.createdAt.toISOString(),
    })),
    contentAssets: project.contentAssets.map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      campaignId: item.campaignId,
      platform: item.platform,
      channelSource: item.channelSource,
      funnelStage: item.funnelStage,
      angle: item.angle,
      hook: item.hook,
      headline: item.headline,
      caption: item.caption,
      cta: item.cta,
      ctaSource: item.ctaSource,
      format: item.format,
      claimsNote: item.claimsNote,
      generationMode: item.generationMode,
      status: item.status,
      body: parseJson<Record<string, unknown>>(item.bodyJson, {}),
      createdAt: item.createdAt.toISOString(),
    })),
    creativeAssets: project.creativeAssets.map((item) => ({
      id: item.id,
      workflowId: item.workflowId,
      kind: item.kind,
      title: item.title,
      status: item.status,
      generationMode: item.generationMode,
      body: parseJson<Record<string, unknown>>(item.bodyJson, {}),
      createdAt: item.createdAt.toISOString(),
    })),
    integrations: project.integrations.map((item) => ({
      id: item.id,
      provider: item.provider,
      label: item.label,
      status: item.status,
      detail: item.detail,
    })),
    metrics: project.metrics.map((item) => ({
      id: item.id,
      name: item.name,
      value: item.value,
      note: item.note,
      source: item.source,
      observedAt: item.observedAt.toISOString(),
    })),
    auditLogs: project.auditLogs.map((item) => ({
      id: item.id,
      actor: item.actor,
      action: item.action,
      detail: item.detail,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export type ProjectState = NonNullable<Awaited<ReturnType<typeof getProjectState>>>;
