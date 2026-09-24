"use client";

import { useState } from "react";

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
      <p className="mt-1 text-sm leading-6 text-ink-soft">Describe the next posts in plain language. This does not publish anything.</p>
      <textarea
        required
        value={request}
        onChange={(event) => setRequest(event.target.value)}
        rows={4}
        placeholder="Say what to make, for whom, and on which channels."
        className="mt-4 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <button type="submit" disabled={pending} className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
        {pending ? "Starting…" : "Start"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
    </form>
  );
}
