"use client";

import { use } from "react";
import { ClientForm } from "@/components/client-form";
import { OutcomeBanner } from "@/components/outcome-banner";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state || !state.client) return <p className="text-sm">Reading the project database…</p>;

  const cards = [
    ["Workflows", state.counts.workflows],
    ["Outputs", state.counts.outputs],
    ["Content objects", state.counts.contentAssets],
    ["Pending approvals", state.counts.pendingApprovals],
    ["Connected integrations", `${state.counts.connectedIntegrations} / ${state.counts.integrations}`],
    ["Observed metrics", state.counts.metrics],
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Project dashboard</p>
        <h1 className="mt-1 font-serif text-4xl">{state.project.name}</h1>
        <p className="mt-2 text-sm text-ink-soft">Counts come from this project’s rows. Connected integrations are a query, not a preset.</p>
      </header>
      {state.workflow ? <OutcomeBanner workflow={state.workflow} llmConfigured={state.llmConfigured} /> : null}
      <section className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-panel px-4 py-3 shadow-card">
            <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="mt-1 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </section>
      <section className="rounded-xl border border-line bg-panel p-5 shadow-card">
        <h2 className="font-serif text-2xl">Business on file</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {Object.entries({
            Business: state.client.businessName,
            Industry: state.client.industry,
            Audience: state.client.audience,
            Geography: state.client.geography,
            Offer: state.client.offers,
            Goal: state.client.goals,
            Channels: state.client.channels,
            CTA: state.client.primaryCta,
            Funnel: state.client.funnel,
            Budget: state.client.budget,
            Constraints: state.client.constraints,
            Website: state.client.website,
          }).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
              <dd>{value || "UNKNOWN"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-xl border border-line bg-panel p-5 shadow-card">
        <h2 className="font-serif text-2xl">Edit business info</h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Saving does not regenerate approved work. Submit a new request from the AI workspace when you want another run.</p>
        <ClientForm
          key={id}
          mode="edit"
          projectId={id}
          initial={{
            projectName: state.project.name,
            businessName: state.client.businessName,
            industry: state.client.industry,
            audience: state.client.audience,
            geography: state.client.geography,
            goals: state.client.goals,
            offers: state.client.offers,
            channels: state.client.channels,
            budget: state.client.budget,
            constraints: state.client.constraints,
            website: state.client.website,
            notes: state.client.notes,
            primaryCta: state.client.primaryCta,
            funnel: state.client.funnel,
          }}
        />
      </section>
      <section>
        <h2 className="font-serif text-2xl">Workflow history</h2>
        <ul className="mt-3 grid gap-2">
          {state.workflows.length === 0 ? <li className="text-sm text-ink-soft">No request has been submitted.</li> : null}
          {state.workflows.map((item) => (
            <li key={item.id} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill value={item.status} />
                {item.outcome ? <StatusPill value={item.outcome} /> : null}
                <span className="text-ink-soft">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{item.requestText}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
