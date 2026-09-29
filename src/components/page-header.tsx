export function PageHeader({
  kicker,
  title,
  lede,
  aside,
}: {
  kicker: string;
  title: string;
  lede?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{kicker}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="min-w-0 break-words font-serif text-3xl leading-tight tracking-tight text-balance sm:text-4xl">{title}</h1>
        {aside}
      </div>
      {lede ? <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{lede}</p> : null}
    </header>
  );
}
