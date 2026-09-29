import Link from "next/link";
import { HumanStatusPill } from "@/components/human-status";
import type { JourneyStage } from "@/lib/journey";

export function JourneyStrip({ stages, currentId }: { stages: JourneyStage[]; currentId: string }) {
  return (
    <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {stages.map((stage, index) => {
        const current = stage.id === currentId;
        return (
          <li key={stage.id} className="min-w-0">
            <Link
              href={stage.href}
              aria-current={current ? "step" : undefined}
              title={stage.summary}
              className={`flex h-full min-h-[4.5rem] flex-col justify-between gap-3 rounded-lg border px-3 py-3 ${
                current ? "border-ink bg-panel" : "border-line bg-panel hover:border-ink/20"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-medium text-ink-soft">
                  {index + 1}
                  {current && stage.status !== "done" ? " · Next" : ""}
                </span>
                <span className="mt-1 block text-sm font-medium">{stage.label}</span>
              </span>
              <HumanStatusPill status={stage.status} label={stage.statusLabel} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
