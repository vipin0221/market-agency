"use client";

import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Loading accounts…</p>;

  const connected = state.integrations.filter((item) => item.status === "CONNECTED").length;

  async function connect(integrationId: string) {
    const response = await fetch(`/api/integrations/${integrationId}/connect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await response.json()) as { message?: string };
    setNotice(data.message || "This account was not connected.");
    await reload();
  }

  return (
    <div className="grid min-w-0 max-w-3xl gap-0">
      <PageHeader
        kicker="Connect"
        title="Accounts"
        lede={
          connected === 0
            ? state.integrations.length === 0
              ? "Next: accounts are listed with the brand and stay NOT_CONNECTED. Phase 1 does not sign in."
              : "Next: leave these accounts not connected. There is no live posting in this version."
            : `${connected} connected. Posting is still off in this version.`
        }
      />
      <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-950">
        Status stays NOT_CONNECTED. This page does not start a sign-in and does not post.
      </p>
      {notice ? <p className="mt-4 break-words rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-6">{notice}</p> : null}
      <ul className="mt-6 grid gap-3">
        {state.integrations.map((integration) => (
          <li key={integration.id} className="grid gap-3 rounded-2xl border border-line bg-panel px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="break-words font-medium">{integration.label}</p>
              <p className="mt-1 text-xs font-semibold tracking-wide text-ink-soft">
                {integration.status === "CONNECTED" ? "CONNECTED" : "NOT_CONNECTED"}
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              <StatusPill value={integration.status} />
              <button type="button" onClick={() => void connect(integration.id)} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
                Sign-in unavailable
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-ink-soft">
        <Link href={`/projects/${id}/integrations`} className="font-semibold text-accent">
          Integration records
        </Link>{" "}
        stay under Advanced for operators.
      </p>
    </div>
  );
}
