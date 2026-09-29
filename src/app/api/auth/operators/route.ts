import { hashPassword, normalizeEmail, requireApiOperator } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string; name?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";
  const name = (body?.name ?? "").trim().slice(0, 80);
  if (!email) {
    return Response.json({ error: "BLOCKED", message: "Enter an email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 200) {
    return Response.json({ error: "BLOCKED", message: "Use a password of 8 to 200 characters." }, { status: 400 });
  }
  const existing = await prisma.operator.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "CONFLICT", message: "An Operator with that email already exists." }, { status: 409 });
  }
  const created = await prisma.operator.create({
    data: {
      email,
      name: name || "Operator",
      passwordHash: await hashPassword(password),
      mustChangePassword: false,
    },
  });
  return Response.json({ ok: true, id: created.id, email: created.email }, { status: 201 });
}
