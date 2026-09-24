import { StatusPill } from "./status-pill";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

const platformTone: Record<string, string> = {
  Instagram: "bg-[#7a3140] text-white",
  Facebook: "bg-[#1e3a5f] text-white",
  LinkedIn: "bg-[#16324f] text-white",
  Email: "bg-pine text-white",
  TikTok: "bg-ink text-paper",
  YouTube: "bg-[#7f1d1d] text-white",
  X: "bg-ink text-paper",
  Threads: "bg-[#3f3a33] text-white",
  Pinterest: "bg-[#7f1d1d] text-white",
  "Google Ads": "bg-[#3f4f2f] text-white",
  Website: "bg-[#3f3a33] text-white",
};

export function PostCard({ asset }: { asset: Asset }) {
  const subject = text(asset.body.subject);
  const preheader = text(asset.body.preheader);
  const creativeDirection = text(asset.body.creativeDirection);
  const hashtags = Array.isArray(asset.body.hashtags) ? asset.body.hashtags.filter((item) => typeof item === "string") : [];
  const model = text(asset.body.llmModel);
  const tone = platformTone[asset.platform] ?? "bg-ink text-paper";

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide ${tone}`}>{asset.platform}</span>
          <span className="text-xs text-ink-soft">{asset.format.replaceAll("_", " ")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill value={asset.status} />
          <StatusPill value={asset.generationMode} />
        </div>
      </header>
      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            {asset.angle} · {asset.funnelStage}
          </p>
          {subject ? <p className="mt-3 text-sm font-medium">Subject · {subject}</p> : null}
          {preheader ? <p className="mt-1 text-sm text-ink-soft">Preheader · {preheader}</p> : null}
          <h3 className="mt-3 font-serif text-[1.65rem] leading-snug text-ink">{asset.hook}</h3>
          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-[15px] leading-7 text-ink">{asset.caption}</p>
          {hashtags.length > 0 ? <p className="mt-3 text-sm text-ink-soft">{hashtags.join(" ")}</p> : null}
          <p className="mt-5 inline-flex max-w-full items-baseline gap-2 rounded-md bg-paper px-3 py-2 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">CTA</span>
            <span className="font-medium">{asset.cta}</span>
            <span className="text-ink-soft">{asset.ctaSource.replaceAll("_", " ")}</span>
          </p>
        </div>
        <aside className="rounded-lg bg-paper px-4 py-3 text-sm leading-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Creative direction</p>
          <p className="mt-2 whitespace-pre-wrap">{creativeDirection || "No art direction was stored on this object."}</p>
          <p className="mt-4 text-xs leading-5 text-ink-soft">{asset.claimsNote}</p>
          {model ? <p className="mt-2 text-xs text-ink-soft">Model · {model}</p> : null}
          {asset.generationMode === "GENERATED_WITHOUT_LLM" ? (
            <p className="mt-2 text-xs text-ink-soft">Written from the project fields. No model was called.</p>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}
