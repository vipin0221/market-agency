"use client";

import { useState } from "react";
import { Banner, fieldClass } from "@/components/ui";
import { decisionLabel } from "@/lib/journey";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

export function PostDecision({
  projectId,
  asset,
  onDone,
}: {
  projectId: string;
  asset: Asset;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function send(decision: "APPROVE" | "REVISION" | "HOLD") {
    setPending(true);
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/projects/${projectId}/assets/${asset.id}/decision`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setError(data.message || "The decision was not recorded.");
    else {
      setMessage(data.message || "Recorded for this draft.");
      setNote("");
      onDone();
    }
    setPending(false);
  }

  return (
    <div className="rounded-2xl border border-ink bg-panel p-5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">This draft only</p>
      <h3 className="mt-2 break-words font-serif text-2xl leading-tight">{asset.hook || "Untitled draft"}</h3>
      <p className="mt-1 text-sm text-ink-soft">
        {asset.platform}. Approve, revise, or hold applies to this draft. Other drafts stay undecided until you choose them.
      </p>
      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Required to ask for a revision. Optional for approve or hold."
          className={fieldClass}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => void send("APPROVE")} className="inline-flex items-center justify-center rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-white hover:bg-pine/90 disabled:opacity-50">
          Approve this draft
        </button>
        <button type="button" disabled={pending} onClick={() => void send("REVISION")} className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          Revise this draft
        </button>
        <button type="button" disabled={pending} onClick={() => void send("HOLD")} className="inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
          Hold this draft
        </button>
      </div>
      {message ? (
        <div className="mt-4">
          <Banner tone="success" role="status">
            {message}
          </Banner>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Banner tone="error" role="alert">
            {error}
          </Banner>
        </div>
      ) : null}
    </div>
  );
}

export function PostDecisionLog({ asset }: { asset: Asset }) {
  const decision = typeof asset.body.decision === "string" ? asset.body.decision : "";
  const note = typeof asset.body.decisionNote === "string" ? asset.body.decisionNote : "";
  const at = typeof asset.body.decidedAt === "string" ? asset.body.decidedAt : "";
  if (!decision) {
    return <p className="text-xs leading-5 text-ink-soft">No decision on this draft yet. Leaving it alone does not approve it.</p>;
  }
  return (
    <p className="text-xs leading-5 text-ink-soft">
      <span className="font-semibold text-ink">{decisionLabel(decision)}</span>
      {at ? ` · ${new Date(at).toLocaleString()}` : ""}
      {note ? ` · ${note}` : ""}
    </p>
  );
}
