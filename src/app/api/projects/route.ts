import { detectChannels } from "@/lib/planning";
import { clientFields, createProject } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = clientFields.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "BLOCKED", message: parsed.error.issues[0]?.message || "Check the project fields." },
      { status: 400 },
    );
  }
  if (!parsed.data.request) {
    return Response.json(
      { error: "BLOCKED", message: "A marketing request is required before the work can start." },
      { status: 400 },
    );
  }
  if (detectChannels(parsed.data.channels, "").channels.length === 0) {
    return Response.json(
      { error: "BLOCKED", message: "At least one channel is required before the work can start." },
      { status: 400 },
    );
  }
  const created = await createProject(parsed.data);
  return Response.json(created, { status: 201 });
}
