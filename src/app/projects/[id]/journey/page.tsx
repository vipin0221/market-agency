"use client";

import Link from "next/link";
import { use } from "react";
import { ClientForm } from "@/components/client-form";
import { ExcerptList } from "@/components/excerpt-list";
import { HumanStatusPill } from "@/components/human-status";
import { JourneyStrip } from "@/components/journey-strip";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, excerptsFor, focusStage, type StageId } from "@/lib/journey";

const order: StageId[] = ["brand", "research", "strategy", "content", "review", "connect", "campaigns", "reports"];

export default function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state || !state.client) return <p className="text-sm">Loading this brand…</p>;

  const stages = buildJourney(state);
  const client = state.client;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Journey</p>
        <h1 className="mt-1 font-serif text-4xl">{state.project.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Brand through reports. Campaigns and reports come later, and a campaign is not required for organic posts.
        </p>
      </header>
      {state.workflow ? (
        <section className="rounded-2xl border border-line bg-panel px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">You asked</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{state.workflow.requestText}</p>
        </section>
      ) : (
        <p className="text-sm text-ink-soft">No request yet. Start one from Overview.</p>
      )}
      <JourneyStrip stages={stages} currentId={focusStage(stages)} />
      {order.map((stageId) => {
        const stage = stages.find((item) => item.id === stageId);
        if (!stage) return null;
        const external = !stage.href.includes("#");
        return (
          <section key={stage.id} id={stage.id} className="scroll-mt-24 rounded-2xl border border-line bg-panel p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-3xl">{stage.label}</h2>
              <HumanStatusPill status={stage.status} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{stage.summary}</p>
            <ExcerptList items={excerptsFor(state, stage.id)} />
            {external ? (
              <Link href={stage.href} className="mt-4 inline-flex text-sm font-semibold text-accent">
                Open {stage.label.toLowerCase()}
              </Link>
            ) : null}
            {stage.id === "brand" ? (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="font-serif text-xl">On file</h3>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {(
                    [
                      ["Business", client.businessName],
                      ["Industry", client.industry],
                      ["Audience", client.audience],
                      ["Geography", client.geography],
                      ["Offer", client.offers],
                      ["Goal", client.goals],
                      ["Channels", client.channels],
                      ["CTA", client.primaryCta],
                      ["Funnel", client.funnel],
                      ["Budget", client.budget],
                      ["Constraints", client.constraints],
                      ["Website", client.website],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs uppercase tracking-wide text-ink-soft">{label}</dt>
                      <dd>{value.trim() || "UNKNOWN"}</dd>
                    </div>
                  ))}
                </dl>
                <details className="mt-5">
                  <summary className="cursor-pointer text-sm font-semibold">Edit brand details</summary>
                  <p className="mb-4 mt-2 text-sm text-ink-soft">Saving does not rewrite posts that are already written.</p>
                  <ClientForm
                    key={id}
                    mode="edit"
                    projectId={id}
                    initial={{
                      projectName: state.project.name,
                      businessName: client.businessName,
                      industry: client.industry,
                      audience: client.audience,
                      geography: client.geography,
                      goals: client.goals,
                      offers: client.offers,
                      channels: client.channels,
                      budget: client.budget,
                      constraints: client.constraints,
                      website: client.website,
                      notes: client.notes,
                      primaryCta: client.primaryCta,
                      funnel: client.funnel,
                    }}
                  />
                </details>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
