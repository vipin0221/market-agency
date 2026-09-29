"use client";

import Link from "next/link";
import { use } from "react";
import { DecisionPanel } from "@/components/decision-panel";
import { FailedJobs } from "@/components/failed-jobs";
import { HumanStatusPill } from "@/components/human-status";
import { NextActionButton } from "@/components/next-action-button";
import { NextStepBar, onThisPage } from "@/components/next-step";
import { PageHeader } from "@/components/page-header";
import { PostPreview } from "@/components/post-preview";
import { RequestComposer } from "@/components/request-composer";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, decisionLabel, nextAction, showFollowUpRequest } from "@/lib/journey";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state || !state.client) return <LoadingLine label="Loading review…" />;

  const pending = state.approvals.find((item) => item.status === "PENDING");
  const reviewAssets = pending
    ? state.contentAssets.filter((asset) => asset.workflowId === pending.workflowId && asset.status === "READY_FOR_HUMAN_REVIEW")
    : state.contentAssets.filter((asset) => asset.workflowId === state.workflow?.id && asset.status !== "REVISION_REQUESTED");
  const businessName = state.client.businessName || state.project.name;
  const waiting = Boolean(pending);
  const reviewStage = buildJourney(state).find((item) => item.id === "review");
  const action = nextAction(state);

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Review"
        title={waiting ? "Your decision" : "Decisions"}
        lede="Approve, ask for a revision, or hold. Silence is not approval. Nothing on this page is posted."
        aside={reviewStage ? <HumanStatusPill status={reviewStage.status} /> : null}
      />
      {waiting ? (
        <Banner tone="warning">These drafts are not approved. Choose approve, revision, or hold. Leaving the page does not decide.</Banner>
      ) : (
        <NextStepBar action={action} projectId={id} active={onThisPage(action, id, "review")} onDone={() => void reload()} />
      )}
      {state.pipeline.state === "failed" ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
          <FailedJobs jobs={state.jobs} />
          <div className="mt-3">
            <NextActionButton action={action} projectId={id} onDone={() => void reload()} />
          </div>
        </section>
      ) : null}
      <div className={`grid min-w-0 items-start gap-6 ${pending ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
        <div className={`grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 ${pending ? "order-2 lg:order-1 xl:grid-cols-2" : "xl:grid-cols-3"}`}>
          {reviewAssets.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-panel px-4 py-8 text-sm leading-6 text-ink-soft sm:col-span-2">
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
          <div className="order-1 min-w-0 lg:sticky lg:top-6 lg:order-2">
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
