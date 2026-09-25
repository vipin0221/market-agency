"use client";

import { use, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function CampaignsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading campaigns…</p>;

  async function authorize(campaignId: string) {
    setMessage(null);
    setFormError(null);
    const response = await fetch(`/api/campaigns/${campaignId}/authorize`, { method: "POST" });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "Publish was refused.");
    else setMessage(data.message || "Authorized.");
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

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Campaigns</p>
        <h1 className="mt-1 font-serif text-4xl">Optional plans</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Organic posts do not need a campaign. Plans here are not activated. Authorize publish will not go live.
        </p>
      </header>
      {state.campaigns.length === 0 ? <p className="text-sm text-ink-soft">Campaign Architect has not written a campaign for this project.</p> : null}
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
          <button type="button" onClick={() => authorize(campaign.id)} className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white">
            Authorize publish
          </button>
          <p className="mt-2 text-xs text-ink-soft">This stays refused until a real connection exists. It does not publish.</p>
        </article>
      ))}
      {formError ? <p className="text-sm text-rose-800">{formError}</p> : null}
      {message ? <p className="text-sm text-pine">{message}</p> : null}
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
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Metric name" className="rounded-md border border-line px-3 py-2" />
          <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Observed value" className="rounded-md border border-line px-3 py-2" />
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" className="rounded-md border border-line px-3 py-2" />
          <button type="submit" className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-paper sm:col-span-3 sm:w-fit">
            Record observed metric
          </button>
        </form>
        <button type="button" onClick={rerun} className="mt-4 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
          Re-run campaign intelligence
        </button>
      </section>
    </div>
  );
}
