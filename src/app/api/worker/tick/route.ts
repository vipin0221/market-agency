import { startWorker, tick } from "@/lib/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  startWorker();
  const result = await tick();
  return Response.json(result);
}
