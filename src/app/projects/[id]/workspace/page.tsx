"use client";

import { use, useState } from "react";
import Link from "next/link";
import { OperatorNotice } from "@/components/operator-notice";
import { DeskBrief } from "@/components/desk-brief";
import { OutcomeBanner } from "@/components/outcome-banner";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
import { StatusPill } from "@/components/status-pill";
import { Banner, EmptyState, LoadingLine, fieldClass, primaryButtonClass } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [request, setRequest] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading the workspace…" />;

  const assets = state.workflow
    ? state.contentAssets.filter((asset) => asset.workflowId === state.workflow?.id && asset.status !== "REVISION_REQUESTED")
    : [];

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    const response = await fetch(`/api/projects/${id}/requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request }),
    });
    const data = (await response.json()) as { message?: string };
    if (!response.ok) setFormError(data.message || "The request was not queued.");
    else setRequest("");
    setPending(false);
    await reload();
  }

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Pipeline, agent keys, and model status. The default path is Overview, Journey, Content, and Review.</OperatorNotice>
      <PageHeader
        kicker="AI workspace"
        title="Request, agents, content"
        lede="A request here writes drafts only. Review still has to approve them. Nothing is posted."
        aside={<StatusPill value={state.llmConfigured ? "LLM" : "GENERATED_WITHOUT_LLM"} />}
      />
      <form onSubmit={submitRequest} className="rounded-xl border border-line bg-panel p-5 shadow-card">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">New marketing request</span>
          <textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            rows={4}
            className={fieldClass}
            placeholder="Say what to make, for whom, and on which channels."
          />
        </label>
        <button type="submit" disabled={pending} className={`mt-3 ${primaryButtonClass}`}>
          {pending ? "Queuing…" : "Start drafts"}
        </button>
        {formError ? (
          <div className="mt-3">
            <Banner tone="error" role="alert">
              {formError}
            </Banner>
          </div>
        ) : null}
      </form>
      {state.workflow ? (
        <>
          <section className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Active request</p>
            <p className="mt-1 whitespace-pre-wrap">{state.workflow.requestText}</p>
          </section>
          <OutcomeBanner
            workflow={state.workflow}
            llmConfigured={state.llmConfigured}
            llmProvider={state.llmProvider}
            llmModel={state.llmModel}
          />
          <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <section className="grid gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Pipeline</h2>
              {earlyAgents(state.agents).map((agent) => (
                <AgentLine key={agent.key} op={agent.op} name={agent.name} status={agent.status} summary={agent.summary} />
              ))}
              <AgentLine op="—" name="Human approval" status={state.approval.status} summary="Not an agent. Silence is not approval." />
              {lateAgents(state.agents).map((agent) => (
                <AgentLine key={agent.key} op={agent.op} name={agent.name} status={agent.status} summary={agent.summary} />
              ))}
            </section>
            <div className="grid gap-4">
              <DeskBrief outputs={state.outputs.filter((output) => output.workflowId === state.workflow?.id)} />
              {state.approval.pendingId ? (
                <p className="rounded-xl border border-line bg-panel px-4 py-3 text-sm leading-6">
                  Decisions are per draft on{" "}
                  <Link href={`/projects/${id}/review`} className="font-semibold text-accent">
                    Review
                  </Link>
                  . This workspace does not approve every draft at once.
                </p>
              ) : null}
              <section className="grid gap-4">
                <h2 className="font-serif text-2xl">Content for review</h2>
                {assets.length === 0 ? <p className="text-sm text-ink-soft">Posts appear here after Content Studio writes them.</p> : null}
                {assets.map((asset) => (
                  <PostCard key={asset.id} asset={asset} />
                ))}
              </section>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No request yet">Next: write a marketing request above. It queues drafts. It does not post.</EmptyState>
      )}
    </div>
  );
}

const EARLY = new Set([
  "orchestrator",
  "client_intelligence",
  "market_intelligence",
  "brand_studio",
  "market_strategy",
  "campaign_architect",
  "content_studio",
  "video_creative",
]);

function earlyAgents<T extends { key: string }>(agents: T[]) {
  return agents.filter((agent) => EARLY.has(agent.key));
}

function lateAgents<T extends { key: string }>(agents: T[]) {
  return agents.filter((agent) => !EARLY.has(agent.key));
}

function AgentLine({ op, name, status, summary }: { op: string; name: string; status: string; summary: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          <span className="mr-1 text-xs text-ink-soft">{op === "—" ? "Gate" : op}</span>
          {name}
        </p>
        <StatusPill value={status} />
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-soft">{summary}</p>
    </div>
  );
}
