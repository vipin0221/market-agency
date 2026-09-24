"use client";

import { use } from "react";
import { OperatorNotice } from "@/components/operator-notice";
import { StatusPill } from "@/components/status-pill";
import { useProjectState } from "@/components/use-project-state";

export default function AgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <p className="text-sm text-rose-800">{error}</p>;
  if (!state) return <p className="text-sm">Reading agent runs…</p>;

  return (
    <div className="mx-auto max-w-4xl">
      <OperatorNotice>Agent run table. The status names here are internal.</OperatorNotice>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Agent status</p>
      <h1 className="mt-1 font-serif text-4xl">From the agent run table</h1>
      <p className="mt-2 text-sm text-ink-soft">Idle, waiting, and skipped are derived from the plan. Running, completed, blocked, and failed are stored runs.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">QA</th>
              <th className="px-4 py-3">Summary</th>
            </tr>
          </thead>
          <tbody>
            {state.agents.filter((agent) => ["orchestrator", "client_intelligence", "market_intelligence", "brand_studio", "market_strategy", "campaign_architect", "content_studio", "video_creative"].includes(agent.key)).map((agent) => (
              <AgentRow key={agent.key} agent={agent} />
            ))}
            <tr className="border-b border-line">
              <td className="px-4 py-3 font-medium">Human approval</td>
              <td className="px-4 py-3"><StatusPill value={state.approval.status} /></td>
              <td className="px-4 py-3 text-ink-soft">—</td>
              <td className="px-4 py-3 text-ink-soft">Not an agent. A recorded decision is required.</td>
            </tr>
            {state.agents.filter((agent) => ["campaign_operations", "account_integration", "campaign_intelligence", "growth_optimization"].includes(agent.key)).map((agent) => (
              <AgentRow key={agent.key} agent={agent} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AgentRow({
  agent,
}: {
  agent: { key: string; op: string; name: string; status: string; qa: string; summary: string };
}) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <span className="text-ink-soft">{agent.op}</span> {agent.name}
      </td>
      <td className="px-4 py-3"><StatusPill value={agent.status} /></td>
      <td className="px-4 py-3">{agent.qa || "—"}</td>
      <td className="px-4 py-3 text-ink-soft">{agent.summary}</td>
    </tr>
  );
}
