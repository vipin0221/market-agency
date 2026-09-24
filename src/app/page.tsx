import Link from "next/link";
import { ClientForm } from "@/components/client-form";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { client: true, workflows: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Agency OS · Phase 1</p>
        <h1 className="mt-2 font-serif text-5xl leading-tight text-ink">Open a client desk.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
          Enter the business as it is, then ask for the marketing work in plain language. Specialists run in the background from the database. Empty fields stay unknown. Nothing here is preloaded from another client.
        </p>
        <div className="mt-6 rounded-2xl border border-line bg-panel p-5 shadow-card">
          <ClientForm mode="create" />
        </div>
      </section>
      <section>
        <h2 className="font-serif text-3xl">Projects</h2>
        {projects.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-ink-soft">
            The database is empty. Create a project to start a workflow.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {projects.map((project) => (
              <li key={project.id} className="rounded-xl border border-line bg-panel px-4 py-4 shadow-card">
                <Link href={`/projects/${project.id}`} className="font-serif text-2xl hover:text-accent">
                  {project.name}
                </Link>
                <p className="mt-1 text-sm text-ink-soft">{project.client?.businessName}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-ink-soft">
                  {project.workflows[0] ? project.workflows[0].status.replaceAll("_", " ") : "No request yet"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
