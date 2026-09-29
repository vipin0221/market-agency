import { createSession, hashPassword, requireApiOperator, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireApiOperator();
  if (auth instanceof Response) return auth;
  const body = (await request.json().catch(() => null)) as { currentPassword?: string; newPassword?: string } | null;
  const currentPassword = body?.currentPassword ?? "";
  const newPassword = body?.newPassword ?? "";
  if (newPassword.length < 8 || newPassword.length > 200) {
    return Response.json({ error: "BLOCKED", message: "Use a new password of 8 to 200 characters." }, { status: 400 });
  }
  const matches = await verifyPassword(currentPassword, auth.operator.passwordHash);
  if (!matches) {
    return Response.json({ error: "UNAUTHENTICATED", message: "Current password does not match." }, { status: 401 });
  }
  await prisma.operator.update({
    where: { id: auth.operatorId },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
  });
  await prisma.session.deleteMany({ where: { operatorId: auth.operatorId } });
  await createSession(auth.operatorId);
  return Response.json({ ok: true, message: "Password updated on this Operator account." });
}
