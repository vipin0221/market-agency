export function OperatorNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-line bg-white px-3 py-2 text-xs leading-5 text-ink-soft">
      <span className="font-semibold text-ink">Operator. </span>
      {children}
    </p>
  );
}
