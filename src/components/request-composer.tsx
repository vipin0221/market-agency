"use client";

import { useState } from "react";
import { Banner, fieldClass, primaryButtonClass } from "@/components/ui";

export function RequestComposer({ projectId, onDone }: { projectId: string; onDone?: () => void }) {
  const [request, setRequest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch(`/api/projects/${projectId}/requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setError(data.message || "The request was not started.");
    else {
      setRequest("");
      onDone?.();
    }
    setPending(false);
  }

  return (
    <form id="request" onSubmit={submit} className="scroll-mt-24 rounded-2xl border border-line bg-panel p-5 shadow-card">
      <h2 className="font-serif text-2xl">Another round</h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">Describe the next posts in plain language. This starts drafts only. It does not post anything.</p>
      <textarea
        required
        value={request}
        onChange={(event) => setRequest(event.target.value)}
        rows={4}
        placeholder="Say what to make, for whom, and on which channels."
        className={`mt-4 ${fieldClass}`}
      />
      <button type="submit" disabled={pending} className={`mt-3 ${primaryButtonClass}`}>
        {pending ? "Starting…" : "Start drafts"}
      </button>
      {error ? (
        <div className="mt-3">
          <Banner tone="error" role="alert">
            {error}
          </Banner>
        </div>
      ) : null}
    </form>
  );
}
