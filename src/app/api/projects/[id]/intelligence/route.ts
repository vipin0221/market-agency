import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { queueIntelligence, startWorker } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const workflow = await prisma.workflow.findFirst({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { approvals: true },
  });
  if (!workflow) {
    return Response.json({ error: "BLOCKED", message: "There is no workflow to measure." }, { status: 409 });
  }
  if (["QUEUED", "RUNNING", "AWAITING_APPROVAL"].includes(workflow.status)) {
    return Response.json(
      { error: "CONFLICT", message: "Intelligence waits until the current workflow is idle and content has a recorded approval." },
      { status: 409 },
    );
  }
  const approved = workflow.approvals.some((item) => item.status === "APPROVED");
  if (!approved) {
    return Response.json(
      { error: "BLOCKED", message: "Campaign intelligence will not run before a recorded approval." },
      { status: 409 },
    );
  }
  await queueIntelligence(workflow.id);
  await audit({
    projectId: id,
    workflowId: workflow.id,
    actor: "human",
    action: "INTELLIGENCE_RERUN",
    detail: "Campaign intelligence was queued again from the metrics on file.",
  });
  startWorker();
  return Response.json({ ok: true, workflowId: workflow.id });
}
