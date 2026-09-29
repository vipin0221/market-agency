import Link from "next/link";
import { redirect } from "next/navigation";
import { HumanStatusPill } from "@/components/human-status";
import { PasswordNotice } from "@/components/password-notice";
import { SignOutButton } from "@/components/sign-out-button";
import { requirePageOperator } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { workflowLabel } from "@/lib/journey";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await requirePageOperator();
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { client: true, workflows: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (projects.length === 1) redirect(`/projects/${projects[0].id}`);

  return (
    <main className="mx-auto min-w-0 max-w-5xl overflow-x-clip px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Agency OS</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-ink-soft sm:inline">{session.operator.email}</span>
          <Link href="/account" className="font-semibold">
            Account
          </Link>
          <SignOutButton className="font-semibold" />
        </div>
      </div>
      <div className="mt-4">
        <PasswordNotice mustChange={session.operator.mustChangePassword} />
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="break-words font-serif text-4xl leading-tight sm:text-5xl">Your brands</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
            Home, then a brand, then drafts, then review. Connect stays not connected. Campaigns and reports are optional. Nothing here posts live.
          </p>
        </div>
        <Link href="/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">
          Add a brand
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-panel px-5 py-8 text-sm leading-6 text-ink-soft">
          No brands yet. Next: add a brand. You will enter the business name, the marketing request, and at least one channel. Drafts wait for review. Nothing is posted.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const workflow = project.workflows[0];
            const tone = workflowLabel(workflow?.status ?? "", workflow?.outcome ?? "");
            const channels = project.client?.channels.trim() || "UNKNOWN";
            return (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="block h-full rounded-2xl border border-line bg-panel p-5 shadow-card hover:border-ink/30">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-3xl leading-tight">{project.name}</h2>
                    <HumanStatusPill status={tone.status} label={tone.label} />
                  </div>
                  {project.client?.businessName && project.client.businessName !== project.name ? (
                    <p className="mt-1 text-sm text-ink-soft">{project.client.businessName}</p>
                  ) : null}
                  <p className="mt-4 text-sm">{channels}</p>
                  <p className="mt-3 text-sm font-semibold text-accent">Open · next step</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
