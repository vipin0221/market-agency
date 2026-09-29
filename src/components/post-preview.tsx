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
  return (
    <article
      id={`post-${asset.id}`}
      className={`min-w-0 scroll-mt-24 rounded-2xl border bg-panel p-4 shadow-card sm:p-5 ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">{shapeLine(asset)}</p>
        <HumanStatusPill status={status.status} label={status.label} />
      </div>
      <p className="mt-3 text-xs text-ink-soft">{businessName}</p>
      <h3 className="mt-1 break-words font-serif text-2xl leading-snug">{asset.hook || asset.headline || "Untitled draft"}</h3>
      {asset.headline && asset.headline !== asset.hook ? <p className="mt-2 break-words text-sm font-medium">{asset.headline}</p> : null}
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{asset.caption || "No caption was stored."}</p>
      {hashtags.length > 0 ? <p className="mt-3 break-words text-sm text-ink-soft">{hashtags.join(" ")}</p> : null}
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{asset.cta || "No call to action"}</p>
      <p className="mt-3 text-xs leading-5 text-ink-soft">{draftNote(asset.generationMode)}</p>
    </article>
  );
}

function shapeLine(asset: Asset) {
  const kind = asset.format.replaceAll("_", " ");
  const ratio = asset.platform === "Instagram" || asset.platform === "TikTok" || asset.platform === "Pinterest" ? "4:5" : kind;
  return `${asset.platform} · ${ratio} · text draft`;
}

function draftNote(mode: string) {
  if (mode === "LLM") return "Model draft. Not approved, and not published.";
  if (mode === "GENERATED_WITHOUT_LLM") return "Written from the brand fields. No image is attached.";
  return "Text draft only. No image is attached.";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
