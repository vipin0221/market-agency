"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

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
  operatorEmail,
  children,
}: {
  projectId: string;
  projectName: string;
  businessName: string;
  projects: { id: string; name: string }[];
  operatorEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const navProps = {
    projectId,
    projectName,
    businessName,
    projects,
    operatorEmail,
    pathname,
    advancedOpen,
    setAdvancedOpen,
    onNavigate: () => setDrawer(false),
  };

  return (
    <div className="flex min-h-dvh w-full bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto bg-ink text-paper lg:flex">
        <Sidebar {...navProps} />
      </aside>
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <aside
            id="app-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-[min(18rem,88vw)] flex-col overflow-y-auto bg-ink text-paper shadow-2xl"
          >
            <div className="flex justify-end px-3 pt-3">
              <button type="button" onClick={() => setDrawer(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-paper/80 hover:bg-white/10">
                Close
              </button>
            </div>
            <Sidebar {...navProps} />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-expanded={drawer}
            aria-controls="app-drawer"
            onClick={() => setDrawer(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold"
          >
            <MenuIcon />
            Menu
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{projectName}</p>
            {businessName && businessName !== projectName ? <p className="truncate text-xs text-ink-soft">{businessName}</p> : null}
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full min-w-0 max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  projectId,
  projectName,
  businessName,
  projects,
  operatorEmail,
  pathname,
  advancedOpen,
  setAdvancedOpen,
  onNavigate,
}: {
  projectId: string;
  projectName: string;
  businessName: string;
  projects: { id: string; name: string }[];
  operatorEmail: string;
  pathname: string;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
  onNavigate: () => void;
}) {
  const base = `/projects/${projectId}`;
  const onAdvanced = advanced.some(([, href]) => {
    const path = `${base}${href}`;
    return pathname === path || pathname.startsWith(`${path}/`);
  });

  useEffect(() => {
    if (onAdvanced) setAdvancedOpen(true);
  }, [onAdvanced, setAdvancedOpen]);

  return (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/" onClick={onNavigate} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/60">
          Agency OS
        </Link>
        <p className="mt-2 break-words font-serif text-2xl leading-tight">{projectName}</p>
        {businessName && businessName !== projectName ? <p className="mt-1 break-words text-sm text-paper/70">{businessName}</p> : null}
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {primary.map(([label, href]) => (
          <NavLink key={label} href={`${base}${href}`} pathname={pathname} exact={href === ""} onNavigate={onNavigate}>
            {label}
          </NavLink>
        ))}
        <details
          className="mt-4 border-t border-white/10 pt-3"
          open={advancedOpen}
          onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
        >
          <summary className="cursor-pointer rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/55">
            Advanced
          </summary>
          <p className="px-3 pb-2 text-[11px] leading-4 text-paper/45">Operator tools. The routes stay available.</p>
          <div className="grid gap-0.5">
            {advanced.map(([label, href]) => (
              <NavLink key={label} href={`${base}${href}`} pathname={pathname} onNavigate={onNavigate}>
                {label}
              </NavLink>
            ))}
          </div>
        </details>
      </nav>
      <div className="border-t border-white/10 px-3 py-3">
        {projects.length > 1 ? <p className="px-2 text-[11px] uppercase tracking-wide text-paper/50">Brands</p> : null}
        {projects.length > 1
          ? projects.map((item) => (
              <Link
                key={item.id}
                href={`/projects/${item.id}`}
                onClick={onNavigate}
                className={`block truncate rounded-lg px-2 py-1.5 text-sm hover:bg-white/10 ${item.id === projectId ? "bg-white/10" : "text-paper/80"}`}
              >
                {item.name}
              </Link>
            ))
          : null}
        {projects.length > 1 ? (
          <Link href="/" onClick={onNavigate} className="mt-1 block rounded-lg px-2 py-1.5 text-sm text-paper/70 hover:bg-white/10">
            All brands
          </Link>
        ) : null}
        <Link href="/new" onClick={onNavigate} className="mt-1 block rounded-lg border border-white/15 px-3 py-2 text-center text-sm hover:bg-white/10">
          New brand
        </Link>
        <p className="mt-3 truncate px-2 text-[11px] text-paper/50">{operatorEmail}</p>
        <div className="mt-1 flex items-center gap-3 px-2 pb-1">
          <Link href="/account" onClick={onNavigate} className="text-sm text-paper/80 hover:text-paper">
            Account
          </Link>
          <SignOutButton className="text-sm text-paper/80 hover:text-paper" />
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  pathname,
  exact,
  onNavigate,
  children,
}: {
  href: string;
  pathname: string;
  exact?: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm ${active ? "bg-paper font-semibold text-ink" : "text-paper/80 hover:bg-white/10"}`}
    >
      {children}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
