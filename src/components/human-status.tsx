import { HUMAN_LABEL, type HumanStatus } from "@/lib/journey";

const tones: Record<HumanStatus, string> = {
  done: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  working: "bg-sky-50 text-sky-800 ring-sky-200",
  waiting: "bg-amber-50 text-amber-800 ring-amber-200",
  blocked: "bg-rose-50 text-rose-800 ring-rose-200",
  later: "bg-paper text-ink-soft ring-line",
  optional: "bg-paper text-ink-soft ring-line",
};

export function HumanStatusPill({
  status,
  inverse = false,
  label,
}: {
  status: HumanStatus;
  inverse?: boolean;
  label?: string;
}) {
  const tone = inverse ? "bg-white/15 text-inherit ring-white/20" : tones[status];
  return (
    <span className={`inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset ${tone}`}>
      {label ?? HUMAN_LABEL[status]}
    </span>
  );
}
