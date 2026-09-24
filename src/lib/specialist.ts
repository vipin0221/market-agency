import type { AgentKey } from "./catalog";
import { contentStudio, runDeterministic, videoCreative } from "./deterministic";
import { extractJson, LlmError, llmJson, llmStatus } from "./llm";
import { systemPrompt, userPrompt } from "./prompts";
import type { ContentDraft, SpecialistResult, WorkContext } from "./types";

const DETERMINISTIC_ONLY = new Set([
  "orchestrator",
  "campaign_operations",
  "account_integration",
  "campaign_intelligence",
  "growth_optimization",
]);

export async function runSpecialist(agentKey: string, ctx: WorkContext): Promise<SpecialistResult> {
  if (DETERMINISTIC_ONLY.has(agentKey) || !llmStatus().configured) {
    return runDeterministic(agentKey, ctx);
  }
  try {
    const completion = await llmJson(systemPrompt(agentKey as AgentKey), userPrompt(agentKey as AgentKey, ctx));
    const json = extractJson(completion.text);
    return normalizeLlm(agentKey, ctx, json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM request failed.";
    if (message === "LLM_NOT_CONFIGURED") return runDeterministic(agentKey, ctx);
    return {
      runStatus: "FAILED",
      continuePipeline: false,
      summary: `FAILED. The model call did not succeed: ${message}`,
      qa: "FAIL",
      error: message,
      output: {
        kind: kindFor(agentKey),
        title: `${agentKey} failed`,
        status: "FAILED",
        summary: message,
        generationMode: "NOT_GENERATED",
        body: { error: message },
      },
    };
  }
}

function normalizeLlm(agentKey: string, ctx: WorkContext, json: Record<string, unknown>): SpecialistResult {
  const runStatus = normalizeRunStatus(json.runStatus);
  if (runStatus === "FAILED" || runStatus === "BLOCKED" || runStatus === "CONFLICT") {
    const summary = stringOf(json.summary) || `${runStatus} returned by the model.`;
    return {
      runStatus,
      continuePipeline: false,
      summary,
      qa: "FLAG",
      error: summary,
      output: {
        kind: kindFor(agentKey),
        title: stringOf(json.title) || kindFor(agentKey),
        status: runStatus === "CONFLICT" ? "CONFLICT" : runStatus,
        summary,
        generationMode: "LLM",
        body: isRecord(json.body) ? json.body : { model: json },
      },
    };
  }
  if (agentKey === "content_studio") {
    const posts = Array.isArray(json.posts) ? json.posts : [];
    const drafts = posts.filter(isRecord).map((post) => postFromModel(post, ctx));
    if (drafts.length === 0) {
      throw new LlmError("Content Studio returned no posts.");
    }
    const result = contentStudio(ctx, "LLM", drafts);
    if (result.output) result.output.generationMode = result.runStatus === "COMPLETED" ? "LLM" : result.output.generationMode;
    return result;
  }
  if (agentKey === "video_creative") {
    const storyboard = isRecord(json.storyboard) ? json.storyboard : {};
    const result = videoCreative(ctx, "LLM", storyboard);
    if (result.output) result.output.generationMode = "LLM";
    return result;
  }
  const body = isRecord(json.body) ? json.body : { narrative: stringOf(json.summary) };
  const summary = stringOf(json.summary) || "Model draft ready for human review.";
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary,
    qa: json.qa === "FAIL" ? "FAIL" : json.qa === "FLAG" ? "FLAG" : "PASS",
    output: {
      kind: kindFor(agentKey),
      title: stringOf(json.title) || kindFor(agentKey),
      status: "READY_FOR_HUMAN_REVIEW",
      summary,
      generationMode: "LLM",
      body,
    },
  };
}

function postFromModel(post: Record<string, unknown>, ctx: WorkContext): ContentDraft {
  const platformId = stringOf(post.platform).toLowerCase();
  const channel =
    ctx.channels.find((item) => item.id === platformId || item.label.toLowerCase() === platformId) ?? null;
  return {
    platform: channel?.label || stringOf(post.platform) || "UNKNOWN",
    channelSource: channel?.source || "INFERRED_FROM_REQUEST",
    funnelStage: stringOf(post.funnelStage) || "UNKNOWN",
    angle: stringOf(post.angle) || "Model draft",
    hook: stringOf(post.hook),
    headline: stringOf(post.headline) || stringOf(post.subject),
    caption: stringOf(post.caption),
    cta: stringOf(post.cta) || "UNKNOWN",
    ctaSource: stringOf(post.cta) && stringOf(post.cta) !== "UNKNOWN" ? "MODEL_DRAFT" : "UNKNOWN",
    format: stringOf(post.format) || "social_post",
    claimsNote: stringOf(post.claimsNote) || "LLM draft. Unsourced claims are rejected before save.",
    generationMode: "LLM",
    status: "READY_FOR_HUMAN_REVIEW",
    body: {
      subject: stringOf(post.subject),
      preheader: stringOf(post.preheader),
      platformId: channel?.id || platformId,
    },
  };
}

function normalizeRunStatus(value: unknown): SpecialistResult["runStatus"] {
  const text = stringOf(value).toUpperCase();
  if (text === "BLOCKED" || text === "FAILED" || text === "CONFLICT" || text === "SKIPPED") return text;
  return "COMPLETED";
}

function kindFor(agentKey: string) {
  switch (agentKey) {
    case "client_intelligence":
      return "client_intelligence";
    case "market_intelligence":
      return "market_intelligence";
    case "brand_studio":
      return "brand";
    case "market_strategy":
      return "strategy";
    case "campaign_architect":
      return "architecture";
    case "content_studio":
      return "content_pack";
    case "video_creative":
      return "video_pack";
    case "campaign_operations":
      return "operations";
    case "account_integration":
      return "integration_report";
    case "campaign_intelligence":
      return "insights";
    case "growth_optimization":
      return "optimization";
    default:
      return "plan";
  }
}

function stringOf(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
