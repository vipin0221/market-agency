import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in · Agency OS",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session) redirect("/");
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Agency OS</p>
      <h1 className="mt-2 font-serif text-5xl leading-tight">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        This workspace runs on its own. Grok Bot is not required. After you sign in, you land on your brands.
      </p>
      <div className="mt-6 rounded-3xl border border-line bg-panel px-6 py-6 shadow-card">
        <LoginForm nextPath={nextPath} />
      </div>
      <p className="mt-4 text-xs leading-5 text-ink-soft">
        The first launch creates one Operator from <span className="font-medium">OPERATOR_EMAIL</span> and{" "}
        <span className="font-medium">OPERATOR_PASSWORD</span>. The documented default is operator@localhost / change-me. Change it under Account.
      </p>
    </main>
  );
}
