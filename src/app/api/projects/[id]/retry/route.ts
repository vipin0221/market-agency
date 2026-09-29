import { requireApiOperator } from "@/lib/auth";
import { retryFailedJob, startWorker } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  const { id } = await context.params;
  const result = await retryFailedJob(id, auth.operator.email);
  if (!result.ok) return Response.json({ error: "BLOCKED", message: result.message }, { status: 409 });
  startWorker();
  return Response.json({ ok: true, message: result.message });
}
