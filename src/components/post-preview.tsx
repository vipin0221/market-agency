import { HumanStatusPill } from "@/components/human-status";
import { assetStatus } from "@/lib/journey";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

export function PostPreview({
  asset,
  businessName,
  selected = false,
}: {
  asset: Asset;
  businessName: string;
  website?: string;
  projectId?: string;
  selected?: boolean;
}) {
  const status = assetStatus(asset.status);
  const hashtags = stringList(asset.body.hashtags);
  const cta = displayCta(asset.cta);
  return (
    <article
      id={`post-${asset.id}`}
      className={`flex min-w-0 scroll-mt-24 flex-col rounded-xl border bg-panel p-4 shadow-card ${selected ? "border-ink ring-1 ring-ink" : "border-line"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-soft">{shapeLine(asset)}</p>
        <HumanStatusPill status={status.status} label={status.label} />
      </div>
      <p className="mt-4 text-xs text-ink-soft">{businessName}</p>
      <h3 className="mt-1 break-words text-base font-semibold leading-snug tracking-tight">{asset.hook || asset.headline || "Untitled draft"}</h3>
      {asset.headline && asset.headline !== asset.hook ? <p className="mt-2 break-words text-sm font-medium">{asset.headline}</p> : null}
      <p className="mt-3 flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{asset.caption || "No caption was stored."}</p>
      {hashtags.length > 0 ? <p className="mt-3 break-words text-sm text-ink-soft">{hashtags.join(" ")}</p> : null}
      <div className="mt-4 border-t border-line pt-3">
        <p className={`text-xs font-medium ${cta.missing ? "text-ink-soft" : "text-ink"}`}>{cta.text}</p>
        <p className="mt-1 text-xs leading-5 text-ink-soft">{draftNote(asset.generationMode)}</p>
      </div>
    </article>
  );
}

function displayCta(value: string) {
  const text = value.trim();
  if (!text || text.toUpperCase() === "UNKNOWN") return { text: "Call to action not on file", missing: true };
  return { text, missing: false };
}

function shapeLine(asset: Asset) {
  const kind = asset.format.replaceAll("_", " ");
  const ratio = asset.platform === "Instagram" || asset.platform === "TikTok" || asset.platform === "Pinterest" ? "4:5" : kind;
  return `${asset.platform} · ${ratio} · text`;
}

function draftNote(mode: string) {
  if (mode === "LLM") return "Model draft. Not approved, and not published.";
  if (mode === "GENERATED_WITHOUT_LLM") return "Written from the brand fields. No image attached.";
  return "Text draft. No image attached.";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
