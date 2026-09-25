"use client";

import { use, useState } from "react";
import { HumanStatusPill } from "@/components/human-status";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney } from "@/lib/journey";

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Loading reports…</p>;

  const stage = buildJourney(state).find((item) => item.id === "reports");
  const insights = state.outputs.find((output) => output.kind === "insights" && output.workflowId === state.workflow?.id);
  const optimization = state.outputs.find((output) => output.kind === "optimization" && output.workflowId === state.workflow?.id);
  const insufficient = insights?.body.insufficient === true;

  async function addMetric(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setFormError(null);
    const response = await fetch(`/api/projects/${id}/metrics`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, value, note, campaignId: state?.campaigns[0]?.id }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "That result was not saved.");
    else {
      setMessage("Saved. This is a result you recorded, not a live account sync.");
      setName("");
      setValue("");
      setNote("");
    }
    await reload();
  }

  async function refresh() {
    setMessage(null);
    setFormError(null);
    const response = await fetch(`/api/projects/${id}/intelligence`, { method: "POST" });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "The written report was not refreshed.");
    else setMessage("Refreshing the written report from the results on file.");
    await reload();
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Reports</p>
          {stage ? <HumanStatusPill status={stage.status} /> : null}
        </div>
        <h1 className="mt-1 font-serif text-4xl">Results</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Only results you record show up here. Nothing is pulled from an ad account, and missing numbers are not filled in.
        </p>
      </header>
      {state.metrics.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-panel px-4 py-6 text-sm text-ink-soft">No results yet.</p>
      ) : (
        <ul className="grid gap-2">
          {state.metrics.map((metric) => (
            <li key={metric.id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
              <p className="font-medium">
                {metric.name}: {metric.value}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Recorded {new Date(metric.observedAt).toLocaleString()}
                {metric.note ? ` · ${metric.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addMetric} className="grid gap-3 rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-serif text-2xl">Record a result</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="rounded-md border border-line bg-white px-3 py-2 text-sm" />
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Value you observed" className="rounded-md border border-line bg-white px-3 py-2 text-sm" />
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" className="rounded-md border border-line bg-white px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-fit rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper">
          Save result
        </button>
      </form>
      <section className="rounded-2xl border border-line bg-panel p-5">
        <h2 className="font-serif text-2xl">Written report</h2>
        {insufficient || !insights ? (
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            {state.metrics.length === 0
              ? "There is nothing to summarize yet."
              : "Results are on file. Refresh the written report if it still says there was nothing to read."}
          </p>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{insights.summary}</p>
        )}
        {optimization && optimization.status !== "BLOCKED" ? <p className="mt-3 text-sm leading-6">{optimization.summary}</p> : null}
        <button type="button" onClick={() => void refresh()} className="mt-4 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
          Refresh written report
        </button>
      </section>
      {formError ? <p className="text-sm text-rose-800">{formError}</p> : null}
      {message ? <p className="text-sm text-pine">{message}</p> : null}
    </div>
  );
}
