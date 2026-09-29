import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { ProductMark } from "@/components/ui";
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
      <div className="rounded-xl border border-line bg-panel p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <ProductMark />
          Agency OS
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-sm leading-6 text-ink-soft">After you sign in, you land on your brands.</p>
        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}
