"use client";

import Link from "next/link";
import { use, useState } from "react";
import { HumanStatusPill } from "@/components/human-status";
import { NextStepBar, onThisPage } from "@/components/next-step";
import { PageHeader } from "@/components/page-header";
import { Banner, EmptyState, LoadingLine, fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, nextAction } from "@/lib/journey";

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading reports…" />;

  const stage = buildJourney(state).find((item) => item.id === "reports");
  const action = nextAction(state);
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
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Reports"
        title="Results"
        lede="Only results you record show up here. Nothing is pulled from an ad account, and missing numbers are not filled in."
        aside={stage ? <HumanStatusPill status={stage.status} /> : null}
      />
      <NextStepBar
        action={action}
        projectId={id}
        active={onThisPage(action, id, "reports")}
        onDone={() => void reload()}
        follow={
          <Link href={`/projects/${id}`} className="font-semibold text-accent">
            Brand overview
          </Link>
        }
      />
      {state.metrics.length === 0 ? (
        <EmptyState title="Nothing recorded">
          Next: record a result you actually observed, or skip reports. No numbers are imported, and none are invented.
        </EmptyState>
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
      <form onSubmit={addMetric} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-panel p-5 shadow-card">
        <h2 className="font-serif text-2xl">Record a result</h2>
        <p className="text-sm leading-6 text-ink-soft">Type what you observed. Saving does not sync an account and does not invent a number.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Name</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Value you observed</span>
            <input required value={value} onChange={(event) => setValue(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} className={fieldClass} />
          </label>
        </div>
        <button type="submit" className={`w-fit ${primaryButtonClass}`}>
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
        <button type="button" onClick={() => void refresh()} className={`mt-4 ${secondaryButtonClass}`}>
          Refresh written report
        </button>
      </section>
      {formError ? <Banner tone="error" role="alert">{formError}</Banner> : null}
      {message ? <Banner tone="success" role="status">{message}</Banner> : null}
    </div>
  );
}
