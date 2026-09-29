import Link from "next/link";
import { HumanStatusPill } from "@/components/human-status";
import { SignOutButton } from "@/components/sign-out-button";
import { AppTopBar, EmptyState, primaryButtonClass } from "@/components/ui";
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

  return (
    <main className="mx-auto min-w-0 max-w-5xl overflow-x-clip px-4 py-8 sm:px-6 sm:py-10">
      <AppTopBar email={session.operator.email}>
        <Link href="/account" className="font-semibold">
          Account
        </Link>
        <SignOutButton className="font-semibold" />
      </AppTopBar>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight">Your brands</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-ink-soft">
            Open a brand to see the next step. Drafts wait for review. Connect stays not connected. Nothing here posts live.
          </p>
        </div>
        <Link href="/new" className={primaryButtonClass}>
          Add a brand
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No brands yet"
            action={
              <Link href="/new" className={primaryButtonClass}>
                Add a brand
              </Link>
            }
          >
            Next: add a brand. You will enter the business name, the marketing request, and at least one channel. Drafts wait for review. Nothing is posted.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const workflow = project.workflows[0];
            const tone = workflowLabel(workflow?.status ?? "", workflow?.outcome ?? "");
            const channels = project.client?.channels.trim() || "No channel on file";
            return (
              <li key={project.id} className="min-w-0">
                <Link href={`/projects/${project.id}`} className="block h-full min-w-0 rounded-xl border border-line bg-panel p-4 shadow-card hover:border-ink/20">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-base font-semibold tracking-tight">{project.name}</h2>
                    <HumanStatusPill status={tone.status} label={tone.label} />
                  </div>
                  {project.client?.businessName && project.client.businessName !== project.name ? (
                    <p className="mt-1 break-words text-sm text-ink-soft">{project.client.businessName}</p>
                  ) : null}
                  <p className="mt-4 break-words text-sm">{channels}</p>
                  <p className="mt-3 text-sm font-medium text-accent">Continue</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
