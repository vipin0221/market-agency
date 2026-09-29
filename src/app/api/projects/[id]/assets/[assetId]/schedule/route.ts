import { requireApiOperator } from "@/lib/auth";
import { scheduleAsset } from "@/lib/decisions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string; assetId: string }> }) {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  const { id, assetId } = await context.params;
  const body = (await request.json().catch(() => null)) as { at?: string } | null;
  const result = await scheduleAsset(id, assetId, body?.at ?? "");
  if (!result.ok) return Response.json({ error: result.error, message: result.message }, { status: result.status });
  return Response.json({ ok: true, message: result.message });
}
