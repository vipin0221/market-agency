"use client";

import { use } from "react";
import { OutputView } from "@/components/output-view";
import { PostCard } from "@/components/post-card";
import { useProjectState } from "@/components/use-project-state";

export default function OutputsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading outputs…</p>;

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Output center</p>
        <h1 className="mt-1 font-serif text-4xl">Work product</h1>
        <p className="mt-2 text-sm text-ink-soft">{state.contentAssets.length} content objects and {state.outputs.length} specialist packs are stored for this project.</p>
      </header>
      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Content objects</h2>
        {state.contentAssets.length === 0 ? <p className="text-sm text-ink-soft">No posts yet.</p> : null}
        {state.contentAssets.map((asset) => (
          <PostCard key={asset.id} asset={asset} />
        ))}
      </section>
      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Video packs</h2>
        {state.creativeAssets.length === 0 ? <p className="text-sm text-ink-soft">No storyboard was required for the latest scope, or it has not been written.</p> : null}
        {state.creativeAssets.map((asset) => (
          <article key={asset.id} className="rounded-xl border border-line bg-panel p-5">
            <h3 className="font-serif text-2xl">{asset.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{asset.kind} · {asset.status} · {asset.generationMode}</p>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm leading-6">{JSON.stringify(asset.body, null, 2)}</pre>
          </article>
        ))}
      </section>
      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Specialist packs</h2>
        {state.outputs.length === 0 ? <p className="text-sm text-ink-soft">No packs yet.</p> : null}
        {state.outputs.map((output) => (
          <OutputView key={output.id} output={output} />
        ))}
      </section>
    </div>
  );
}
