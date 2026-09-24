import Link from "next/link";
import { HumanStatusPill } from "@/components/human-status";
import type { JourneyStage } from "@/lib/journey";

export function JourneyStrip({ stages, currentId }: { stages: JourneyStage[]; currentId: string }) {
  const done = stages.filter((stage) => stage.status === "done").length;
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl">Journey</h2>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
          {done} of {stages.length} done
        </p>
      </div>
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {stages.map((stage, index) => {
          const current = stage.id === currentId;
          return (
            <li key={stage.id}>
              <Link
                href={stage.href}
                aria-current={current ? "step" : undefined}
                title={stage.summary}
                className={`block w-40 shrink-0 rounded-2xl border px-3 py-3 ${
                  current ? "border-ink bg-ink text-paper" : "border-line bg-panel text-ink hover:border-ink/30"
                }`}
              >
                <span className={`text-[10px] uppercase tracking-[0.14em] ${current ? "text-paper/60" : "text-ink-soft"}`}>
                  {index + 1}
                  {stage.optional && stage.status !== "optional" ? " · Optional" : ""}
                </span>
                <span className="mt-1 block text-sm font-semibold">{stage.label}</span>
                <span className="mt-2 block">
                  <HumanStatusPill status={stage.status} inverse={current} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
