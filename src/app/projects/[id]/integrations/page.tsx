"use client";

import { use } from "react";
import { OperatorNotice } from "@/components/operator-notice";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Banner, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function IntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading integration records…" />;

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Same accounts as Connect. This list does not start a sign-in and does not mark anything connected.</OperatorNotice>
      <PageHeader
        kicker="Integration records"
        title="Accounts"
        lede={`Every provider starts NOT_CONNECTED. There is no OAuth in this version. ${state.counts.connectedIntegrations} connected of ${state.counts.integrations}.`}
      />
      <ul className="grid gap-3">
        {state.integrations.map((integration) => (
          <li key={integration.id} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-panel px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="font-medium">{integration.label}</p>
              <p className="text-xs text-ink-soft">{integration.detail}</p>
            </div>
            <StatusPill value={integration.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
