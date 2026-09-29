"use client";

import Link from "next/link";
import { use, useState } from "react";
import { FailedJobs } from "@/components/failed-jobs";
import { HumanStatusPill } from "@/components/human-status";
import { NextActionButton } from "@/components/next-action-button";
import { PageHeader } from "@/components/page-header";
import { PostDecision, PostDecisionLog } from "@/components/post-decision";
import { PostPreview } from "@/components/post-preview";
import { RequestComposer } from "@/components/request-composer";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, nextAction, showFollowUpRequest } from "@/lib/journey";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [picked, setPicked] = useState<string | null>(null);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state || !state.client) return <LoadingLine label="Loading review…" />;

  const pending = state.approvals.find((item) => item.status === "PENDING");
  const roundId = pending?.workflowId ?? state.workflow?.id;
  const drafts = roundId ? state.contentAssets.filter((asset) => asset.workflowId === roundId) : [];
  const undecided = drafts.filter((asset) => asset.status === "READY_FOR_HUMAN_REVIEW");
  const selected = drafts.find((asset) => asset.id === picked) ?? undecided[0] ?? null;
  const businessName = state.client.businessName || state.project.name;
  const waiting = Boolean(pending);
  const reviewStage = buildJourney(state).find((item) => item.id === "review");
  const action = nextAction(state);

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Review"
        title={waiting ? "Your decision" : "Decisions"}
        lede="Each draft has its own decision. Approve, revise, or hold applies only to the draft you select. Silence is not approval, and nothing is posted."
        aside={reviewStage ? <HumanStatusPill status={reviewStage.status} /> : null}
      />
      {waiting ? (
        <Banner tone="warning">
          {undecided.length} draft{undecided.length === 1 ? "" : "s"} still waiting. The decision panel names the selected draft. Leaving the page does not decide.
        </Banner>
      ) : state.approval.status === "APPROVED" ? (
        <Banner tone="success" role="status">
          Every draft has a decision. Next:{" "}
          <Link href={`/projects/${id}/connect`} className="font-semibold underline">
            Connect
          </Link>{" "}
          stays not connected, or set a publish time on{" "}
          <Link href={`/projects/${id}/calendar`} className="font-semibold underline">
            Calendar
          </Link>
          . A stored time is not a post.
        </Banner>
      ) : null}
      {state.pipeline.state === "failed" ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
          <FailedJobs jobs={state.jobs} />
          <div className="mt-3">
            <NextActionButton action={action} projectId={id} onDone={() => void reload()} />
          </div>
        </section>
      ) : null}
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="order-2 grid min-w-0 gap-5 lg:order-1">
          {drafts.length === 0 ? (
            <EmptyState>
              {state.pipeline.state === "failed"
                ? "Next: retry the failed step. Review stays closed until a draft exists."
                : state.pipeline.state === "queued" || state.pipeline.state === "running"
                  ? "Next: drafts show up here when the content step finishes. Waiting does not approve them."
                  : "Next: Review opens when a draft is ready. Silence is not approval."}
            </EmptyState>
          ) : null}
          {drafts.map((asset) => (
            <div key={asset.id} className="grid gap-2">
              <button type="button" onClick={() => setPicked(asset.id)} className="text-left" aria-pressed={selected?.id === asset.id}>
                <PostPreview asset={asset} businessName={businessName} selected={selected?.id === asset.id} />
              </button>
              <PostDecisionLog asset={asset} />
            </div>
          ))}
        </div>
        <div className="order-1 min-w-0 lg:sticky lg:top-6 lg:order-2">
          {selected && selected.status === "READY_FOR_HUMAN_REVIEW" ? (
            <PostDecision key={selected.id} projectId={id} asset={selected} onDone={() => void reload()} />
          ) : selected ? (
            <Banner tone="info">This draft already has a decision. Choose a draft that still says Waiting.</Banner>
          ) : null}
        </div>
      </div>
      {showFollowUpRequest(state) ? <RequestComposer projectId={id} onDone={() => void reload()} /> : null}
    </div>
  );
}
