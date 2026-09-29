import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export const SESSION_COOKIE = "agency_session";
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE = 14 * 24 * 60 * 60;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || email.length > 200) return null;
  return email;
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) return "/";
  return value;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptKey(password, salt);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const derived = await scryptKey(password, salt);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

export async function ensureDefaultOperator() {
  const existing = await prisma.operator.count();
  if (existing > 0) return;
  const email = normalizeEmail(process.env.OPERATOR_EMAIL || "operator@localhost");
  const password = process.env.OPERATOR_PASSWORD || "change-me";
  if (!email || password.length < 8 || password.length > 200) {
    console.error("Operator seed skipped. Set OPERATOR_EMAIL and an OPERATOR_PASSWORD of 8–200 characters.");
    return;
  }
  try {
    await prisma.operator.create({
      data: {
        email,
        name: "Operator",
        passwordHash: await hashPassword(password),
        mustChangePassword: password === "change-me",
      },
    });
  } catch (error) {
    const again = await prisma.operator.count();
    if (again === 0) throw error;
  }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { operator: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return session;
}

export async function requirePageOperator() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireApiOperator() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "UNAUTHENTICATED", message: "Sign in to continue." }, { status: 401 });
  }
  return session;
}

export async function createSession(operatorId: string) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      operatorId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_MS),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export function loginThrottle(email: string) {
  const now = Date.now();
  const current = loginAttempts.get(email);
  if (!current || current.resetAt <= now) return { blocked: false, retryIn: 0 };
  if (current.count < 8) return { blocked: false, retryIn: 0 };
  return { blocked: true, retryIn: Math.ceil((current.resetAt - now) / 1000) };
}

export function recordLoginFailure(email: string) {
  const now = Date.now();
  const current = loginAttempts.get(email);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  current.count += 1;
}

export function clearLoginFailures(email: string) {
  loginAttempts.delete(email);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function scryptKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}
