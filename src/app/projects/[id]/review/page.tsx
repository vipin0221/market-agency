"use client";

import Link from "next/link";
import { use } from "react";
import { DecisionPanel } from "@/components/decision-panel";
import { FailedJobs } from "@/components/failed-jobs";
import { HumanStatusPill } from "@/components/human-status";
import { NextActionButton } from "@/components/next-action-button";
import { PostPreview } from "@/components/post-preview";
import { RequestComposer } from "@/components/request-composer";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, decisionLabel, nextAction, showFollowUpRequest } from "@/lib/journey";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state || !state.client) return <p className="text-sm">Loading review…</p>;

  const pending = state.approvals.find((item) => item.status === "PENDING");
  const reviewAssets = pending
    ? state.contentAssets.filter((asset) => asset.workflowId === pending.workflowId && asset.status === "READY_FOR_HUMAN_REVIEW")
    : state.contentAssets.filter((asset) => asset.workflowId === state.workflow?.id && asset.status !== "REVISION_REQUESTED");
  const businessName = state.client.businessName || state.project.name;
  const waiting = Boolean(pending);
  const reviewStage = buildJourney(state).find((item) => item.id === "review");

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Review</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl">{waiting ? "Your decision" : "Decisions"}</h1>
          {reviewStage ? <HumanStatusPill status={reviewStage.status} /> : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Approve, ask for a revision, or hold. Silence is not approval. Nothing on this page is posted.
        </p>
      </header>
      {waiting ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          These drafts are not approved. Choose approve, revision, or hold. Leaving the page does not decide.
        </p>
      ) : null}
      {state.pipeline.state === "failed" ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
          <FailedJobs jobs={state.jobs} />
          <div className="mt-3">
            <NextActionButton action={nextAction(state)} projectId={id} onDone={() => void reload()} />
          </div>
        </section>
      ) : null}
      <div className={`grid items-start gap-6 ${pending ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : ""}`}>
        <div className="flex flex-wrap gap-5">
          {reviewAssets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-panel px-4 py-8 text-sm leading-6 text-ink-soft">
              {state.pipeline.state === "failed"
                ? "Next: retry the failed step. Review stays closed until a draft exists. Waiting here does not approve anything."
                : state.pipeline.state === "queued" || state.pipeline.state === "running"
                  ? "Next: open Content when a draft appears. Waiting here does not approve anything."
                  : state.approval.status === "APPROVED"
                    ? "You already recorded a decision. Next: open Connect. Accounts stay NOT_CONNECTED."
                    : "Next: Review opens when a draft is ready. Silence is not approval."}
              {state.approval.status === "APPROVED" ? (
                <>
                  {" "}
                  <Link href={`/projects/${id}/connect`} className="font-semibold text-accent">
                    Open Connect
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
          {reviewAssets.map((asset) => (
            <PostPreview key={asset.id} asset={asset} businessName={businessName} website={state.client?.website} />
          ))}
        </div>
        {pending ? (
          <div className="lg:sticky lg:top-6">
            <DecisionPanel
              approvalId={pending.id}
              onDone={() => void reload()}
              title="Your decision"
              lede="Approve, request a revision, or hold. Silence is not approval, and nothing publishes from here."
            />
          </div>
        ) : null}
      </div>
      <section>
        <h2 className="font-serif text-2xl">Decision log</h2>
        <ul className="mt-3 grid gap-2">
          {state.approvals.length === 0 ? <li className="text-sm text-ink-soft">No decision recorded yet.</li> : null}
          {state.approvals.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
              <p className="font-medium">{decisionLabel(item.status)}</p>
              <p className="mt-1">{item.note || "No note."}</p>
              <p className="mt-1 text-xs text-ink-soft">{item.decidedAt ? new Date(item.decidedAt).toLocaleString() : "Undecided"}</p>
            </li>
          ))}
        </ul>
      </section>
      {showFollowUpRequest(state) ? <RequestComposer projectId={id} onDone={() => void reload()} /> : null}
    </div>
  );
}
