const tones: Record<string, string> = {
  IDLE: "bg-stone-200/80 text-stone-700",
  SKIPPED: "bg-stone-200/80 text-stone-600",
  QUEUED: "bg-stone-200/80 text-stone-800",
  RUNNING: "bg-sky-100 text-sky-950",
  WAITING: "bg-amber-100 text-amber-950",
  COMPLETED: "bg-emerald-100 text-emerald-950",
  BLOCKED: "bg-rose-100 text-rose-950",
  FAILED: "bg-red-200 text-red-950",
  AWAITING_APPROVAL: "bg-amber-200 text-amber-950",
  CONFLICT: "bg-rose-200 text-rose-950",
  HOLD: "bg-amber-100 text-amber-950",
  APPROVED: "bg-emerald-200 text-emerald-950",
  READY_FOR_HUMAN_REVIEW: "bg-amber-100 text-amber-950",
  NOT_CONNECTED: "bg-rose-50 text-rose-950 ring-1 ring-rose-200",
  CONNECTED: "bg-emerald-100 text-emerald-950",
  NOT_ACTIVATED: "bg-stone-200 text-stone-800",
  ACTIVATION_BLOCKED: "bg-rose-100 text-rose-950",
  REVISION_REQUESTED: "bg-amber-100 text-amber-950",
  GENERATED_WITHOUT_LLM: "bg-amber-50 text-amber-950 ring-1 ring-amber-300",
  LLM: "bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200",
  NOT_GENERATED: "bg-stone-100 text-stone-700",
  PENDING: "bg-amber-100 text-amber-950",
  PLANNED: "bg-stone-200 text-stone-800",
  DRAFT: "bg-stone-100 text-stone-700",
};

export function StatusPill({ value }: { value: string }) {
  const tone = tones[value] ?? "bg-stone-100 text-stone-800";
  const label = value.replaceAll("_", " ");
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tone}`}>
      {label}
    </span>
  );
}
