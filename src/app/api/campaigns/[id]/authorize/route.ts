import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { project: { include: { integrations: true } } },
  });
  if (!campaign) return Response.json({ error: "NOT_FOUND", message: "Campaign was not found." }, { status: 404 });
  const connected = campaign.project.integrations.filter((item) => item.status === "CONNECTED");
  await audit({
    projectId: campaign.projectId,
    workflowId: campaign.workflowId,
    actor: "human",
    action: "PUBLISH_REJECTED",
    detail: `Authorize was requested for ${campaign.name}. Refused. Connected integrations: ${connected.length}. Phase 1 does not publish.`,
  });
  return Response.json(
    {
      error: "BLOCKED",
      message:
        connected.length === 0
          ? "Publish refused. No integration is CONNECTED, and Phase 1 has no publish authorization. The campaign was not activated."
          : "Publish refused. Phase 1 does not send content to external accounts, even if a connection exists.",
    },
    { status: 409 },
  );
}
