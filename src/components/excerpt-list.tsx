import type { Excerpt } from "@/lib/journey";

export function ExcerptList({ items }: { items: Excerpt[] }) {
  if (items.length === 0) return null;
  return (
    <dl className="mt-4 grid gap-3">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm leading-6">{item.text}</dd>
        </div>
      ))}
    </dl>
  );
}
