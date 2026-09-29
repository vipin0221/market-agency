"use client";

import Link from "next/link";
import { use } from "react";
import { PageHeader } from "@/components/page-header";
import { Banner, LoadingLine, Section } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading accounts…" />;

  const connected = state.integrations.filter((item) => item.status === "CONNECTED").length;

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        kicker="Connect"
        title="Accounts"
        lede="Phase 1 does not sign in to an ad or social account, and it does not post."
      />
      <Section
        title="Account sign-in is not in this version"
        lede="When a real sign-in exists, it will be one flow for these accounts. Until then, publishing stays off and no status is flipped."
        action={<span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft ring-1 ring-inset ring-line">Phase 2</span>}
        padded={false}
      >
        <p className="border-b border-line px-5 py-3 text-sm leading-6">
          Status stays <span className="font-medium">NOT_CONNECTED</span>
          {connected > 0 ? ` (${connected} marked connected in stored rows)` : ""}. There is no provider sign-in to start.
        </p>
        {state.integrations.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-soft">No accounts are on file for this brand yet.</p>
        ) : (
          <ul>
            {state.integrations.map((integration) => (
              <li key={integration.id} className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-sm first:border-t-0">
                <span className="min-w-0 break-words font-medium">{integration.label}</span>
                <span className="shrink-0 text-xs text-ink-soft">Not connected</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <p className="text-sm leading-6 text-ink-soft">
        <Link href={`/projects/${id}/calendar`} className="font-medium text-accent">
          Store a publish time
        </Link>
        <span className="mx-2 text-line">·</span>
        <Link href={`/projects/${id}/reports`} className="font-medium text-accent">
          Record a result
        </Link>
        <span className="mx-2 text-line">·</span>
        <Link href={`/projects/${id}/integrations`} className="font-medium text-accent">
          Integration records
        </Link>
      </p>
    </div>
  );
}
