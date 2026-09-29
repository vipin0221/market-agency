export function PageHeader({
  kicker,
  title,
  lede,
  aside,
  actions,
}: {
  kicker: string;
  title: string;
  lede?: string;
  aside?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-soft">{kicker}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="min-w-0 break-words text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
          {aside}
        </div>
        {lede ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-soft">{lede}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
