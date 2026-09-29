"use client";

import Link from "next/link";
import { use } from "react";
import { ContentCalendar } from "@/components/content-calendar";
import { NextStepBar, onThisPage } from "@/components/next-step";
import { PageHeader } from "@/components/page-header";
import { Banner, EmptyState, LoadingLine, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { nextAction } from "@/lib/journey";

export default function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading the calendar…" />;

  const action = nextAction(state);

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Calendar"
        title="Planned posts"
        lede="A week or a month of the posts on this brand. A post is placed on a day only when a publish time is already stored. Publishing itself is still off."
      />
      <NextStepBar action={action} projectId={id} active={onThisPage(action, id, "calendar")} />
      {state.contentAssets.length === 0 ? (
        <EmptyState
          title="No posts yet"
          action={
            <Link href={`/projects/${id}`} className={secondaryButtonClass}>
              Back to overview
            </Link>
          }
        >
          The calendar stays empty until a draft exists, and it will not invent a publish time.
        </EmptyState>
      ) : (
        <ContentCalendar projectId={id} assets={state.contentAssets} />
      )}
    </div>
  );
}
