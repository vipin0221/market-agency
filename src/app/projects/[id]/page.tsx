"use client";

import Link from "next/link";
import { use } from "react";
import { FailedJobs } from "@/components/failed-jobs";
import { HumanStatusPill } from "@/components/human-status";
import { JourneyStrip } from "@/components/journey-strip";
import { NextActionButton } from "@/components/next-action-button";
import { PostPreview } from "@/components/post-preview";
import { RequestComposer } from "@/components/request-composer";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, currentPosts, focusStage, nextAction, showFollowUpRequest } from "@/lib/journey";

export default function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state || !state.client) return <p className="text-sm">Loading this brand…</p>;

  const action = nextAction(state);
  const stages = buildJourney(state);
  const posts = currentPosts(state).slice(0, 4);
  const frame =
    action.status === "blocked" ? "border-rose-200" : action.status === "waiting" ? "border-amber-200" : "border-line";

  return (
    <div className="mx-auto grid max-w-6xl gap-8">
      <section className={`rounded-3xl border bg-panel px-6 py-7 shadow-card ${frame}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Next</p>
          <HumanStatusPill status={action.status} />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Pipeline · {state.pipeline.label}
            {state.pipeline.agentName ? ` · ${state.pipeline.agentName}` : ""}
          </p>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">{state.client.businessName}</p>
        <h1 className="mt-1 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">{action.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{action.detail}</p>
        {state.workflow?.requestText ? <p className="mt-4 max-w-2xl line-clamp-3 text-sm leading-6">“{state.workflow.requestText}”</p> : null}
        <FailedJobs jobs={state.jobs} />
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <NextActionButton action={action} projectId={id} onDone={() => void reload()} />
          {posts.length > 0 && !action.href.endsWith("/content") ? (
            <Link href={`/projects/${id}/content`} className="text-sm font-semibold text-accent">
              Preview posts
            </Link>
          ) : null}
          {action.href.endsWith("/review") ? null : state.approval.status === "AWAITING_APPROVAL" ? (
            <Link href={`/projects/${id}/review`} className="text-sm font-semibold text-accent">
              Review drafts
            </Link>
          ) : null}
        </div>
      </section>
      <JourneyStrip stages={stages} currentId={focusStage(stages)} />
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">Latest posts</h2>
          <Link href={`/projects/${id}/content`} className="text-sm font-semibold text-accent">
            All posts
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-panel px-4 py-8 text-sm leading-6 text-ink-soft">
            {state.pipeline.state === "failed"
              ? "Next: retry the failed step above. This list stays empty until a draft is actually written."
              : state.pipeline.state === "queued" || state.pipeline.state === "running"
                ? "Next: wait here. Drafts show up when the content step finishes. Waiting does not approve them."
                : "Next: write a request below if this brand does not have one yet. Nothing is posted from it."}
          </p>
        ) : (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {posts.map((asset) => (
              <PostPreview key={asset.id} asset={asset} businessName={state.client?.businessName || state.project.name} website={state.client?.website} />
            ))}
          </div>
        )}
      </section>
      {showFollowUpRequest(state) ? <RequestComposer projectId={id} onDone={() => void reload()} /> : null}
      <details className="rounded-2xl border border-line bg-panel p-4">
        <summary className="cursor-pointer text-sm font-medium">Operator counts</summary>
        <p className="mt-2 text-xs leading-5 text-ink-soft">The journey above is the working view. These counts are the stored rows.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              ["Workflows", state.counts.workflows],
              ["Outputs", state.counts.outputs],
              ["Content objects", state.counts.contentAssets],
              ["Pending approvals", state.counts.pendingApprovals],
              ["Connected integrations", `${state.counts.connectedIntegrations} / ${state.counts.integrations}`],
              ["Observed metrics", state.counts.metrics],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
              <dd className="mt-1 font-serif text-2xl">{value}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-6 font-serif text-xl">Earlier requests</h3>
        <ul className="mt-2 grid gap-2">
          {state.workflows.length === 0 ? <li className="text-sm text-ink-soft">No request has been submitted.</li> : null}
          {state.workflows.map((item) => (
            <li key={item.id} className="rounded-xl border border-line px-3 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-ink-soft">
                {item.status.replaceAll("_", " ")} · {new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{item.requestText}</p>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
