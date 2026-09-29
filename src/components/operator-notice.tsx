export function OperatorNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">
      <span className="font-semibold text-ink">Advanced. </span>
      {children}
    </p>
  );
}
