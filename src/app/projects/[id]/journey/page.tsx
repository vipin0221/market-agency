"use client";

import Link from "next/link";
import { use } from "react";
import { ClientForm } from "@/components/client-form";
import { ExcerptList } from "@/components/excerpt-list";
import { FailedJobs } from "@/components/failed-jobs";
import { HumanStatusPill } from "@/components/human-status";
import { JourneyStrip } from "@/components/journey-strip";
import { NextActionButton } from "@/components/next-action-button";
import { PageHeader } from "@/components/page-header";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { buildJourney, excerptsFor, focusStage, nextAction, type StageId } from "@/lib/journey";

const order: StageId[] = ["brand", "research", "strategy", "content", "review", "connect", "campaigns", "reports"];

export default function JourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state || !state.client) return <LoadingLine label="Loading this brand…" />;

  const stages = buildJourney(state);
  const client = state.client;
  const action = nextAction(state);

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Journey"
        title={state.project.name}
        lede="Brand through reports. Campaigns and reports come later, and a campaign is not required for organic posts."
      />
      {state.workflow ? (
        <section className="rounded-xl border border-line bg-panel px-5 py-4">
          <p className="text-xs font-medium text-ink-soft">You asked</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{state.workflow.requestText}</p>
        </section>
      ) : (
        <EmptyState title="No request yet">Next: write one on Overview. Nothing is posted from it.</EmptyState>
      )}
      {state.pipeline.state === "failed" || state.pipeline.stalled ? (
        <section className="rounded-2xl border border-rose-200 bg-panel px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Next</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">{action.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{action.detail}</p>
          <FailedJobs jobs={state.jobs} />
          <div className="mt-4">
            <NextActionButton action={action} projectId={id} onDone={() => void reload()} />
          </div>
        </section>
      ) : null}
      <JourneyStrip stages={stages} currentId={focusStage(stages)} />
      {order.map((stageId) => {
        const stage = stages.find((item) => item.id === stageId);
        if (!stage) return null;
        const external = !stage.href.includes("#");
        return (
          <section key={stage.id} id={stage.id} className="min-w-0 scroll-mt-24 rounded-2xl border border-line bg-panel p-4 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-words font-serif text-2xl sm:text-3xl">{stage.label}</h2>
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
                      <dd className="break-words">{value.trim() || "Not on file"}</dd>
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
