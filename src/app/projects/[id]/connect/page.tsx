"use client";

import Link from "next/link";
import { use } from "react";
import { PageHeader } from "@/components/page-header";
import { Banner, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading accounts…" />;

  const connected = state.integrations.filter((item) => item.status === "CONNECTED").length;
  const names = state.integrations.map((item) => item.label);

  return (
    <div className="grid min-w-0 max-w-3xl gap-6">
      <PageHeader
        kicker="Connect"
        title="Accounts"
        lede="Phase 1 does not sign in to an ad or social account, and it does not post."
      />
      <section className="rounded-2xl border border-line bg-panel p-5 shadow-card sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">Phase 2</p>
        <h2 className="mt-2 font-serif text-2xl">Account sign-in is not in this version</h2>
        <p className="mt-3 text-sm leading-6">
          Status stays <span className="font-semibold">NOT_CONNECTED</span>
          {connected > 0 ? ` (${connected} marked connected in stored rows)` : ""}. There is no provider sign-in to start, so there is no connect button.
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          When a real sign-in exists, it will be one flow for the accounts on this brand. Until then, publishing stays off and no status is flipped.
        </p>
        {names.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {state.integrations.map((integration) => (
              <li key={integration.id} className="rounded-full border border-line bg-paper px-3 py-1 text-sm">
                {integration.label}
                <span className="ml-2 text-xs font-semibold text-ink-soft">Not connected</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">No accounts are on file for this brand yet.</p>
        )}
      </section>
      <p className="text-sm leading-6 text-ink-soft">
        Next, if you want:{" "}
        <Link href={`/projects/${id}/calendar`} className="font-semibold text-accent">
          store a publish time
        </Link>{" "}
        or{" "}
        <Link href={`/projects/${id}/reports`} className="font-semibold text-accent">
          record a result
        </Link>
        . Campaigns stay optional.{" "}
        <Link href={`/projects/${id}/integrations`} className="font-semibold text-accent">
          Integration records
        </Link>{" "}
        stay under Advanced.
      </p>
    </div>
  );
}
