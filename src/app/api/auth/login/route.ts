import {
  clearLoginFailures,
  createSession,
  ensureDefaultOperator,
  hashPassword,
  loginThrottle,
  normalizeEmail,
  recordLoginFailure,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let dummyHash: Promise<string> | null = null;

export async function POST(request: Request) {
  await ensureDefaultOperator();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";
  if (!email || !password) {
    return Response.json({ error: "BLOCKED", message: "Enter the operator email and password." }, { status: 400 });
  }
  const throttle = loginThrottle(email);
  if (throttle.blocked) {
    return Response.json(
      { error: "BLOCKED", message: `Too many attempts. Wait ${throttle.retryIn} seconds and try again.` },
      { status: 429 },
    );
  }
  const operator = await prisma.operator.findUnique({ where: { email } });
  const valid = await verifyPassword(password, operator?.passwordHash ?? (await placeholderHash()));
  if (!operator || !valid) {
    recordLoginFailure(email);
    return Response.json({ error: "UNAUTHENTICATED", message: "Email or password does not match." }, { status: 401 });
  }
  clearLoginFailures(email);
  await createSession(operator.id);
  return Response.json({ ok: true, email: operator.email });
}

function placeholderHash() {
  dummyHash ??= hashPassword("not-a-real-password");
  return dummyHash;
}
