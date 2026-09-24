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
  const created = await createProject(parsed.data);
  return Response.json(created, { status: 201 });
}
