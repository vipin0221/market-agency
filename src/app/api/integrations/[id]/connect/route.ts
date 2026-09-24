import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const integration = await prisma.integration.findUnique({ where: { id } });
  if (!integration) return Response.json({ error: "NOT_FOUND", message: "Integration was not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  if (body && typeof body === "object" && "token" in body) {
    await audit({
      projectId: integration.projectId,
      actor: "human",
      action: "CONNECT_REJECTED",
      detail: `${integration.label}: a credential was submitted and discarded. Phase 1 does not store provider secrets.`,
    });
  } else {
    await audit({
      projectId: integration.projectId,
      actor: "human",
      action: "CONNECT_REJECTED",
      detail: `${integration.label}: connect was requested. OAuth is not available. Status remains NOT_CONNECTED.`,
    });
  }
  return Response.json(
    {
      error: "BLOCKED",
      status: "NOT_CONNECTED",
      message: `${integration.label} stays NOT_CONNECTED. OAuth and publishing are Phase 2. No account was marked connected.`,
    },
    { status: 409 },
  );
}
