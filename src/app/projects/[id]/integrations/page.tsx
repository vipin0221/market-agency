"use client";

import { use, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function IntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading integrations…</p>;

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
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Integrations</p>
      <h1 className="mt-1 font-serif text-4xl">Accounts</h1>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        Every provider starts NOT CONNECTED. Connect does not open OAuth in Phase 1 and does not flip the status.
        {state.counts.connectedIntegrations} connected of {state.counts.integrations}.
      </p>
      {notice ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-950">{notice}</p> : null}
      <ul className="mt-6 grid gap-3">
        {state.integrations.map((integration) => (
          <li key={integration.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-4">
            <div>
              <p className="font-medium">{integration.label}</p>
              <p className="text-xs text-ink-soft">{integration.detail}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill value={integration.status} />
              <button type="button" onClick={() => connect(integration.id)} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
                Connect
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
