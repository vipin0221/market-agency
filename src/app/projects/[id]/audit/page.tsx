"use client";

import { use } from "react";
import { OperatorNotice } from "@/components/operator-notice";
import { PageHeader } from "@/components/page-header";
import { Banner, EmptyState, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading the audit log…" />;

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Change log for this brand. These are stored events, not a live feed.</OperatorNotice>
      <PageHeader kicker="Audit" title="What changed" lede="Each row is something this workspace recorded. Nothing here publishes or connects an account." />
      <ol className="grid gap-3">
        {state.auditLogs.length === 0 ? (
          <li>
            <EmptyState>No events yet. The next change you make on this brand will show up here.</EmptyState>
          </li>
        ) : null}
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
