"use client";

import { use } from "react";
import { useProjectState } from "@/components/use-project-state";

export default function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading the audit log…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Audit trail</p>
      <h1 className="mt-1 font-serif text-4xl">What changed</h1>
      <ol className="mt-6 grid gap-3">
        {state.auditLogs.length === 0 ? <li className="text-sm text-ink-soft">No events yet.</li> : null}
        {state.auditLogs.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-line bg-panel px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              {new Date(entry.createdAt).toLocaleString()} · {entry.actor} · {entry.action}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{entry.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
