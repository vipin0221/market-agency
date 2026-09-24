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
  content_studio: `Write production-ready social and email objects only for the channels listed in this project.
Every object needs platform, a specific hook, a full caption, creative direction, and the approved CTA.
Write like a good in-house copywriter: concrete, spoken, and specific to THIS business. No corporate filler, no "unlock", "elevate", "game-changer", or "on file".
Each post takes a different angle (a scene, an objection, a how-it-works, a constraint). Do not repeat the same sentences across posts or platforms.
Platform craft:
- instagram: hook is the first line a person would stop on. Caption is 70–140 words with line breaks. At most 3 hashtags, and only if each word appears in the business name or offer.
- linkedin: 80–160 words in short paragraphs. No hashtag block.
- email: subject, preheader, and the full letter in caption. Subject is not the caption.
- facebook: conversational, 60–120 words.
- tiktok or youtube: spoken hook plus a short caption. Creative direction describes the shots.
- x: under 240 characters.
- google_ads: a headline and a description that fit the offer as written.
If a primary CTA was provided, the cta field must be that exact phrase. If it was not, set cta to UNKNOWN. Do not invent Book now, DM us, or a discount.
Do not invent statistics, awards, rankings, testimonials, guarantees, prices, or competitor names. If you do, the post will be rejected.
creativeDirection tells a designer or photographer what to show, using only people, places, and objects named in the project. Status stays READY_FOR_HUMAN_REVIEW.`,
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
  return `${KERNEL}\n\nROLE\n${AGENT_FOCUS[agentKey]}\n\nReturn a single JSON object and no markdown. Include "runStatus" of COMPLETED, BLOCKED, FAILED, or CONFLICT. Write prose a client could read aloud. Do not mention other clients or prior projects.`;
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
          claimsNote: "Which project fields the copy relies on. Empty if none are numeric.",
          creativeDirection: "What to photograph or design. No awards or fake results.",
          subject: "email only, else empty",
          preheader: "email only, else empty",
          hashtags: ["only tokens that already appear in the business name or offer"],
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
  if (agentKey === "client_intelligence") {
    return {
      runStatus: "COMPLETED",
      summary: "one sentence a producer can scan",
      qa: "PASS | FLAG",
      title: "Client Intelligence Package",
      body: {
        narrative: "A short briefing in plain sentences. Unknowns stay unknown.",
        facts: [{ field: "Audience", value: "string or UNKNOWN", source: "CLIENT_CONFIRMED | UNKNOWN" }],
        unknowns: ["field names still blank"],
        conflicts: [],
      },
    };
  }
  if (agentKey === "brand_studio") {
    return {
      runStatus: "COMPLETED",
      summary: "one sentence",
      qa: "PASS | FLAG",
      title: "Brand Pack",
      body: {
        positioning: "Two or three sentences. Proposed, not locked. No invented proof.",
        voice: ["three or four voice rules a writer can follow"],
        valueProposition: "string or UNKNOWN",
        differentiation: "UNKNOWN if no comparative proof was entered",
        visualDirection: "What the pictures should feel like, or UNKNOWN",
        tagline: "UNKNOWN unless the project already states one",
        state: "PROPOSED",
      },
    };
  }
  if (agentKey === "market_strategy") {
    return {
      runStatus: "COMPLETED",
      summary: "one sentence",
      qa: "PASS | FLAG",
      title: "Market Strategy Pack",
      body: {
        objective: "the goal as written, or UNKNOWN",
        audience: "string or UNKNOWN",
        narrative: "How this request should be approached. Channels stay conditional.",
        funnel: { stages: ["from the project, or UNKNOWN"], source: "CLIENT_CONFIRMED | UNKNOWN" },
        channelRoles: [{ channel: "label", role: "why this channel is in the request", status: "CONDITIONAL_NOT_ACTIVATED" }],
        kpis: [{ name: "string", target: "UNKNOWN", note: "No number was invented." }],
        activation: "NOT_ACTIVATED",
      },
    };
  }
  if (agentKey === "campaign_architect") {
    return {
      runStatus: "COMPLETED",
      summary: "channels and volume in one sentence",
      qa: "PASS",
      title: "Campaign architecture",
      body: {
        campaignBrief: "What the campaign is for, in prose. Do not add channels.",
        message: "The single idea Content Studio should carry.",
        contentRequirements: ["what each asset must do"],
        cta: "approved CTA or UNKNOWN",
        activation: "NOT_ACTIVATED",
      },
    };
  }
  if (agentKey === "market_intelligence") {
    return {
      runStatus: "COMPLETED",
      summary: "State that external research was not performed.",
      qa: "FLAG",
      title: "Market Intelligence Pack",
      body: {
        externalResearch: "NOT_PERFORMED",
        narrative: "What can be said from the client fields only.",
        competitors: "UNKNOWN",
        marketSize: "UNKNOWN",
        rankings: "UNKNOWN",
        gaps: ["what a later research pass would still need"],
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
