import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/project-nav";
import { requirePageOperator } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await requirePageOperator();
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
  return (
    <ProjectNav
      projectId={id}
      projectName={project.name}
      businessName={project.client?.businessName ?? ""}
      projects={projects}
      operatorEmail={session.operator.email}
      mustChangePassword={session.operator.mustChangePassword}
    >
      {children}
    </ProjectNav>
  );
}
