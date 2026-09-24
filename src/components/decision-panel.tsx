"use client";

import { useState } from "react";

export function DecisionPanel({ approvalId, onDone }: { approvalId: string; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function send(decision: "APPROVE" | "REVISION" | "HOLD") {
    setPending(true);
    setMessage(null);
    setError(null);
    const response = await fetch(`/api/approvals/${approvalId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setError(data.message || "The decision was not recorded.");
    else {
      setMessage(data.message || "Recorded.");
      setNote("");
      onDone();
    }
    setPending(false);
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-card">
      <h3 className="font-serif text-2xl">Record a decision</h3>
      <p className="mt-1 text-sm text-ink-soft">Silence is not approval. Nothing publishes from this control.</p>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Required for a revision. Optional for approve or hold."
          className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => send("APPROVE")} className="rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Approve
        </button>
        <button type="button" disabled={pending} onClick={() => send("REVISION")} className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Request revision
        </button>
        <button type="button" disabled={pending} onClick={() => send("HOLD")} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50">
          Hold
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-pine">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-800">{error}</p> : null}
    </div>
  );
}
