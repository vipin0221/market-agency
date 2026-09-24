"use client";

import { use, useState } from "react";
import { DecisionPanel } from "@/components/decision-panel";
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
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">AI workspace</p>
        <h1 className="mt-1 font-serif text-4xl">Request, agents, outputs</h1>
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
          <OutcomeBanner workflow={state.workflow} llmConfigured={state.llmConfigured} />
          <section className="grid gap-3">
            {earlyAgents(state.agents).map((agent) => (
              <AgentLine key={agent.key} op={agent.op} name={agent.name} status={agent.status} summary={agent.summary} />
            ))}
            <AgentLine op="—" name="Human approval" status={state.approval.status} summary="Control layer. Agents cannot approve themselves." />
            {lateAgents(state.agents).map((agent) => (
              <AgentLine key={agent.key} op={agent.op} name={agent.name} status={agent.status} summary={agent.summary} />
            ))}
          </section>
          {state.approval.pendingId ? <DecisionPanel approvalId={state.approval.pendingId} onDone={() => void reload()} /> : null}
          <section className="grid gap-4">
            {assets.length === 0 ? <p className="text-sm text-ink-soft">Content objects appear here after Content Studio writes them.</p> : null}
            {assets.map((asset) => (
              <PostCard key={asset.id} asset={asset} />
            ))}
          </section>
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
    <div className="grid gap-2 rounded-xl border border-line bg-panel px-4 py-3 sm:grid-cols-[7rem_1fr] sm:items-start">
      <div>
        <p className="text-xs text-ink-soft">{op === "—" ? "Gate" : `Agent ${op}`}</p>
        <p className="font-medium">{name}</p>
      </div>
      <div>
        <StatusPill value={status} />
        <p className="mt-1 text-sm leading-6 text-ink-soft">{summary}</p>
      </div>
    </div>
  );
}
