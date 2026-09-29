"use client";

import Link from "next/link";
import { use } from "react";
import { BriefChecklist } from "@/components/brief-checklist";
import { FailedJobs } from "@/components/failed-jobs";
import { JobProgress } from "@/components/job-progress";
import { Banner, EmptyState, LoadingLine, Section } from "@/components/ui";
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
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state || !state.client) return <LoadingLine label="Loading this brand…" />;

  const action = nextAction(state);
  const stages = buildJourney(state);
  const posts = currentPosts(state).slice(0, 4);
  const done = stages.filter((stage) => stage.status === "done").length;

  return (
    <div className="grid min-w-0 gap-6">
      <header className="border-b border-line pb-5">
        <p className="text-xs font-medium text-ink-soft">{state.client.businessName}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-soft">Where this brand stands. Nothing on this page is posted.</p>
      </header>
      <Section
        title={action.title}
        lede={action.detail}
        action={
          <>
            <HumanStatusPill status={action.status} />
            <NextActionButton action={action} projectId={id} onDone={() => void reload()} />
          </>
        }
      >
        <p className="text-xs font-medium text-ink-soft">
          Pipeline · {state.pipeline.label}
          {state.pipeline.agentName ? ` · ${state.pipeline.agentName}` : ""}
        </p>
        {state.workflow?.requestText ? <p className="mt-3 max-w-2xl break-words text-sm leading-6">“{state.workflow.requestText}”</p> : null}
        <FailedJobs jobs={state.jobs} />
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {posts.length > 0 ? (
            <Link href={`/projects/${id}/content`} className="font-medium text-accent">
              Preview posts
            </Link>
          ) : null}
          {action.href.endsWith("/review") ? null : state.approval.status === "AWAITING_APPROVAL" ? (
            <Link href={`/projects/${id}/review`} className="font-medium text-accent">
              Review drafts
            </Link>
          ) : null}
        </div>
      </Section>
      <JobProgress jobs={state.jobs} pipeline={state.pipeline} />
      <BriefChecklist projectId={id} client={state.client} />
      <section className="min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Journey</h2>
          <p className="text-xs font-medium text-ink-soft">
            {done} of {stages.length}
          </p>
        </div>
        <JourneyStrip stages={stages} currentId={focusStage(stages)} />
      </section>
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Latest posts</h2>
          <Link href={`/projects/${id}/content`} className="text-sm font-medium text-accent">
            All posts
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="mt-3">
          <EmptyState>
            {state.pipeline.state === "failed"
              ? "Next: retry the failed step above. This list stays empty until a draft is actually written."
              : state.pipeline.state === "queued" || state.pipeline.state === "running"
                ? "Next: wait here. Drafts show up when the content step finishes. Waiting does not approve them."
                : "Next: write a request below if this brand does not have one yet. Nothing is posted from it."}
          </EmptyState>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
