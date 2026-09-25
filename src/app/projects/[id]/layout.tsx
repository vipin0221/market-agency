import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/project-nav";
import { prisma } from "@/lib/db";
import { llmStatus } from "@/lib/llm";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!project) notFound();
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true },
  });
  const llm = llmStatus();

  return (
    <div className="min-h-screen md:pl-64">
      <ProjectNav
        projectId={id}
        projectName={project.name}
        businessName={project.client?.businessName ?? ""}
        projects={projects}
      />
      <div className="px-4 py-6 md:px-8 md:py-8">
        {children}
        <footer className="mx-auto mt-12 max-w-6xl border-t border-line pt-4 text-xs leading-5 text-ink-soft">
          <p>
            {llm.configured
              ? `A model may draft copy (${llm.provider}${llm.model ? ` · ${llm.model}` : ""}). Drafts are not approved, and nothing is published.`
              : "No model key is set. Drafts use only this brand’s fields. Nothing is published."}
          </p>
          <p className="mt-1">Accounts stay not connected until a real sign-in exists. Operator tools are under Advanced.</p>
        </footer>
      </div>
    </div>
  );
}
