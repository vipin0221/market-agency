"use client";

import { useState } from "react";
import { Banner, fieldClass, secondaryButtonClass } from "@/components/ui";

export function DecisionPanel({
  approvalId,
  onDone,
  title = "Record a decision",
  lede = "Silence is not approval. Nothing publishes from this control.",
}: {
  approvalId: string;
  onDone: () => void;
  title?: string;
  lede?: string;
}) {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  async function send(decision: "APPROVE" | "REVISION" | "HOLD") {
    setPending(true);
    setMessage(null);
    setError(null);
    setNext(null);
    const response = await fetch(`/api/approvals/${approvalId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, note }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setError(data.message || "The decision was not recorded.");
    else {
      setMessage(data.message || "Recorded.");
      setNext(
        decision === "APPROVE"
          ? "Next: open Connect. Accounts stay NOT_CONNECTED, and nothing is posted."
          : decision === "REVISION"
            ? "Next: revised drafts come back to Review. Waiting does not approve them."
            : "Next: this round stays on hold until you approve, revise, or start another request.",
      );
      setNote("");
      onDone();
    }
    setPending(false);
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-card">
      <h3 className="font-serif text-2xl">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-ink-soft">{lede}</p>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium">Note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Required for a revision. Optional for approve or hold."
          className={fieldClass}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => send("APPROVE")} className="inline-flex items-center justify-center rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-white hover:bg-pine/90 disabled:opacity-50">
          Approve
        </button>
        <button type="button" disabled={pending} onClick={() => send("REVISION")} className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          Request revision
        </button>
        <button type="button" disabled={pending} onClick={() => send("HOLD")} className={secondaryButtonClass}>
          Hold
        </button>
      </div>
      {message ? (
        <div className="mt-4">
          <Banner tone="success" role="status">
            {message}
            {next ? ` ${next}` : ""}
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
