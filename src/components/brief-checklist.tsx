import Link from "next/link";
import { Section, secondaryButtonClass } from "@/components/ui";
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
    <Section
      title="Complete the brief"
      lede="Blank fields stay unknown. Drafts will not invent them."
      action={
        <Link href={`/projects/${projectId}/journey#brand`} className={secondaryButtonClass}>
          Edit the brief
        </Link>
      }
      padded={false}
    >
      <ol>
        {missing.map((field, index) => (
          <li key={field.key} className="grid gap-1 border-t border-line px-5 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline first:border-t-0">
            <p className="text-sm font-medium">
              {index + 1}. {field.label}
            </p>
            <p className="text-sm text-ink-soft">Example: {field.example}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
