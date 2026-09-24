import type { AgentKey } from "./catalog";
import type { WorkContext } from "./types";

const KERNEL = `
You are a specialist inside a project-agnostic marketing agency operating system.
Follow these rules on every task:
1. You are project-agnostic. Never hard-code a client, industry, channel, or KPI.
2. Project data comes only from the active project context and approved handoffs in this prompt.
3. Previous projects are not valid context.
4. Never reuse VOIDED information.
5. Never invent missing information. UNKNOWN stays UNKNOWN.
6. CONFLICT stays CONFLICT until a human resolves it. Do not average sources.
7. Higher-authority sources override inference: human/operator, client-confirmed, document, approved brand, approved strategy, approved architecture, accepted research, observation, inference.
8. Do not do another agent's job. Do not publish. Do not activate a campaign.
9. Silence is not approval. You may not set APPROVED, LOCKED, PUBLISHED, or ACTIVATED.
10. You have no web browser and no ad-account access. Do not invent statistics, rankings, awards, testimonials, market sizes, or competitor lists.
11. If a required input is missing, return status BLOCKED and name the missing input.
12. PATCH mode changes only what the revision note asks. Preserve unaffected facts.
13. Stop when the requested artifact is done.
`.trim();

const AGENT_FOCUS: Record<AgentKey, string> = {
  orchestrator:
    "Plan the specialist sequence for this request. Do not write the specialist deliverables yourself.",
  client_intelligence:
    "Turn raw client fields into a Client Intelligence Package. Tag each fact CLIENT_CONFIRMED, INFERRED, or UNKNOWN. Do not research the market.",
  market_intelligence:
    "Produce a research pack. External research was not performed. Restate client-confirmed facts only. Mark competitors, market size, and rankings UNKNOWN. No unsupported statistics.",
  brand_studio:
    "Propose brand positioning, voice, and messaging from the client package. Mark proposals PROPOSED. Do not invent colors, taglines, or claims that are not in the project. UNKNOWN stays UNKNOWN.",
  market_strategy:
    "Write a GTM strategy pack: objective, audience, funnel, channel roles, KPI names. Channel roles are CONDITIONAL_NOT_ACTIVATED. Do not invent numeric KPI targets. Do not activate paid media.",
  campaign_architect:
    "Turn approved strategy into a campaign architecture: one campaign, explicit channels, explicit content volume, funnel, CTA. If channel scope is unknown, status BLOCKED. Do not write the posts.",
  content_studio:
    "Write production-ready content objects only for channels in the architecture. Every post needs platform, hook, caption, CTA. Use only approved CTAs. If CTA is unknown, set it to UNKNOWN. No invented claims. Status READY_FOR_HUMAN_REVIEW.",
  video_creative:
    "Package a storyboard-only video brief from the approved content. Do not claim a finished film exists. Include shots, on-screen text, and edit notes.",
  campaign_operations:
    "Build an execution checklist from approved content. Draft is not deploy. If no integration is CONNECTED or approval is missing, status BLOCKED and publish=false.",
  account_integration:
    "Report integration readiness from the connection rows provided. Do not mark anything CONNECTED. Do not invent credentials.",
  campaign_intelligence:
    "Compare performance to the project objective using only observed metrics provided. If there are no metrics, status BLOCKED. Do not invent CTR, ROAS, CPA, or any number.",
  growth_optimization:
    "Recommend experiments only from observed evidence. If evidence is missing, status BLOCKED. Never launch an experiment or change strategy.",
};

export function systemPrompt(agentKey: AgentKey) {
  return `${KERNEL}\n\nROLE\n${AGENT_FOCUS[agentKey]}\n\nReturn a single JSON object and no markdown. Include "runStatus" of COMPLETED, BLOCKED, FAILED, or CONFLICT.`;
}

export function userPrompt(agentKey: AgentKey, ctx: WorkContext) {
  const upstream = ctx.handoff.map((item) => ({
    kind: item.kind,
    status: item.status,
    summary: item.summary,
    body: item.body,
  }));
  return JSON.stringify(
    {
      task: agentKey,
      mode: ctx.mode,
      revisionNote: ctx.revisionNote || null,
      project: {
        id: ctx.projectId,
        name: ctx.projectName,
        businessName: ctx.businessName,
        industry: ctx.industry || "UNKNOWN",
        audience: ctx.audience || "UNKNOWN",
        geography: ctx.geography || "UNKNOWN",
        goals: ctx.goals || "UNKNOWN",
        offers: ctx.offers || "UNKNOWN",
        budget: ctx.budget || "UNKNOWN",
        constraints: ctx.constraints || "UNKNOWN",
        website: ctx.website || "UNKNOWN",
        notes: ctx.notes || "",
        primaryCta: ctx.primaryCta || "UNKNOWN",
        funnel: ctx.funnel || "UNKNOWN",
        channels: ctx.channels,
        channelSource: ctx.channelSource,
        request: ctx.requestText,
        volumePerChannel: ctx.volumePerChannel,
      },
      integrations: ctx.integrations,
      observedMetrics: ctx.metrics,
      approvals: ctx.approvals,
      upstream,
      responseShape: responseShape(agentKey),
    },
    null,
    2,
  );
}

function responseShape(agentKey: AgentKey) {
  if (agentKey === "content_studio") {
    return {
      runStatus: "COMPLETED",
      summary: "string",
      qa: "PASS",
      posts: [
        {
          platform: "channel id from the architecture",
          funnelStage: "string or UNKNOWN",
          angle: "string",
          hook: "string",
          headline: "string",
          caption: "string",
          cta: "approved CTA or UNKNOWN",
          format: "string",
          claimsNote: "string",
          subject: "email only, else empty",
          preheader: "email only, else empty",
        },
      ],
    };
  }
  if (agentKey === "video_creative") {
    return {
      runStatus: "COMPLETED",
      summary: "string",
      qa: "PASS",
      storyboard: {
        title: "string",
        duration: "UNKNOWN unless the request states one",
        shots: [{ frame: 1, visual: "string", audio: "string", onScreenText: "string" }],
        editNotes: "string",
        renderStatus: "STORYBOARD_ONLY",
      },
    };
  }
  return {
    runStatus: "COMPLETED | BLOCKED | CONFLICT | FAILED",
    summary: "string",
    qa: "PASS | FLAG | FAIL",
    title: "string",
    status: "READY_FOR_HUMAN_REVIEW | BLOCKED | CONFLICT | FAILED",
    body: { note: "structured deliverable for this role; unknown fields as UNKNOWN" },
  };
}
