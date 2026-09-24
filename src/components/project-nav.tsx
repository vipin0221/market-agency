"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primary = [
  ["Overview", ""],
  ["Journey", "/journey"],
  ["Content", "/content"],
  ["Review", "/review"],
  ["Calendar", "/calendar"],
  ["Campaigns", "/campaigns"],
  ["Reports", "/reports"],
  ["Connect", "/connect"],
] as const;

const advanced = [
  ["AI workspace", "/workspace"],
  ["Agents", "/agents"],
  ["Outputs", "/outputs"],
  ["Audit", "/audit"],
  ["Approval log", "/approvals"],
  ["Integration records", "/integrations"],
] as const;

export function ProjectNav({
  projectId,
  projectName,
  businessName,
  projects,
}: {
  projectId: string;
  projectName: string;
  businessName: string;
  projects: { id: string; name: string }[];
}) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  const advancedHrefs = advanced.map(([, href]) => `${base}${href}`);
  const onAdvanced = advancedHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
  const [open, setOpen] = useState(onAdvanced);

  useEffect(() => {
    if (onAdvanced) setOpen(true);
  }, [onAdvanced]);

  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:bg-ink md:text-paper">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/" className="text-xs uppercase tracking-[0.16em] text-paper/70">
            Agency OS
          </Link>
          <p className="mt-2 font-serif text-2xl leading-tight">{projectName}</p>
          {businessName && businessName !== projectName ? <p className="mt-1 text-sm text-paper/70">{businessName}</p> : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {primary.map(([label, href]) => (
            <NavLink key={label} href={`${base}${href}`} pathname={pathname} exact={href === ""}>
              {label}
            </NavLink>
          ))}
          <details
            className="mt-4 border-t border-white/10 pt-3"
            open={open}
            onToggle={(event) => setOpen(event.currentTarget.open)}
          >
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-paper/55">Advanced</summary>
            <p className="px-3 pb-2 text-[11px] leading-4 text-paper/45">Operator tools. The routes stay available.</p>
            <div className="grid gap-1">
              {advanced.map(([label, href]) => (
                <NavLink key={label} href={`${base}${href}`} pathname={pathname}>
                  {label}
                </NavLink>
              ))}
            </div>
          </details>
        </nav>
        <div className="border-t border-white/10 px-3 py-3">
          <p className="px-2 text-[11px] uppercase tracking-wide text-paper/50">Brands</p>
          {projects.length > 1
            ? projects.map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.id}`}
                  className={`block truncate rounded-md px-2 py-1.5 text-sm hover:bg-white/10 ${item.id === projectId ? "bg-white/10" : "text-paper/80"}`}
                >
                  {item.name}
                </Link>
              ))
            : null}
          {projects.length > 1 ? (
            <Link href="/" className="mt-1 block rounded-md px-2 py-1.5 text-sm text-paper/70 hover:bg-white/10">
              All brands
            </Link>
          ) : null}
          <Link href="/new" className="mt-1 block rounded-md border border-white/15 px-3 py-2 text-center text-sm hover:bg-white/10">
            New brand
          </Link>
        </div>
      </aside>
      <div className="sticky top-0 z-20 border-b border-white/10 bg-ink text-paper md:hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <Link href="/" className="text-xs uppercase tracking-[0.16em] text-paper/70">
            Agency OS
          </Link>
          <p className="truncate text-sm">{projectName}</p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2">
          {primary.map(([label, href]) => (
            <NavLink key={label} href={`${base}${href}`} pathname={pathname} exact={href === ""} compact>
              {label}
            </NavLink>
          ))}
        </div>
        <details className="border-t border-white/10 px-3 py-2" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
          <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-paper/60">Advanced</summary>
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
            {advanced.map(([label, href]) => (
              <NavLink key={label} href={`${base}${href}`} pathname={pathname} compact>
                {label}
              </NavLink>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}

function NavLink({
  href,
  pathname,
  exact,
  compact,
  children,
}: {
  href: string;
  pathname: string;
  exact?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        compact
          ? `shrink-0 rounded-md px-2 py-1 text-sm ${active ? "bg-white/15 font-semibold" : "text-paper/80"}`
          : `rounded-md px-3 py-2 text-sm ${active ? "bg-white/15 font-semibold" : "text-paper/80 hover:bg-white/10"}`
      }
    >
      {children}
    </Link>
  );
}
