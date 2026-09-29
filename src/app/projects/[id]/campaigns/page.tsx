"use client";

import Link from "next/link";
import { use, useState } from "react";
import { NextStepBar, onThisPage } from "@/components/next-step";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Banner, EmptyState, LoadingLine, fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { nextAction } from "@/lib/journey";

export default function CampaignsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading campaigns…" />;

  async function authorize(campaignId: string) {
    setMessage(null);
    setFormError(null);
    const response = await fetch(`/api/campaigns/${campaignId}/authorize`, { method: "POST" });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "Posting stayed off.");
    else setMessage(data.message || "Posting stayed off.");
    await reload();
  }

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
    if (!response.ok) setFormError(data.message || "Metric was not stored.");
    else {
      setMessage("Observed metric stored. It is not a platform sync.");
      setName("");
      setValue("");
      setNote("");
    }
    await reload();
  }

  async function rerun() {
    setMessage(null);
    setFormError(null);
    const response = await fetch(`/api/projects/${id}/intelligence`, { method: "POST" });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "Intelligence was not queued.");
    else setMessage("Campaign intelligence was queued from the metrics on file.");
    await reload();
  }

  const action = nextAction(state);

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Campaigns"
        title="Optional plans"
        lede="Optional. Organic posts do not need a campaign. Plans here are not activated, and this version does not post them."
      />
      <NextStepBar action={action} projectId={id} active={onThisPage(action, id, "campaigns")} onDone={() => void reload()} />
      {state.campaigns.length === 0 ? (
        <EmptyState
          title="No plan yet"
          action={
            <Link href={`/projects/${id}`} className={secondaryButtonClass}>
              Back to overview
            </Link>
          }
        >
          Next: you can skip campaigns. A plan shows up here only after the journey writes one, and it stays not activated.
        </EmptyState>
      ) : null}
      {state.campaigns.map((campaign) => (
        <article key={campaign.id} className="rounded-xl border border-line bg-panel p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-3xl">{campaign.name}</h2>
            <StatusPill value={campaign.status} />
          </div>
          <p className="mt-2 text-sm">Objective: {campaign.objective || "UNKNOWN"}</p>
          <p className="mt-1 text-sm">Channels: {campaign.channels || "UNKNOWN"}</p>
          <p className="mt-3 text-sm text-ink-soft">
            Content objects on this campaign: {state.contentAssets.filter((asset) => asset.campaignId === campaign.id).length}
          </p>
          <button type="button" onClick={() => authorize(campaign.id)} className={`mt-4 ${secondaryButtonClass}`}>
            Check posting
          </button>
          <p className="mt-2 text-xs leading-5 text-ink-soft">Phase 1 does not post or activate. This check stays refused and does not mark the plan live.</p>
        </article>
      ))}
      {formError ? <Banner tone="error" role="alert">{formError}</Banner> : null}
      {message ? <Banner tone="success" role="status">{message}</Banner> : null}
      <section className="rounded-xl border border-line bg-panel p-5">
        <h2 className="font-serif text-2xl">Observed metrics</h2>
        <p className="mt-1 text-sm text-ink-soft">None are imported. If this list is empty, Campaign Intelligence stays blocked and will not invent a rate.</p>
        <ul className="mt-3 grid gap-2 text-sm">
          {state.metrics.length === 0 ? <li>No observed metrics.</li> : null}
          {state.metrics.map((metric) => (
            <li key={metric.id} className="rounded-md border border-line px-3 py-2">
              <span className="font-medium">{metric.name}</span>: {metric.value}
              <span className="ml-2 text-ink-soft">{metric.source}</span>
              {metric.note ? <span className="mt-1 block text-ink-soft">{metric.note}</span> : null}
            </li>
          ))}
        </ul>
        <form onSubmit={addMetric} className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Metric name</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Observed value</span>
            <input required value={value} onChange={(event) => setValue(event.target.value)} className={fieldClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} className={fieldClass} />
          </label>
          <button type="submit" className={`w-fit sm:col-span-3 ${primaryButtonClass}`}>
            Record observed metric
          </button>
        </form>
        <button type="button" onClick={rerun} className={`mt-4 ${secondaryButtonClass}`}>
          Re-run campaign intelligence
        </button>
      </section>
    </div>
  );
}
