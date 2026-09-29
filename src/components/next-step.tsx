import { HumanStatusPill } from "@/components/human-status";
import { NextActionButton } from "@/components/next-action-button";
import type { NextAction } from "@/lib/journey";

export function NextStepBar({
  action,
  projectId,
  active,
  onDone,
  follow,
}: {
  action: NextAction;
  projectId: string;
  active: boolean;
  onDone?: () => void;
  follow?: React.ReactNode;
}) {
  const showButton = !active || action.kind === "retry" || action.kind === "nudge";
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-panel px-4 py-4 shadow-card sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{active ? "This step" : "Next"}</p>
        <HumanStatusPill status={action.status} />
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <h2 className="break-words font-serif text-2xl leading-tight">{action.title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{action.detail}</p>
          {follow ? <div className="mt-3 text-sm leading-6">{follow}</div> : null}
        </div>
        {showButton ? <NextActionButton action={action} projectId={projectId} onDone={onDone} /> : null}
      </div>
    </section>
  );
}

export function onThisPage(action: NextAction, projectId: string, page: string) {
  const href = action.href;
  if (href.startsWith("#")) return page === "overview";
  const path = page ? `/projects/${projectId}/${page}` : `/projects/${projectId}`;
  return href === path || href.startsWith(`${path}#`) || href.startsWith(`${path}?`);
}
