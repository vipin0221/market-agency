import Link from "next/link";
import type { ProjectState } from "@/lib/state";

const fields: { key: keyof NonNullable<ProjectState["client"]>; label: string; example: string }[] = [
  { key: "audience", label: "Audience", example: "People who stop in before work" },
  { key: "offers", label: "Offer", example: "Autumn latte and a pastry" },
  { key: "goals", label: "Goal", example: "Get nearby clients to visit this month" },
  { key: "primaryCta", label: "Call to action", example: "Order ahead" },
  { key: "geography", label: "Geography", example: "Austin, in store" },
  { key: "industry", label: "Industry", example: "Coffee shop" },
  { key: "website", label: "Website", example: "https://example.com" },
];

export function BriefChecklist({ projectId, client }: { projectId: string; client: NonNullable<ProjectState["client"]> }) {
  const missing = fields.filter((field) => !String(client[field.key] ?? "").trim());
  if (missing.length === 0) return null;
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-serif text-2xl">Complete the brief</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        Blank fields stay unknown. Drafts will not invent them. Fill the highest items first.
      </p>
      <ol className="mt-4 grid gap-3">
        {missing.map((field, index) => (
          <li key={field.key} className="min-w-0 rounded-xl bg-paper px-3 py-3">
            <p className="text-sm font-semibold">
              {index + 1}. {field.label}
            </p>
            <p className="mt-1 text-sm text-ink-soft">Example: {field.example}</p>
          </li>
        ))}
      </ol>
      <Link href={`/projects/${projectId}/journey#brand`} className="mt-4 inline-flex text-sm font-semibold text-accent">
        Edit the brief
      </Link>
    </section>
  );
}
