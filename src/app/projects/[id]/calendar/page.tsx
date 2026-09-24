"use client";

import { use } from "react";
import { ContentCalendar } from "@/components/content-calendar";
import { useProjectState } from "@/components/use-project-state";

export default function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Loading the calendar…</p>;

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Calendar</p>
        <h1 className="mt-1 font-serif text-4xl">Planned posts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          A week or a month of the posts on this brand. A post is placed on a day only when a publish time is already stored. Publishing itself is still off.
        </p>
      </header>
      {state.contentAssets.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-panel px-4 py-8 text-sm text-ink-soft">
          No posts yet. The calendar stays empty until a draft exists, and it will not invent a publish time.
        </p>
      ) : (
        <ContentCalendar projectId={id} assets={state.contentAssets} />
      )}
    </div>
  );
}
