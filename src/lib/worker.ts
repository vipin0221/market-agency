import { audit } from "./audit";
import { prisma, prepareDatabase } from "./db";
import { buildPlan, buildWorkContext } from "./planning";
import { runSpecialist } from "./specialist";
import { parseJson, type HandoffOutput, type SpecialistResult } from "./types";

const globalForWorker = globalThis as unknown as { agencyWorker?: boolean; agencyTick?: Promise<unknown> };

export function startWorker() {
  if (globalForWorker.agencyWorker) return;
  globalForWorker.agencyWorker = true;
  void prepareDatabase().catch((error) => console.error("database pragma failed", error));
  void recoverStuckJobs().catch((error) => console.error("job recovery failed", error));
  setInterval(() => {
    void tick().catch((error) => console.error("worker tick failed", error));
  }, 1200);
}

export function tick() {
  if (!globalForWorker.agencyTick) {
    globalForWorker.agencyTick = processOne().finally(() => {
      globalForWorker.agencyTick = undefined;
    });
  }
  return globalForWorker.agencyTick;
}

async function processOne() {
  await recoverStuckJobs();
  const job = await prisma.job.findFirst({
    where: { status: "QUEUED" },
    orderBy: [{ createdAt: "asc" }, { sequence: "asc" }],
  });
  if (!job) return { processed: false, reason: "idle" };

  const claimed = await prisma.job.updateMany({
    where: { id: job.id, status: "QUEUED" },
    data: { status: "RUNNING", lockedAt: new Date(), attempts: { increment: 1 } },
  });
  if (claimed.count === 0) return { processed: false, reason: "contended" };

  const workflow = await prisma.workflow.findUnique({
    where: { id: job.workflowId },
    include: {
      project: { include: { client: true, integrations: true, metrics: true } },
      outputs: { orderBy: { createdAt: "asc" } },
      approvals: true,
      contentAssets: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!workflow || !workflow.project.client) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "FAILED", error: "Project or client record is missing." },
    });
    return { processed: true, status: "FAILED", agentKey: job.agentKey };
  }

  await prisma.workflow.update({
    where: { id: workflow.id },
    data: { status: "RUNNING", cursor: job.sequence },
  });
  const running = await prisma.agentRun.create({
    data: {
      projectId: workflow.projectId,
      workflowId: workflow.id,
      jobId: job.id,
      agentKey: job.agentKey,
      status: "RUNNING",
      summary: "Reading the project record and upstream handoff.",
    },
  });

  try {
    const payload = parseJson<{ revisionNote?: string }>(job.payloadJson, {});
    const ctx = buildWorkContext({
      projectId: workflow.projectId,
      projectName: workflow.project.name,
      businessName: workflow.project.client.businessName,
      industry: workflow.project.client.industry,
      audience: workflow.project.client.audience,
      geography: workflow.project.client.geography,
      goals: workflow.project.client.goals,
      offers: workflow.project.client.offers,
      budget: workflow.project.client.budget,
      constraints: workflow.project.client.constraints,
      website: workflow.project.client.website,
      notes: workflow.project.client.notes,
      primaryCta: workflow.project.client.primaryCta,
      funnel: workflow.project.client.funnel,
      channels: workflow.project.client.channels,
      requestText: workflow.requestText,
      integrations: workflow.project.integrations.map((item) => ({
        provider: item.provider,
        label: item.label,
        status: item.status,
      })),
      metrics: workflow.project.metrics.map((item) => ({
        name: item.name,
        value: item.value,
        note: item.note,
        source: item.source,
      })),
      approvals: workflow.approvals.map((item) => ({ status: item.status, note: item.note })),
      mode: job.mode === "PATCH" ? "PATCH" : "GENERATE",
      revisionNote: payload.revisionNote || "",
      handoff: workflow.outputs.map(toHandoff),
      priorAssets: workflow.contentAssets
        .filter((asset) => asset.status === "READY_FOR_HUMAN_REVIEW" || asset.status === "APPROVED")
        .map((asset) => ({
          platform: asset.platform,
          hook: asset.hook,
          caption: asset.caption,
          cta: asset.cta,
          status: asset.status,
        })),
    });

    const result = await runSpecialist(job.agentKey, ctx);
    await persistResult({
      jobId: job.id,
      runId: running.id,
      projectId: workflow.projectId,
      workflowId: workflow.id,
      agentKey: job.agentKey,
      sequence: job.sequence,
      result,
    });
    return { processed: true, status: result.runStatus, agentKey: job.agentKey, workflowId: workflow.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected worker error.";
    await prisma.job.update({ where: { id: job.id }, data: { status: "FAILED", error: message } });
    await prisma.agentRun.update({
      where: { id: running.id },
      data: { status: "FAILED", error: message, summary: message, finishedAt: new Date(), qa: "FAIL" },
    });
    await prisma.workflow.update({
      where: { id: workflow.id },
      data: { status: "FAILED", outcome: "FAILED", error: message },
    });
    await audit({
      projectId: workflow.projectId,
      workflowId: workflow.id,
      actor: `agent:${job.agentKey}`,
      action: "AGENT_FAILED",
      detail: message,
    });
    return { processed: true, status: "FAILED", agentKey: job.agentKey };
  }
}

async function persistResult(input: {
  jobId: string;
  runId: string;
  projectId: string;
  workflowId: string;
  agentKey: string;
  sequence: number;
  result: SpecialistResult;
}) {
  const stopping = !input.result.continuePipeline;
  const job = await prisma.job.findUnique({ where: { id: input.jobId } });

  await prisma.$transaction(async (tx) => {
    if (input.agentKey === "content_studio" && input.result.runStatus === "COMPLETED" && job?.mode === "PATCH") {
      await tx.contentAsset.updateMany({
        where: {
          workflowId: input.workflowId,
          status: { in: ["READY_FOR_HUMAN_REVIEW", "DRAFT"] },
        },
        data: { status: "REVISION_REQUESTED" },
      });
      await tx.output.updateMany({
        where: {
          workflowId: input.workflowId,
          kind: "content_pack",
          status: "READY_FOR_HUMAN_REVIEW",
        },
        data: { status: "REVISION_REQUESTED" },
      });
    }

    let outputId: string | null = null;
    if (input.result.output) {
      const output = await tx.output.create({
        data: {
          projectId: input.projectId,
          workflowId: input.workflowId,
          jobId: input.jobId,
          agentKey: input.agentKey,
          kind: input.result.output.kind,
          title: input.result.output.title,
          status: input.result.output.status,
          summary: input.result.output.summary,
          generationMode: input.result.output.generationMode,
          bodyJson: JSON.stringify(input.result.output.body),
        },
      });
      outputId = output.id;
    }

    let campaignId: string | undefined;
    if (input.result.campaigns?.length) {
      for (const campaign of input.result.campaigns) {
        const created = await tx.campaign.create({
          data: {
            projectId: input.projectId,
            workflowId: input.workflowId,
            jobId: input.jobId,
            name: campaign.name,
            objective: campaign.objective,
            channels: campaign.channels,
            status: campaign.status,
            bodyJson: JSON.stringify(campaign.body),
          },
        });
        campaignId = created.id;
      }
    } else {
      const existing = await tx.campaign.findFirst({
        where: { workflowId: input.workflowId },
        orderBy: { createdAt: "desc" },
      });
      campaignId = existing?.id;
    }

    if (input.result.campaignStatusUpdate && campaignId) {
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: input.result.campaignStatusUpdate },
      });
    }

    if (input.result.contentAssets?.length) {
      await tx.contentAsset.createMany({
        data: input.result.contentAssets.map((asset) => ({
          projectId: input.projectId,
          workflowId: input.workflowId,
          campaignId: campaignId ?? null,
          outputId,
          jobId: input.jobId,
          platform: asset.platform,
          channelSource: asset.channelSource,
          funnelStage: asset.funnelStage,
          angle: asset.angle,
          hook: asset.hook,
          headline: asset.headline,
          caption: asset.caption,
          cta: asset.cta,
          ctaSource: asset.ctaSource,
          format: asset.format,
          claimsNote: asset.claimsNote,
          generationMode: asset.generationMode,
          status: asset.status,
          bodyJson: JSON.stringify(asset.body),
        })),
      });
    }

    if (input.result.creativeAssets?.length) {
      await tx.creativeAsset.createMany({
        data: input.result.creativeAssets.map((asset) => ({
          projectId: input.projectId,
          workflowId: input.workflowId,
          jobId: input.jobId,
          kind: asset.kind,
          title: asset.title,
          status: asset.status,
          generationMode: asset.generationMode,
          bodyJson: JSON.stringify(asset.body),
        })),
      });
    }

    await tx.agentRun.update({
      where: { id: input.runId },
      data: {
        status: input.result.runStatus,
        summary: input.result.summary,
        qa: input.result.qa ?? "",
        error: input.result.error ?? "",
        finishedAt: new Date(),
      },
    });
    await tx.job.update({
      where: { id: input.jobId },
      data: {
        status: input.result.runStatus === "COMPLETED" ? "COMPLETED" : input.result.runStatus,
        error: input.result.error ?? "",
      },
    });
    await tx.project.update({ where: { id: input.projectId }, data: { updatedAt: new Date() } });
  });

  await audit({
    projectId: input.projectId,
    workflowId: input.workflowId,
    actor: `agent:${input.agentKey}`,
    action: `AGENT_${input.result.runStatus}`,
    detail: input.result.summary,
  });

  if (stopping) {
    const outcome = input.result.runStatus === "CONFLICT" ? "CONFLICT" : input.result.runStatus === "FAILED" ? "FAILED" : "BLOCKED";
    await prisma.workflow.update({
      where: { id: input.workflowId },
      data: {
        status: outcome === "CONFLICT" ? "CONFLICT" : outcome,
        outcome,
        blockerSummary: input.result.summary,
        error: input.result.error ?? "",
      },
    });
    return;
  }

  await advance(input.workflowId, input.sequence);
}

async function advance(workflowId: string, fromIndex: number) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return;
  const plan = parseJson<string[]>(workflow.planJson, []);
  const nextIndex = fromIndex + 1;
  const next = plan[nextIndex];
  if (!next) {
    await finalize(workflowId);
    return;
  }
  if (next === "APPROVAL_GATE") {
    await openApprovalGate(workflowId, nextIndex);
    return;
  }
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: "RUNNING", cursor: nextIndex },
  });
  await prisma.job.create({
    data: {
      workflowId,
      agentKey: next,
      status: "QUEUED",
      sequence: nextIndex,
      mode: "GENERATE",
    },
  });
}

async function openApprovalGate(workflowId: string, gateIndex: number) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { outputs: { orderBy: { createdAt: "desc" } } },
  });
  if (!workflow) return;
  const pending = await prisma.approval.findFirst({ where: { workflowId, status: "PENDING" } });
  if (pending) {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: "AWAITING_APPROVAL",
        outcome: "AWAITING_APPROVAL",
        cursor: gateIndex,
        blockerSummary: "Waiting for a recorded decision. Silence is not approval.",
      },
    });
    return;
  }
  const content = workflow.outputs.find((output) => output.kind === "content_pack" && output.status === "READY_FOR_HUMAN_REVIEW");
  if (!content) {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: "BLOCKED",
        outcome: "BLOCKED",
        cursor: gateIndex,
        blockerSummary: "BLOCKED. The approval gate has no content pack to decide on.",
      },
    });
    await audit({
      projectId: workflow.projectId,
      workflowId,
      actor: "system",
      action: "APPROVAL_BLOCKED",
      detail: "No content pack was ready for review.",
    });
    return;
  }
  await prisma.approval.create({
    data: {
      projectId: workflow.projectId,
      workflowId,
      outputId: content.id,
      status: "PENDING",
    },
  });
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: "AWAITING_APPROVAL",
      outcome: "AWAITING_APPROVAL",
      cursor: gateIndex,
      blockerSummary: "Waiting for a recorded decision. Silence is not approval.",
    },
  });
  await audit({
    projectId: workflow.projectId,
    workflowId,
    actor: "system",
    action: "AWAITING_APPROVAL",
    detail: "Content is ready for APPROVE, REVISION, or HOLD. Nothing will publish from this gate.",
  });
}

export async function finalize(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { agentRuns: true, project: { include: { integrations: true } } },
  });
  if (!workflow) return;
  const statuses = workflow.agentRuns.map((run) => run.status);
  const connected = workflow.project.integrations.filter((item) => item.status === "CONNECTED").length;
  let status = "COMPLETED";
  let outcome = "COMPLETED";
  const notes: string[] = [];
  if (statuses.includes("FAILED")) {
    status = "FAILED";
    outcome = "FAILED";
    notes.push("An agent failed.");
  } else if (statuses.includes("CONFLICT")) {
    status = "CONFLICT";
    outcome = "CONFLICT";
    notes.push("A source conflict is unresolved.");
  } else if (connected === 0 || statuses.includes("BLOCKED")) {
    status = "BLOCKED";
    outcome = "ACTIVATION_BLOCKED";
    notes.push("Activation is blocked. No integration is connected, or a specialist refused to invent missing evidence. Nothing was published.");
  }
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status, outcome, blockerSummary: notes.join(" ") },
  });
  await audit({
    projectId: workflow.projectId,
    workflowId,
    actor: "system",
    action: "WORKFLOW_FINISHED",
    detail: `${outcome}. ${notes.join(" ")}`.trim(),
  });
}

export async function resumeAfterApproval(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return;
  const plan = parseJson<string[]>(workflow.planJson, []);
  const gateIndex = plan.indexOf("APPROVAL_GATE");
  if (gateIndex < 0) return;
  await advance(workflowId, gateIndex);
}

export async function queueRevision(workflowId: string, note: string) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return;
  const plan = parseJson<string[]>(workflow.planJson, []);
  const contentIndex = plan.indexOf("content_studio");
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      status: "RUNNING",
      outcome: "",
      mode: "PATCH",
      cursor: contentIndex,
      blockerSummary: "",
      error: "",
    },
  });
  await prisma.job.create({
    data: {
      workflowId,
      agentKey: "content_studio",
      status: "QUEUED",
      sequence: contentIndex,
      mode: "PATCH",
      payloadJson: JSON.stringify({ revisionNote: note }),
    },
  });
}

export async function queueIntelligence(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return;
  const plan = parseJson<string[]>(workflow.planJson, []);
  const index = plan.indexOf("campaign_intelligence");
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: "RUNNING", outcome: "", blockerSummary: "" },
  });
  await prisma.job.create({
    data: {
      workflowId,
      agentKey: "campaign_intelligence",
      status: "QUEUED",
      sequence: index === -1 ? 900 : index,
      mode: "GENERATE",
    },
  });
}

async function recoverStuckJobs() {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const stuck = await prisma.job.findMany({
    where: { status: "RUNNING", lockedAt: { lt: cutoff } },
  });
  for (const job of stuck) {
    if (job.attempts >= 3) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED", error: "Job stayed RUNNING and was marked FAILED after 3 attempts." },
      });
      await prisma.workflow.update({
        where: { id: job.workflowId },
        data: { status: "FAILED", outcome: "FAILED", error: "A job failed after repeated attempts." },
      });
    } else {
      await prisma.job.update({ where: { id: job.id }, data: { status: "QUEUED" } });
    }
  }
}

function toHandoff(output: {
  kind: string;
  agentKey: string;
  status: string;
  summary: string;
  generationMode: string;
  bodyJson: string;
}): HandoffOutput {
  return {
    kind: output.kind,
    agentKey: output.agentKey,
    status: output.status,
    summary: output.summary,
    generationMode: output.generationMode,
    body: parseJson<Record<string, unknown>>(output.bodyJson, {}),
  };
}

export async function createWorkflow(projectId: string, requestText: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });
  if (!project?.client) throw new Error("Project not found.");
  const channels = project.client.channels;
  const ctx = buildWorkContext({
    projectId,
    projectName: project.name,
    businessName: project.client.businessName,
    industry: project.client.industry,
    audience: project.client.audience,
    geography: project.client.geography,
    goals: project.client.goals,
    offers: project.client.offers,
    budget: project.client.budget,
    constraints: project.client.constraints,
    website: project.client.website,
    notes: project.client.notes,
    primaryCta: project.client.primaryCta,
    funnel: project.client.funnel,
    channels,
    requestText,
    integrations: [],
    metrics: [],
    approvals: [],
    mode: "GENERATE",
    handoff: [],
    priorAssets: [],
  });
  const plan = buildPlan(ctx.videoRequested);
  const workflow = await prisma.workflow.create({
    data: {
      projectId,
      requestText,
      status: "QUEUED",
      outcome: "",
      mode: "GENERATE",
      cursor: 0,
      planJson: JSON.stringify(plan),
    },
  });
  await prisma.job.create({
    data: {
      workflowId: workflow.id,
      agentKey: "orchestrator",
      status: "QUEUED",
      sequence: 0,
      mode: "GENERATE",
    },
  });
  await audit({
    projectId,
    workflowId: workflow.id,
    actor: "human",
    action: "WORKFLOW_QUEUED",
    detail: requestText,
  });
  startWorker();
  return workflow;
}
