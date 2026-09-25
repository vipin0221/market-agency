"use client";

import { use, useState } from "react";
import { PostPreview } from "@/components/post-preview";
import { useProjectState } from "@/components/use-project-state";

export default function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  const [platform, setPlatform] = useState("All");
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state || !state.client) return <p className="text-sm">Loading posts…</p>;

  const currentId = state.workflow?.id;
  const current = currentId ? state.contentAssets.filter((asset) => asset.workflowId === currentId) : state.contentAssets;
  const earlier = currentId ? state.contentAssets.filter((asset) => asset.workflowId !== currentId) : [];
  const platforms = ["All", ...Array.from(new Set(state.contentAssets.map((asset) => asset.platform)))];
  const match = (item: (typeof current)[number]) => platform === "All" || item.platform === platform;
  const businessName = state.client.businessName || state.project.name;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Content</p>
        <h1 className="mt-1 font-serif text-4xl">Posts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          These are drafts. They are not approved until you say so on Review, and they are not published.
        </p>
      </header>
      {platforms.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {platforms.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              onClick={() => setPlatform(item)}
              className={`rounded-full border px-3 py-1.5 text-sm ${platform === item ? "border-ink bg-ink text-paper" : "border-line bg-panel"}`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <PostGrid assets={current.filter(match)} businessName={businessName} website={state.client.website} empty="No posts in this round yet." />
      {earlier.some(match) ? (
        <section className="grid gap-3">
          <h2 className="font-serif text-2xl">Earlier rounds</h2>
          <PostGrid assets={earlier.filter(match)} businessName={businessName} website={state.client.website} empty="" />
        </section>
      ) : null}
      <Storyboards assets={state.creativeAssets.filter((asset) => !currentId || asset.workflowId === currentId)} />
    </div>
  );
}

function PostGrid({
  assets,
  businessName,
  website,
  empty,
}: {
  assets: Parameters<typeof PostPreview>[0]["asset"][];
  businessName: string;
  website: string;
  empty: string;
}) {
  if (assets.length === 0) return empty ? <p className="text-sm text-ink-soft">{empty}</p> : null;
  return (
    <div className="flex flex-wrap gap-5">
      {assets.map((asset) => (
        <PostPreview key={asset.id} asset={asset} businessName={businessName} website={website} />
      ))}
    </div>
  );
}

function Storyboards({ assets }: { assets: { id: string; title: string; body: Record<string, unknown> }[] }) {
  if (assets.length === 0) return null;
  return (
    <section className="grid gap-3">
      <h2 className="font-serif text-2xl">Video</h2>
      <p className="text-sm text-ink-soft">Storyboard only. This is not a finished video.</p>
      {assets.map((asset) => {
        const shots = Array.isArray(asset.body.shots) ? asset.body.shots : [];
        return (
          <article key={asset.id} className="rounded-2xl border border-line bg-panel p-5">
            <h3 className="font-serif text-2xl">{asset.title}</h3>
            <ol className="mt-3 grid gap-3">
              {shots.map((shot, index) => {
                if (!shot || typeof shot !== "object") return null;
                const frame = shot as Record<string, unknown>;
                return (
                  <li key={index} className="rounded-xl bg-paper px-3 py-3 text-sm leading-6">
                    <p className="text-xs uppercase tracking-wide text-ink-soft">Frame {String(frame.frame ?? index + 1)}</p>
                    <p className="mt-1">{typeof frame.visual === "string" ? frame.visual : ""}</p>
                    {typeof frame.onScreenText === "string" ? <p className="mt-1 text-ink-soft">{frame.onScreenText}</p> : null}
                  </li>
                );
              })}
            </ol>
          </article>
        );
      })}
    </section>
  );
}
