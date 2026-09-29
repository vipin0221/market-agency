"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { ProductMark } from "@/components/ui";

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
  mustChangePassword,
  children,
}: {
  projectId: string;
  projectName: string;
  businessName: string;
  projects: { id: string; name: string }[];
  operatorEmail: string;
  mustChangePassword: boolean;
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
    mustChangePassword,
  };

  return (
    <div className="flex min-h-dvh w-full bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-line bg-panel lg:flex">
        <Sidebar {...navProps} />
      </aside>
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <aside
            id="app-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex h-full w-[min(18rem,88vw)] flex-col border-r border-line bg-panel shadow-card"
          >
            <div className="flex justify-end border-b border-line px-3 py-2">
              <button type="button" onClick={() => setDrawer(false)} className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper">
                Close
              </button>
            </div>
            <Sidebar {...navProps} />
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-panel/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-expanded={drawer}
            aria-controls="app-drawer"
            onClick={() => setDrawer(true)}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-panel px-2.5 text-sm font-medium"
          >
            <MenuIcon />
            Menu
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{projectName}</p>
            {businessName && businessName !== projectName ? <p className="truncate text-xs text-ink-soft">{businessName}</p> : null}
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  projectId,
  projectName,
  projects,
  operatorEmail,
  pathname,
  advancedOpen,
  setAdvancedOpen,
  onNavigate,
  mustChangePassword,
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
  mustChangePassword: boolean;
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 border-b border-line px-3 py-3">
        <Link href="/" onClick={onNavigate} className="inline-flex items-center gap-2 px-1 text-sm font-semibold tracking-tight">
          <ProductMark />
          Agency OS
        </Link>
        <BrandSwitcher projectId={projectId} projectName={projectName} projects={projects} onNavigate={onNavigate} />
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {primary.map(([label, href]) => (
          <NavLink key={label} href={`${base}${href}`} pathname={pathname} exact={href === ""} onNavigate={onNavigate}>
            {label}
          </NavLink>
        ))}
        <details className="mt-3 border-t border-line pt-3" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
          <summary className="cursor-pointer list-none rounded-lg px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft [&::-webkit-details-marker]:hidden">
            Advanced
          </summary>
          <div className="mt-1 grid gap-0.5">
            {advanced.map(([label, href]) => (
              <NavLink key={label} href={`${base}${href}`} pathname={pathname} onNavigate={onNavigate}>
                {label}
              </NavLink>
            ))}
          </div>
        </details>
      </nav>
      <div className="shrink-0 space-y-2 border-t border-line px-3 py-3">
        {mustChangePassword ? (
          <Link href="/account" onClick={onNavigate} className="block rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-5 text-amber-900 ring-1 ring-inset ring-amber-200">
            Default password is still in use. Change it in Account.
          </Link>
        ) : null}
        <p className="truncate px-1 text-xs text-ink-soft">{operatorEmail}</p>
        <div className="flex items-center gap-3 px-1">
          <Link href="/account" onClick={onNavigate} className="text-sm text-ink-soft hover:text-ink">
            Account
          </Link>
          <SignOutButton className="text-sm text-ink-soft hover:text-ink" />
        </div>
      </div>
    </div>
  );
}

function BrandSwitcher({
  projectId,
  projectName,
  projects,
  onNavigate,
}: {
  projectId: string;
  projectName: string;
  projects: { id: string; name: string }[];
  onNavigate: () => void;
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line bg-paper px-2 py-1.5 [&::-webkit-details-marker]:hidden">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ink text-[10px] font-semibold text-white">
          {initials(projectName)}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{projectName}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0 text-ink-soft">
          <path d="M3.5 5.25 7 8.75l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </summary>
      <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-line bg-panel p-1 shadow-card">
        {projects.map((item) => (
          <Link
            key={item.id}
            href={`/projects/${item.id}`}
            onClick={onNavigate}
            className={`block truncate rounded-md px-2 py-1.5 text-sm hover:bg-paper ${item.id === projectId ? "bg-paper font-medium" : "text-ink"}`}
          >
            {item.name}
          </Link>
        ))}
        <div className="my-1 border-t border-line" />
        <Link href="/" onClick={onNavigate} className="block rounded-md px-2 py-1.5 text-sm text-ink-soft hover:bg-paper hover:text-ink">
          All brands
        </Link>
        <Link href="/new" onClick={onNavigate} className="block rounded-md px-2 py-1.5 text-sm text-ink-soft hover:bg-paper hover:text-ink">
          New brand
        </Link>
      </div>
    </details>
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
      className={`rounded-lg px-2.5 py-2 text-sm ${active ? "bg-paper font-medium text-ink" : "text-ink-soft hover:bg-paper hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}

function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return letters || "•";
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
