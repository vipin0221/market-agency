"use client";

import { use } from "react";
import Link from "next/link";
import { DecisionPanel } from "@/components/decision-panel";
import { OperatorNotice } from "@/components/operator-notice";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { StatusPill } from "@/components/status-pill";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function ApprovalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading approvals…" />;

  const pending = state.approvals.find((item) => item.status === "PENDING");
  const reviewAssets = pending
    ? state.contentAssets.filter((asset) => asset.workflowId === pending.workflowId && asset.status === "READY_FOR_HUMAN_REVIEW")
    : [];

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>
        Decision log. The working decision is on{" "}
        <Link href={`/projects/${id}/review`} className="font-semibold text-accent">
          Review
        </Link>
        . Leaving this page does not approve anything.
      </OperatorNotice>
      <PageHeader kicker="Approval log" title="Human decisions" lede="Approve, request a revision, or hold. Silence is not approval, and nothing is posted." />
      {pending ? (
        <>
          <DecisionPanel approvalId={pending.id} onDone={() => void reload()} />
          <div className="grid gap-4">
            {reviewAssets.map((asset) => (
              <PostCard key={asset.id} asset={asset} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="Nothing is waiting">
          No approval is pending. Next: open Review when drafts are ready. Silence is not approval.
        </EmptyState>
      )}
      <section>
        <h2 className="font-serif text-2xl">Decision log</h2>
        <ul className="mt-3 grid gap-2">
          {state.approvals.length === 0 ? <li className="text-sm text-ink-soft">No decisions recorded.</li> : null}
          {state.approvals.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
              <StatusPill value={item.status} />
              <p className="mt-2">{item.note || "No note."}</p>
              <p className="mt-1 text-xs text-ink-soft">{item.decidedAt ? new Date(item.decidedAt).toLocaleString() : "Undecided"}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
