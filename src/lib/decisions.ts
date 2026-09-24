import { audit } from "./audit";
import { prisma } from "./db";
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
