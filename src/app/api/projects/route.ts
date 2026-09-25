import { detectChannels } from "@/lib/planning";
import { clientFields, createProject } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = clientFields.safeParse(withProjectName(json));
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

function withProjectName(json: unknown) {
  if (!json || typeof json !== "object" || Array.isArray(json)) return json;
  const record = { ...(json as Record<string, unknown>) };
  const projectName = typeof record.projectName === "string" ? record.projectName.trim() : "";
  const businessName = typeof record.businessName === "string" ? record.businessName.trim() : "";
  if (!projectName && businessName) record.projectName = businessName;
  return record;
}
