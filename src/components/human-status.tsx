import { HUMAN_LABEL, type HumanStatus } from "@/lib/journey";

const tones: Record<HumanStatus, string> = {
  done: "bg-emerald-100 text-emerald-950",
  working: "bg-sky-100 text-sky-950",
  waiting: "bg-amber-100 text-amber-950",
  blocked: "bg-rose-100 text-rose-950",
  later: "bg-stone-200/80 text-stone-700",
  optional: "bg-stone-100 text-stone-700",
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
  const tone = inverse ? "bg-white/15 text-paper" : tones[status];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{label ?? HUMAN_LABEL[status]}</span>;
}
