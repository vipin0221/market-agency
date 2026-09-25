import Link from "next/link";
import { HumanStatusPill } from "@/components/human-status";
import { assetStatus } from "@/lib/journey";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

export function PostPreview({
  asset,
  businessName,
  website,
  projectId,
}: {
  asset: Asset;
  businessName: string;
  website?: string;
  projectId?: string;
}) {
  const status = assetStatus(asset.status);
  const href = projectId ? `/projects/${projectId}/content#post-${asset.id}` : undefined;
  const frame = frameFor(asset);

  return (
    <article id={`post-${asset.id}`} className="scroll-mt-24 w-[17.5rem] shrink-0">
      {frame === "email" ? <EmailCard asset={asset} businessName={businessName} /> : null}
      {frame === "search" ? <SearchCard asset={asset} website={website} /> : null}
      {frame === "page" ? <PageCard asset={asset} businessName={businessName} /> : null}
      {frame === "phone" ? <PhoneCard asset={asset} businessName={businessName} /> : null}
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <HumanStatusPill status={status.status} label={status.label} />
        {href ? (
          <Link href={href} className="text-xs font-semibold text-accent">
            Open
          </Link>
        ) : null}
      </div>
      <details className="mt-2 px-1 text-xs leading-5 text-ink-soft">
        <summary className="cursor-pointer">Notes</summary>
        <p className="mt-1">{text(asset.body.creativeDirection) || "No art direction was stored."}</p>
        <p className="mt-1">{asset.claimsNote}</p>
        <p className="mt-1">{draftNote(asset.generationMode)}</p>
      </details>
    </article>
  );
}

function PhoneCard({ asset, businessName }: { asset: Asset; businessName: string }) {
  const hashtags = stringList(asset.body.hashtags);
  return (
    <div className="rounded-[1.7rem] border border-ink/80 bg-ink p-2 shadow-card">
      <div className="overflow-hidden rounded-[1.25rem] bg-panel">
        <header className="flex items-center gap-2 border-b border-line px-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
            {initials(businessName)}
          </span>
          <span>
            <span className="block text-xs font-semibold">{businessName}</span>
            <span className="block text-[10px] uppercase tracking-wide text-ink-soft">{asset.platform}</span>
          </span>
        </header>
        <div className="flex aspect-[4/5] items-end bg-[#2a2420] px-4 py-5">
          <p className="font-serif text-[1.65rem] leading-snug text-paper">{asset.hook}</p>
        </div>
        <div className="max-h-40 space-y-2 overflow-y-auto px-3 py-3 text-sm leading-6">
          <p className="whitespace-pre-wrap">{asset.caption}</p>
          {hashtags.length > 0 ? <p className="text-ink-soft">{hashtags.join(" ")}</p> : null}
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{asset.cta}</p>
        </div>
      </div>
    </div>
  );
}

function EmailCard({ asset, businessName }: { asset: Asset; businessName: string }) {
  const subject = text(asset.body.subject) || asset.headline || asset.hook;
  const preheader = text(asset.body.preheader);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
      <header className="border-b border-line px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Email · {businessName}</p>
        <h3 className="mt-1 font-serif text-xl leading-snug">{subject}</h3>
        {preheader ? <p className="mt-1 text-xs text-ink-soft">{preheader}</p> : null}
      </header>
      <div className="max-h-64 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-6">
        <p className="whitespace-pre-wrap">{asset.caption}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{asset.cta}</p>
      </div>
    </div>
  );
}

function SearchCard({ asset, website }: { asset: Asset; website?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pine">Ad</p>
      <p className="mt-1 text-xs text-ink-soft">{website?.trim() || "Website unknown"}</p>
      <h3 className="mt-1 font-serif text-xl leading-snug text-[#1e3a5f]">{asset.headline || asset.hook}</h3>
      <p className="mt-2 max-h-32 overflow-y-auto text-sm leading-6">{asset.caption}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">{asset.cta}</p>
    </div>
  );
}

function PageCard({ asset, businessName }: { asset: Asset; businessName: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
      <div className="flex items-center gap-1 border-b border-line px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="h-2 w-2 rounded-full bg-line" />
        <span className="ml-2 truncate text-[10px] text-ink-soft">{businessName}</span>
      </div>
      <div className="space-y-2 px-4 py-4">
        <h3 className="font-serif text-2xl leading-snug">{asset.hook}</h3>
        <p className="max-h-36 overflow-y-auto whitespace-pre-wrap text-sm leading-6">{asset.caption}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{asset.cta}</p>
      </div>
    </div>
  );
}

function frameFor(asset: Asset) {
  if (asset.platform === "Email" || asset.format === "email") return "email";
  if (asset.platform === "Google Ads" || asset.format === "search_ad") return "search";
  if (asset.platform === "Website" || asset.format === "landing_section") return "page";
  return "phone";
}

function draftNote(mode: string) {
  if (mode === "LLM") return "Model draft. Not approved, and not published.";
  if (mode === "GENERATED_WITHOUT_LLM") return "Written from the brand fields. No model was called.";
  return "Draft only.";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part.charAt(0).toUpperCase()).join("");
  return letters || "•";
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
