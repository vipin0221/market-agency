import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { PasswordNotice } from "@/components/password-notice";
import { SignOutButton } from "@/components/sign-out-button";
import { requirePageOperator } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Account · Agency OS",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requirePageOperator();
  const operators = await prisma.operator.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Agency OS
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">
            Brands
          </Link>
          <SignOutButton className="font-semibold" />
        </div>
      </div>
      <h1 className="mt-6 font-serif text-5xl">Account</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">Local operators only. Passwords are stored as a hash. Signing out ends this browser session.</p>
      <div className="mt-4">
        <PasswordNotice mustChange={session.operator.mustChangePassword} />
      </div>
      <ul className="mt-6 grid gap-2">
        {operators.map((operator) => (
          <li key={operator.id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
            <span className="font-medium">{operator.name}</span>
            <span className="mt-1 block text-ink-soft">{operator.email}</span>
          </li>
        ))}
      </ul>
      <AccountPanel email={session.operator.email} />
    </main>
  );
}
