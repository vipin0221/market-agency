import { audit } from "./audit";
import { prisma } from "./db";
import { parseJson } from "./types";
import { queueRevision, resumeAfterApproval } from "./worker";

export async function decideApproval(approvalId: string, decision: "APPROVE" | "REVISION" | "HOLD", note: string) {
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) return { ok: false as const, status: 404, error: "NOT_FOUND", message: "Approval record was not found." };
  if (approval.status !== "PENDING") {
    return {
      ok: false as const,
      status: 409,
      error: "CONFLICT",
      message: "This approval is no longer pending. Silence was not treated as a decision.",
    };
  }
  if (decision === "REVISION" && !note.trim()) {
    return { ok: false as const, status: 400, error: "BLOCKED", message: "A revision needs a written note." };
  }

  if (decision === "APPROVE") {
    await prisma.approval.update({
      where: { id: approval.id },
      data: { status: "APPROVED", note: note.trim(), decidedAt: new Date() },
    });
    await prisma.output.updateMany({
      where: { workflowId: approval.workflowId, status: "READY_FOR_HUMAN_REVIEW" },
      data: { status: "APPROVED" },
    });
    await prisma.contentAsset.updateMany({
      where: { workflowId: approval.workflowId, status: "READY_FOR_HUMAN_REVIEW" },
      data: { status: "APPROVED" },
    });
    await prisma.creativeAsset.updateMany({
      where: { workflowId: approval.workflowId, status: "READY_FOR_HUMAN_REVIEW" },
      data: { status: "APPROVED" },
    });
    await prisma.workflow.update({
      where: { id: approval.workflowId },
      data: { status: "RUNNING", outcome: "", blockerSummary: "Approval recorded. Activation has not started." },
    });
    await audit({
      projectId: approval.projectId,
      workflowId: approval.workflowId,
      actor: "human",
      action: "APPROVED",
      detail: note.trim() || "Content approved. Campaign was not activated and nothing was published.",
    });
    await resumeAfterApproval(approval.workflowId);
    return { ok: true as const, status: 200, message: "Approved. Downstream readiness will run. Publishing stays blocked." };
  }

  if (decision === "HOLD") {
    await prisma.approval.update({
      where: { id: approval.id },
      data: { status: "HOLD", note: note.trim(), decidedAt: new Date() },
    });
    await prisma.workflow.update({
      where: { id: approval.workflowId },
      data: { status: "HOLD", outcome: "HOLD", blockerSummary: "Held by a recorded decision. Downstream agents were not started." },
    });
    await audit({
      projectId: approval.projectId,
      workflowId: approval.workflowId,
      actor: "human",
      action: "HOLD",
      detail: note.trim() || "Work held. No approval was inferred.",
    });
    return { ok: true as const, status: 200, message: "Held. Nothing downstream was started." };
  }

  await prisma.approval.update({
    where: { id: approval.id },
    data: { status: "REVISION_REQUESTED", note: note.trim(), decidedAt: new Date() },
  });
  await audit({
    projectId: approval.projectId,
    workflowId: approval.workflowId,
    actor: "human",
    action: "REVISION_REQUESTED",
    detail: note.trim(),
  });
  await queueRevision(approval.workflowId, note.trim());
  return { ok: true as const, status: 200, message: "Revision queued. Content Studio will patch. Upstream agents will not rebuild." };
}

export async function decideAsset(
  projectId: string,
  assetId: string,
  decision: "APPROVE" | "REVISION" | "HOLD",
  note: string,
) {
  if (decision === "REVISION" && !note.trim()) {
    return { ok: false as const, status: 400, error: "BLOCKED", message: "A revision needs a written note for this draft." };
  }
  const asset = await prisma.contentAsset.findFirst({ where: { id: assetId, projectId } });
  if (!asset) return { ok: false as const, status: 404, error: "NOT_FOUND", message: "That draft was not found." };
  const approval = await prisma.approval.findFirst({
    where: { workflowId: asset.workflowId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (!approval) {
    return {
      ok: false as const,
      status: 409,
      error: "CONFLICT",
      message: "This round is not waiting for a decision. Silence was not treated as approval.",
    };
  }
  if (asset.status !== "READY_FOR_HUMAN_REVIEW") {
    return {
      ok: false as const,
      status: 409,
      error: "CONFLICT",
      message: "This draft already has a decision. Pick a draft that is still waiting.",
    };
  }

  const status = decision === "APPROVE" ? "APPROVED" : decision === "HOLD" ? "HOLD" : "REVISION_REQUESTED";
  const body = parseJson<Record<string, unknown>>(asset.bodyJson, {});
  body.decision = status;
  body.decisionNote = note.trim();
  body.decidedAt = new Date().toISOString();
  await prisma.contentAsset.update({
    where: { id: asset.id },
    data: { status, bodyJson: JSON.stringify(body) },
  });
  await audit({
    projectId,
    workflowId: asset.workflowId,
    actor: "human",
    action: status,
    detail: `${asset.platform}: ${asset.hook}. ${note.trim() || "No note."} This decision is for this draft only.`,
  });

  const siblings = await prisma.contentAsset.findMany({ where: { workflowId: asset.workflowId } });
  const waiting = siblings.filter((item) => item.status === "READY_FOR_HUMAN_REVIEW");
  if (waiting.length > 0) {
    return {
      ok: true as const,
      status: 200,
      message: `Recorded for “${asset.hook}” only. ${waiting.length} draft${waiting.length === 1 ? "" : "s"} still waiting. Silence on the others is not approval.`,
    };
  }

  const gate = approval.createdAt.getTime();
  const decided = siblings.filter((item) => {
    if (item.id === asset.id) return true;
    const parsed = parseJson<Record<string, unknown>>(item.bodyJson, {});
    const decidedAt = typeof parsed.decidedAt === "string" ? Date.parse(parsed.decidedAt) : Number.NaN;
    return Number.isFinite(decidedAt) && decidedAt >= gate;
  }).map((item) => (item.id === asset.id ? { ...item, status } : item));
  const notes = decided
    .map((item) => {
      const parsed = item.id === asset.id ? body : parseJson<Record<string, unknown>>(item.bodyJson, {});
      const text = typeof parsed.decisionNote === "string" ? parsed.decisionNote : "";
      return text ? `${item.platform}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");

  if (decided.some((item) => item.status === "REVISION_REQUESTED")) {
    await prisma.approval.update({
      where: { id: approval.id },
      data: { status: "REVISION_REQUESTED", note: notes || note.trim(), decidedAt: new Date() },
    });
    await queueRevision(asset.workflowId, notes || note.trim());
    return { ok: true as const, status: 200, message: "Every draft has a decision. A revision was asked, so that step will run again. Nothing is posted." };
  }
  if (decided.some((item) => item.status === "HOLD")) {
    await prisma.approval.update({
      where: { id: approval.id },
      data: { status: "HOLD", note: notes || note.trim(), decidedAt: new Date() },
    });
    await prisma.workflow.update({
      where: { id: asset.workflowId },
      data: { status: "HOLD", outcome: "HOLD", blockerSummary: "Held by a recorded decision on a draft. Downstream agents were not started." },
    });
    return { ok: true as const, status: 200, message: "Every draft has a decision. This round is on hold. Nothing was posted." };
  }

  await prisma.approval.update({
    where: { id: approval.id },
    data: { status: "APPROVED", note: notes || note.trim(), decidedAt: new Date() },
  });
  await prisma.workflow.update({
    where: { id: asset.workflowId },
    data: { status: "RUNNING", outcome: "", blockerSummary: "Every draft was approved. Activation has not started." },
  });
  await audit({
    projectId,
    workflowId: asset.workflowId,
    actor: "human",
    action: "APPROVED",
    detail: "Every draft was approved on its own. Nothing was published.",
  });
  await resumeAfterApproval(asset.workflowId);
  return { ok: true as const, status: 200, message: "Every draft is approved. Publishing stays blocked. Next is Connect, and accounts stay NOT_CONNECTED." };
}

export async function scheduleAsset(projectId: string, assetId: string, at: string) {
  const asset = await prisma.contentAsset.findFirst({ where: { id: assetId, projectId } });
  if (!asset) return { ok: false as const, status: 404, error: "NOT_FOUND", message: "That draft was not found." };
  const when = new Date(at);
  if (Number.isNaN(when.getTime())) {
    return { ok: false as const, status: 400, error: "BLOCKED", message: "Enter a date and a time. This only stores the time." };
  }
  const body = parseJson<Record<string, unknown>>(asset.bodyJson, {});
  body.scheduledAt = when.toISOString();
  await prisma.contentAsset.update({
    where: { id: asset.id },
    data: { bodyJson: JSON.stringify(body) },
  });
  await audit({
    projectId,
    workflowId: asset.workflowId,
    actor: "human",
    action: "SCHEDULED",
    detail: `${asset.platform}: ${asset.hook} stored for ${when.toISOString()}. Nothing was published.`,
  });
  return { ok: true as const, status: 200, message: "Publish time stored. Nothing was posted." };
}
