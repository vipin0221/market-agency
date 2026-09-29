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
    <main className="mx-auto flex min-h-dvh min-w-0 max-w-md flex-col justify-center overflow-x-clip px-4 py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Agency OS</p>
      <h1 className="mt-3 break-words font-serif text-4xl leading-tight sm:text-5xl">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        This workspace runs on its own. Grok Bot is not required. After you sign in, you land on your brands.
      </p>
      <div className="mt-6 rounded-2xl border border-line bg-panel px-5 py-5 shadow-card sm:px-6 sm:py-6">
        <LoginForm nextPath={nextPath} />
      </div>
      <p className="mt-4 text-xs leading-5 text-ink-soft">
        The first launch creates one Operator from <span className="font-medium">OPERATOR_EMAIL</span> and{" "}
        <span className="font-medium">OPERATOR_PASSWORD</span>. The documented default is operator@localhost / change-me. Change it under Account after you sign in.
      </p>
    </main>
  );
}
