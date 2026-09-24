import { prisma } from "@/lib/db";
import { createWorkflow, startWorker } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { request?: string } | null;
  const text = body?.request?.trim() ?? "";
  if (!text) {
    return Response.json({ error: "BLOCKED", message: "Write the marketing request before starting a workflow." }, { status: 400 });
  }
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return Response.json({ error: "NOT_FOUND", message: "Project was not found." }, { status: 404 });
  const running = await prisma.workflow.findFirst({
    where: { projectId: id, status: { in: ["QUEUED", "RUNNING"] } },
  });
  if (running) {
    return Response.json(
      { error: "CONFLICT", message: "A workflow is already running for this project. Wait until it reaches a decision or a terminal state." },
      { status: 409 },
    );
  }
  const workflow = await createWorkflow(id, text);
  startWorker();
  return Response.json({ workflowId: workflow.id }, { status: 201 });
}
