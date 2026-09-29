import { requireApiOperator } from "@/lib/auth";
import { getProjectState } from "@/lib/state";
import { startWorker, tick } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  startWorker();
  void tick();
  const { id } = await context.params;
  const state = await getProjectState(id);
  if (!state) return Response.json({ error: "NOT_FOUND", message: "Project was not found." }, { status: 404 });
  return Response.json(state);
}
