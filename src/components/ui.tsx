import Link from "next/link";

export const fieldClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/80";

export const primaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-50";

const bannerTone = {
  error: "border-line border-l-rose-600 bg-panel text-ink",
  success: "border-line border-l-emerald-600 bg-panel text-ink",
  warning: "border-line border-l-amber-500 bg-panel text-ink",
  info: "border-line border-l-ink bg-panel text-ink",
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
    <p role={role} className={`break-words rounded-lg border border-l-2 px-4 py-3 text-sm leading-6 ${bannerTone[tone]}`}>
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
    <div className="flex min-w-0 flex-col items-start rounded-xl border border-dashed border-line bg-panel px-6 py-10">
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-paper text-ink-soft">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <rect x="2.5" y="3.5" width="13" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 7.5h8M5 10.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      {title ? <p className="mt-4 break-words text-base font-semibold tracking-tight">{title}</p> : null}
      <div className={`${title ? "mt-1" : "mt-4"} max-w-md text-sm leading-6 text-ink-soft`}>{children}</div>
      {action ? <div className="mt-5">{action}</div> : null}
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
        <ProductMark />
        Agency OS
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
        {email ? <span className="max-w-[14rem] truncate">{email}</span> : null}
        {children}
      </div>
    </div>
  );
}

export function ProductMark({ className = "" }: { className?: string }) {
  return (
    <span className={`grid h-6 w-6 place-items-center rounded-md bg-ink text-[11px] font-semibold text-white ${className}`}>
      A
    </span>
  );
}

export function Section({
  title,
  lede,
  action,
  children,
  padded = true,
}: {
  title?: string;
  lede?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-panel shadow-card">
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title ? <h2 className="text-sm font-semibold tracking-tight">{title}</h2> : null}
            {lede ? <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">{lede}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className={padded ? "px-5 py-4" : ""}>{children}</div>
    </section>
  );
}
