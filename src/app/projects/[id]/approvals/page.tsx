"use client";

import { use } from "react";
import { DecisionPanel } from "@/components/decision-panel";
import { OperatorNotice } from "@/components/operator-notice";
import { PostCard } from "@/components/post-card";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function ApprovalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading approvals…</p>;

  const pending = state.approvals.find((item) => item.status === "PENDING");
  const reviewAssets = pending
    ? state.contentAssets.filter((asset) => asset.workflowId === pending.workflowId && asset.status === "READY_FOR_HUMAN_REVIEW")
    : [];

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <OperatorNotice>Decision log. Review is where you approve, ask for a revision, or hold.</OperatorNotice>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Approval center</p>
        <h1 className="mt-1 font-serif text-4xl">Human decisions</h1>
        <p className="mt-2 text-sm text-ink-soft">Approve, request a revision, or hold. Leaving this page does not approve anything.</p>
      </header>
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
        <p className="rounded-xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-ink-soft">No approval is pending.</p>
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
