import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { name?: string; value?: string; note?: string; campaignId?: string } | null;
  const name = body?.name?.trim() ?? "";
  const value = body?.value?.trim() ?? "";
  if (!name || !value) {
    return Response.json(
      { error: "BLOCKED", message: "An observed metric needs both a name and a value. Empty results are not stored as zero." },
      { status: 400 },
    );
  }
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return Response.json({ error: "NOT_FOUND", message: "Project was not found." }, { status: 404 });
  const metric = await prisma.metric.create({
    data: {
      projectId: id,
      campaignId: body?.campaignId || null,
      name,
      value,
      note: body?.note?.trim() ?? "",
      source: "OBSERVED",
    },
  });
  await audit({
    projectId: id,
    actor: "human",
    action: "METRIC_RECORDED",
    detail: `${name}: ${value}`,
  });
  return Response.json({ id: metric.id }, { status: 201 });
}
