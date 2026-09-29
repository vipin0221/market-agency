"use client";

import { use, useState } from "react";
import { OperatorNotice } from "@/components/operator-notice";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Banner, LoadingLine, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function IntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading integration records…" />;

  async function connect(integrationId: string) {
    const response = await fetch(`/api/integrations/${integrationId}/connect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await response.json()) as { message?: string };
    setNotice(data.message || "Connection was not created.");
    await reload();
  }

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Same accounts as Connect. This list does not start a sign-in and does not mark anything connected.</OperatorNotice>
      <PageHeader
        kicker="Integration records"
        title="Accounts"
        lede={`Every provider starts NOT_CONNECTED. There is no OAuth in this version. ${state.counts.connectedIntegrations} connected of ${state.counts.integrations}.`}
      />
      {notice ? <Banner tone="warning" role="status">{notice}</Banner> : null}
      <ul className="grid gap-3">
        {state.integrations.map((integration) => (
          <li key={integration.id} className="grid min-w-0 gap-3 rounded-2xl border border-line bg-panel px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="font-medium">{integration.label}</p>
              <p className="text-xs text-ink-soft">{integration.detail}</p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <StatusPill value={integration.status} />
              <button type="button" onClick={() => connect(integration.id)} className={secondaryButtonClass}>
                Sign-in unavailable
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
