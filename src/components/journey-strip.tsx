import Link from "next/link";
import { HumanStatusPill } from "@/components/human-status";
import type { JourneyStage } from "@/lib/journey";

export function JourneyStrip({ stages, currentId }: { stages: JourneyStage[]; currentId: string }) {
  const done = stages.filter((stage) => stage.status === "done").length;
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl">Journey</h2>
        <p className="shrink-0 text-xs font-medium text-ink-soft">
          {done} of {stages.length}
        </p>
      </div>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => {
          const current = stage.id === currentId;
          return (
            <li key={stage.id} className="min-w-0">
              <Link
                href={stage.href}
                aria-current={current ? "step" : undefined}
                title={stage.summary}
                className={`flex h-full min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 sm:min-h-[7.25rem] sm:flex-col sm:items-stretch sm:justify-between sm:py-4 ${
                  current ? "border-ink bg-ink text-paper" : "border-line bg-panel text-ink hover:border-ink/30"
                }`}
              >
                <span className="min-w-0">
                  <span className={`block text-[11px] font-semibold uppercase tracking-[0.12em] ${current ? "text-paper/60" : "text-ink-soft"}`}>
                    {index + 1}
                    {current && stage.status !== "done" ? " · Next" : ""}
                    {stage.optional && stage.status !== "optional" ? " · Optional" : ""}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{stage.label}</span>
                </span>
                <span className="shrink-0 sm:mt-4">
                  <HumanStatusPill status={stage.status} inverse={current} label={stage.statusLabel} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
