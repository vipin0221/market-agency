import Link from "next/link";

export const fieldClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/70";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90 disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink/30 disabled:opacity-50";

const bannerTone = {
  error: "border-rose-200 bg-rose-50 text-rose-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  info: "border-line bg-panel text-ink",
} as const;

export function Banner({
  tone,
  children,
  role,
}: {
  tone: keyof typeof bannerTone;
  children: React.ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <p role={role} className={`break-words rounded-xl border px-4 py-3 text-sm leading-6 ${bannerTone[tone]}`}>
      {children}
    </p>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-dashed border-line bg-panel px-5 py-8">
      {title ? <p className="break-words font-serif text-2xl leading-tight">{title}</p> : null}
      <div className={`${title ? "mt-2" : ""} text-sm leading-6 text-ink-soft`}>{children}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingLine({ label }: { label: string }) {
  return <p className="text-sm text-ink-soft">{label}</p>;
}

export function AppTopBar({
  email,
  children,
}: {
  email?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        Agency OS
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {email ? <span className="max-w-[14rem] truncate text-ink-soft">{email}</span> : null}
        {children}
      </div>
    </div>
  );
}
