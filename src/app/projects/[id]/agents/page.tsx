"use client";

import { use } from "react";
import { FailedJobs } from "@/components/failed-jobs";
import { OperatorNotice } from "@/components/operator-notice";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Banner, LoadingLine } from "@/components/ui";
import { useProjectState } from "@/components/use-project-state";

export default function AgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state, error } = useProjectState(id);
  if (error) return <Banner tone="error">{error}</Banner>;
  if (!state) return <LoadingLine label="Loading agent runs…" />;

  return (
    <div className="grid min-w-0 gap-6">
      <OperatorNotice>Agent run table. The status names here are internal. A failed step stays failed until you retry it from Overview.</OperatorNotice>
      <PageHeader
        kicker="Agents"
        title="From the agent run table"
        lede="Idle, waiting, and skipped are derived from the plan. Queued, running, failed, and needs-you are stored. This table scrolls inside the card on a narrow screen."
      />
      <FailedJobs jobs={state.jobs} />
      <div className="min-w-0 overflow-x-auto rounded-xl border border-line bg-panel">
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
