"use client";

import Link from "next/link";
import { use, useState } from "react";
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
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Connect</p>
      <h1 className="mt-1 font-serif text-4xl">Accounts</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
        {connected === 0
          ? "None of these accounts are connected. Connect does not start a real sign-in, and it will not mark an account live or publish a post."
          : `${connected} connected. Publishing is still off in this version.`}
      </p>
      {notice ? <p className="mt-4 rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-6">{notice}</p> : null}
      <ul className="mt-6 grid gap-3">
        {state.integrations.map((integration) => (
          <li key={integration.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-4">
            <div>
              <p className="font-medium">{integration.label}</p>
              <p className="mt-1 text-xs text-ink-soft">{integration.status === "CONNECTED" ? "Connected" : "Not connected"}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill value={integration.status} />
              <button type="button" onClick={() => void connect(integration.id)} className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
                Connect
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
