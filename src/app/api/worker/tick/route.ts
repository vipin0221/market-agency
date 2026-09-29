import { requireApiOperator } from "@/lib/auth";
import { startWorker, tick } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  startWorker();
  const result = await tick();
  return Response.json(result);
}
