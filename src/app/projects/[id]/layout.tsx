import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

const links = [
  ["Dashboard", ""],
  ["AI workspace", "/workspace"],
  ["Agents", "/agents"],
  ["Outputs", "/outputs"],
  ["Approvals", "/approvals"],
  ["Campaigns", "/campaigns"],
  ["Integrations", "/integrations"],
  ["Audit", "/audit"],
];

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

  return (
    <div className="min-h-screen md:pl-64">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:bg-ink md:text-paper">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/" className="text-xs uppercase tracking-[0.16em] text-paper/70">
            Agency OS
          </Link>
          <p className="mt-2 font-serif text-2xl leading-tight">{project.name}</p>
          <p className="mt-1 text-sm text-paper/70">{project.client?.businessName}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {links.map(([label, href]) => (
            <Link key={label} href={`/projects/${id}${href}`} className="rounded-md px-3 py-2 text-sm hover:bg-white/10">
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs leading-5 text-paper/60">
          Phase 1 does not publish. Integrations stay not connected until a real OAuth flow exists.
        </div>
        <div className="border-t border-white/10 px-3 py-3">
          <p className="px-2 text-[11px] uppercase tracking-wide text-paper/50">Desks</p>
          {projects.map((item) => (
            <Link key={item.id} href={`/projects/${item.id}`} className="block truncate rounded-md px-2 py-1.5 text-sm text-paper/80 hover:bg-white/10">
              {item.name}
            </Link>
          ))}
        </div>
      </aside>
      <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-line bg-ink px-3 py-2 text-paper md:hidden">
        {links.map(([label, href]) => (
          <Link key={label} href={`/projects/${id}${href}`} className="shrink-0 rounded-md px-2 py-1 text-sm">
            {label}
          </Link>
        ))}
      </div>
      <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
