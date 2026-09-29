"use client";

import Link from "next/link";
import { use } from "react";
import { ContentCalendar } from "@/components/content-calendar";
import { PageHeader } from "@/components/page-header";
import { Banner, EmptyState, LoadingLine, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading the calendar…" />;

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Calendar"
        title="Planned posts"
        lede="Set a publish time on a draft to place it on a day. The time is stored only. Nothing is posted."
      />
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
        <ContentCalendar projectId={id} assets={state.contentAssets} onScheduled={() => void reload()} />
      )}
    </div>
  );
}
