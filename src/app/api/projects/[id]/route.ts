import { clientFields, updateClient } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = clientFields.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "BLOCKED", message: parsed.error.issues[0]?.message || "Check the project fields." },
      { status: 400 },
    );
  }
  const updated = await updateClient(id, parsed.data);
  if (!updated) return Response.json({ error: "NOT_FOUND", message: "Project was not found." }, { status: 404 });
  return Response.json({ ok: true });
}
