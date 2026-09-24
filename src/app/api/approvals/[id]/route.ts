import { decideApproval } from "@/lib/decisions";
import { startWorker } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { decision?: string; note?: string } | null;
  const decision = body?.decision;
  if (decision !== "APPROVE" && decision !== "REVISION" && decision !== "HOLD") {
    return Response.json({ error: "BLOCKED", message: "Decision must be APPROVE, REVISION, or HOLD." }, { status: 400 });
  }
  const result = await decideApproval(id, decision, body?.note ?? "");
  if (!result.ok) return Response.json({ error: result.error, message: result.message }, { status: result.status });
  startWorker();
  return Response.json({ ok: true, message: result.message });
}
