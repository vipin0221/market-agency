"use client";

import Link from "next/link";
import { use, useState } from "react";
import { NextStepBar, onThisPage } from "@/components/next-step";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Banner, EmptyState, LoadingLine, secondaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";
import { nextAction } from "@/lib/journey";

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading accounts…" />;

  const connected = state.integrations.filter((item) => item.status === "CONNECTED").length;
  const action = nextAction(state);

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
      <div className="mt-4">
        <NextStepBar
          action={action}
          projectId={id}
          active={onThisPage(action, id, "connect")}
          onDone={() => void reload()}
          follow={
            <>
              <Link href={`/projects/${id}/reports`} className="font-semibold text-accent">
                Reports
              </Link>{" "}
              stay empty until you record a result you observed.{" "}
              <Link href={`/projects/${id}/campaigns`} className="font-semibold text-accent">
                Campaigns
              </Link>{" "}
              are optional and are not activated.
            </>
          }
        />
      </div>
      <div className="mt-4">
        <Banner tone="error">Status stays NOT_CONNECTED. This page does not start a sign-in and does not post.</Banner>
      </div>
      {notice ? (
        <div className="mt-4">
          <Banner tone="warning" role="status">
            {notice}
          </Banner>
        </div>
      ) : null}
      {state.integrations.length === 0 ? (
        <EmptyState title="No accounts on file">Next: accounts are listed with the brand and stay NOT_CONNECTED. Phase 1 does not sign in.</EmptyState>
      ) : null}
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
              <button type="button" onClick={() => void connect(integration.id)} className={secondaryButtonClass}>
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
