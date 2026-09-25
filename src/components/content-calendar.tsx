"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { readSchedule } from "@/lib/schedule";
import type { ProjectState } from "@/lib/state";

type Asset = ProjectState["contentAssets"][number];

export function ContentCalendar({ projectId, assets }: { projectId: string; assets: Asset[] }) {
  const [mode, setMode] = useState<"week" | "month">("week");
  const [cursor, setCursor] = useState(() => startOfWeek(new Date()));

  const placed = useMemo(() => {
    const dated: { asset: Asset; at: Date; hasTime: boolean }[] = [];
    const unscheduled: Asset[] = [];
    for (const asset of assets) {
      const mark = readSchedule(asset.body);
      if (!mark) unscheduled.push(asset);
      else dated.push({ asset, at: mark.at, hasTime: mark.hasTime });
    }
    return { dated, unscheduled };
  }, [assets]);

  const days = mode === "week" ? Array.from({ length: 7 }, (_, index) => addDays(cursor, index)) : monthGrid(cursor);
  const label = mode === "week" ? weekLabel(cursor) : cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function shift(direction: -1 | 1) {
    setCursor((current) => (mode === "week" ? addDays(current, direction * 7) : addMonths(current, direction)));
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shift(-1)} className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm">
            Previous
          </button>
          <button type="button" onClick={() => shift(1)} className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm">
            Next
          </button>
          <p className="px-1 text-sm font-medium">{label}</p>
        </div>
        <div className="flex rounded-md border border-line bg-panel p-0.5 text-sm">
          {(["week", "month"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={mode === option}
              onClick={() => {
                setMode(option);
                setCursor((current) => (option === "week" ? startOfWeek(current) : new Date(current.getFullYear(), current.getMonth(), 1)));
              }}
              className={`rounded px-3 py-1 capitalize ${mode === option ? "bg-ink text-paper" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className={mode === "month" ? "overflow-x-auto" : ""}>
      {mode === "month" ? (
        <div className="grid min-w-[42rem] grid-cols-7 gap-1 text-[11px] uppercase tracking-wide text-ink-soft">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="px-1">
              {day}
            </div>
          ))}
        </div>
      ) : null}
      <div className={`grid gap-2 ${mode === "week" ? "md:grid-cols-7" : "mt-1 min-w-[42rem] grid-cols-7"}`}>
        {days.map((day) => {
          const items = placed.dated.filter((item) => sameDay(item.at, day));
          const inMonth = day.getMonth() === cursor.getMonth();
          return (
            <div
              key={day.toISOString()}
              className={`min-h-28 rounded-xl border border-line bg-panel p-2 ${mode === "month" && !inMonth ? "opacity-45" : ""} ${
                sameDay(day, new Date()) ? "ring-1 ring-ink" : ""
              }`}
            >
              <p className="text-xs font-medium">{mode === "week" ? day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }) : day.getDate()}</p>
              <ul className="mt-2 grid gap-1">
                {items.map((item) => (
                  <li key={item.asset.id}>
                    <Link href={`/projects/${projectId}/content#post-${item.asset.id}`} className="block rounded-md bg-paper px-1.5 py-1 text-[11px] leading-4 hover:text-accent">
                      <span className="font-semibold">{item.asset.platform}</span> {item.asset.hook}
                      {item.hasTime ? <span className="mt-0.5 block text-ink-soft">{item.at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      </div>
      <section className="rounded-2xl border border-dashed border-line bg-panel px-4 py-4">
        <h2 className="font-serif text-2xl">Planned, not scheduled</h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          {placed.dated.length === 0
            ? "No publish time is stored on these posts, so they are not placed on a day."
            : "Posts without a stored publish time stay in this list."}
        </p>
        {placed.unscheduled.length === 0 ? <p className="mt-3 text-sm text-ink-soft">Nothing is waiting without a time.</p> : null}
        <ul className="mt-3 grid gap-2">
          {placed.unscheduled.map((asset) => (
            <li key={asset.id} className="rounded-xl border border-line px-3 py-3 text-sm">
              <Link href={`/projects/${projectId}/content#post-${asset.id}`} className="font-medium hover:text-accent">
                {asset.platform} · {asset.hook}
              </Link>
              <p className="mt-1 text-xs text-ink-soft">Drafted {new Date(asset.createdAt).toLocaleDateString()}. Not a publish time.</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function startOfWeek(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + delta);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function monthGrid(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function weekLabel(start: Date) {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endText = end.toLocaleDateString(undefined, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" });
  return `${startText} – ${endText}`;
}
