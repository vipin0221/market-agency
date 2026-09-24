"use client";

import { use, useState } from "react";
import { DecisionPanel } from "@/components/decision-panel";
import { DeskBrief } from "@/components/desk-brief";
import { OutcomeBanner } from "@/components/outcome-banner";
import { PostCard } from "@/components/post-card";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error, reload } = useProjectState(id);
  const [request, setRequest] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading the project database…</p>;

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
    <div className="mx-auto grid max-w-6xl gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">AI workspace</p>
          <h1 className="mt-1 font-serif text-4xl">Request, agents, content</h1>
        </div>
        <StatusPill value={state.llmConfigured ? "LLM" : "GENERATED_WITHOUT_LLM"} />
      </header>
      <form onSubmit={submitRequest} className="rounded-xl border border-line bg-panel p-5 shadow-card">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">New marketing request</span>
          <textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            rows={4}
            className="w-full rounded-md border border-line bg-white px-3 py-2 outline-none focus:border-accent"
            placeholder="Say what to make, for whom, and on which channels."
          />
        </label>
        <button type="submit" disabled={pending} className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
          {pending ? "Queuing…" : "Start workflow"}
        </button>
        {formError ? <p className="mt-2 text-sm text-rose-800">{formError}</p> : null}
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
          <div className="grid items-start gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
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
              {state.approval.pendingId ? <DecisionPanel approvalId={state.approval.pendingId} onDone={() => void reload()} /> : null}
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
        <p className="text-sm text-ink-soft">No workflow yet. Submit a request to queue the orchestrator.</p>
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
