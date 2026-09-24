import { StatusPill } from "./status-pill";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

export function PostCard({ asset }: { asset: Asset }) {
  const subject = typeof asset.body.subject === "string" ? asset.body.subject : "";
  const preheader = typeof asset.body.preheader === "string" ? asset.body.preheader : "";
  return (
    <article className="rounded-xl border border-line bg-panel p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-xl text-ink">{asset.platform}</h3>
        <StatusPill value={asset.status} />
        <StatusPill value={asset.generationMode} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft">Angle</dt>
          <dd>{asset.angle}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft">Funnel stage</dt>
          <dd>{asset.funnelStage}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft">Channel source</dt>
          <dd>{asset.channelSource.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft">Format</dt>
          <dd>{asset.format.replaceAll("_", " ")}</dd>
        </div>
      </dl>
      {subject ? (
        <p className="mt-4 text-sm">
          <span className="font-semibold">Subject. </span>
          {subject}
        </p>
      ) : null}
      {preheader ? <p className="mt-1 text-sm text-ink-soft">Preheader. {preheader}</p> : null}
      <p className="mt-4 font-serif text-2xl leading-snug text-ink">{asset.hook}</p>
      {asset.headline && asset.headline !== asset.hook ? (
        <p className="mt-2 text-sm font-medium">{asset.headline}</p>
      ) : null}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">{asset.caption}</p>
      <p className="mt-4 border-t border-line pt-3 text-sm">
        <span className="font-semibold">CTA. </span>
        {asset.cta}
        <span className="ml-2 text-ink-soft">({asset.ctaSource.replaceAll("_", " ")})</span>
      </p>
      <p className="mt-2 text-xs leading-5 text-ink-soft">{asset.claimsNote}</p>
    </article>
  );
}
