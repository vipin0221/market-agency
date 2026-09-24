import type { ProjectState } from "@/lib/state";

type Output = ProjectState["outputs"][number];

export function DeskBrief({ outputs }: { outputs: Output[] }) {
  const brand = latest(outputs, "brand");
  const strategy = latest(outputs, "strategy");
  const architecture = latest(outputs, "architecture");
  if (!brand && !strategy && !architecture) return null;

  const positioning = prose(brand?.body.positioning);
  const voice = list(brand?.body.voice);
  const objective = prose(strategy?.body.objective);
  const strategyNote = prose(strategy?.body.narrative);
  const message = prose(architecture?.body.message) || prose(architecture?.body.campaignBrief);

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <BriefCard title="Brand" status={brand?.status} text={positioning || brand?.summary || "Brand language has not been written."} extra={voice.join(" · ")} />
      <BriefCard title="Strategy" status={strategy?.status} text={objective || strategyNote || strategy?.summary || "Strategy has not been written."} extra={strategyNote && objective ? strategyNote : ""} />
      <BriefCard title="Architecture" status={architecture?.status} text={message || architecture?.summary || "Architecture has not been written."} />
    </section>
  );
}

function BriefCard({ title, status, text, extra }: { title: string; status?: string; text: string; extra?: string }) {
  return (
    <article className="rounded-xl border border-line bg-panel px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {title}
        {status ? ` · ${status.replaceAll("_", " ")}` : ""}
      </p>
      <p className="mt-2 text-sm leading-6">{text}</p>
      {extra ? <p className="mt-2 text-xs leading-5 text-ink-soft">{extra}</p> : null}
    </article>
  );
}

function latest(outputs: Output[], kind: string) {
  return outputs.find((output) => output.kind === kind && output.status !== "REVISION_REQUESTED");
}

function prose(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value && typeof value.text === "string") return value.text;
  return "";
}

function list(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
