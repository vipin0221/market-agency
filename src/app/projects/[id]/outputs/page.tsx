"use client";

import { use } from "react";
import { OperatorNotice } from "@/components/operator-notice";
import { OutputView } from "@/components/output-view";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function OutputsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading outputs…" />;

  const currentId = state.workflow?.id;
  const currentAssets = state.contentAssets.filter((asset) => asset.workflowId === currentId);
  const earlierAssets = state.contentAssets.filter((asset) => asset.workflowId !== currentId);

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Raw packs and stored JSON. Posts for review live under Content.</OperatorNotice>
      <PageHeader
        kicker="Outputs"
        title="Work product"
        lede={`${state.contentAssets.length} content objects and ${state.outputs.length} specialist packs are stored for this project.`}
      />
      <section className="grid min-w-0 gap-4">
        <h2 className="font-serif text-2xl">Latest content</h2>
        {currentAssets.length === 0 ? <EmptyState>No posts yet. They show up here after Content writes a draft.</EmptyState> : null}
        {currentAssets.map((asset) => (
          <PostCard key={asset.id} asset={asset} />
        ))}
      </section>
      {earlierAssets.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="font-serif text-2xl">Earlier workflows</h2>
          {earlierAssets.map((asset) => (
            <PostCard key={asset.id} asset={asset} />
          ))}
        </section>
      ) : null}
      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Video packs</h2>
        {state.creativeAssets.length === 0 ? <p className="text-sm text-ink-soft">No storyboard was required for the latest scope, or it has not been written.</p> : null}
        {state.creativeAssets.map((asset) => (
          <article key={asset.id} className="rounded-xl border border-line bg-panel p-5">
            <h3 className="font-serif text-2xl">{asset.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{asset.kind} · {asset.status} · {asset.generationMode}</p>
            <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6">{JSON.stringify(asset.body, null, 2)}</pre>
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
