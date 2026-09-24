import type { AgentKey } from "./catalog";
import { corpusFrom } from "./claims";
import { contentStudio, runDeterministic, videoCreative } from "./deterministic";
import { extractJson, llmJson, llmStatus } from "./llm";
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
    const first = await completeWithModel(agentKey, ctx);
    if (agentKey === "content_studio" && first.runStatus === "FAILED") {
      const retry = await completeWithModel(
        agentKey,
        ctx,
        `The previous draft was rejected: ${first.error || first.summary}. Rewrite every post without those claims. Keep the approved CTA and the named channels.`,
      );
      if (retry.runStatus === "COMPLETED") return retry;
      return first;
    }
    if ((first.runStatus === "BLOCKED" || first.runStatus === "FAILED") && agentKey !== "content_studio") {
      const fallback = runDeterministic(agentKey, ctx);
      if (fallback.runStatus === "COMPLETED" || fallback.runStatus === "CONFLICT" || fallback.runStatus === "BLOCKED") {
        return fallback.runStatus === "COMPLETED"
          ? {
              ...fallback,
              summary: `${fallback.summary} The model response was ${first.runStatus}, so this draft uses the project fields instead.`,
            }
          : fallback;
      }
    }
    return first;
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

async function completeWithModel(agentKey: string, ctx: WorkContext, extra?: string) {
  const temperature = agentKey === "content_studio" || agentKey === "video_creative" ? 0.7 : 0.3;
  const user = extra ? `${userPrompt(agentKey as AgentKey, ctx)}\n\nREVISION OF REJECTED DRAFT\n${extra}` : userPrompt(agentKey as AgentKey, ctx);
  const completion = await llmJson(systemPrompt(agentKey as AgentKey), user, { temperature });
  return normalizeLlm(agentKey, ctx, extractJson(completion.text));
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
      return {
        runStatus: "FAILED",
        continuePipeline: false,
        summary: "FAILED. Content Studio returned no posts for the approved channels.",
        qa: "FAIL",
        error: "Content Studio returned no posts.",
        output: {
          kind: "content_pack",
          title: "Content pack",
          status: "FAILED",
          summary: "No posts matched the channel scope.",
          generationMode: "NOT_GENERATED",
          body: { channels: ctx.channels.map((channel) => channel.label) },
        },
      };
    }
    const result = contentStudio(ctx, "LLM", drafts);
    if (result.output) result.output.generationMode = result.runStatus === "COMPLETED" ? "LLM" : result.output.generationMode;
    if (result.contentAssets) {
      result.contentAssets = result.contentAssets.map((asset) => ({
        ...asset,
        generationMode: "LLM",
        body: { ...asset.body, llmProvider: llmStatus().provider, llmModel: llmStatus().model },
      }));
    }
    return result;
  }
  if (agentKey === "campaign_architect") {
    if (ctx.channels.length === 0) return runDeterministic(agentKey, ctx);
    const body = scrubExternalClaims(bodyFrom(json), ctx);
    const name = `${ctx.businessName} — ${(ctx.goals || ctx.requestText).replace(/\s+/g, " ").trim().slice(0, 72)}`;
    return {
      runStatus: "COMPLETED",
      continuePipeline: true,
      summary: stringOf(json.summary) || `Architecture keeps ${ctx.channels.map((channel) => channel.label).join(", ")} and does not activate them.`,
      qa: "PASS",
      campaigns: [
        {
          name,
          objective: ctx.goals || "UNKNOWN",
          channels: ctx.channels.map((channel) => channel.label).join(", "),
          status: "NOT_ACTIVATED",
          body: {
            ...body,
            volumePerChannel: ctx.volumePerChannel,
            cta: ctx.primaryCta || "UNKNOWN",
            activation: "NOT_ACTIVATED",
          },
        },
      ],
      output: {
        kind: "architecture",
        title: stringOf(json.title) || "Campaign architecture",
        status: "READY_FOR_HUMAN_REVIEW",
        summary: stringOf(json.summary) || "Channel scope comes from the project. The campaign is not activated.",
        generationMode: "LLM",
        body: {
          ...body,
          channels: ctx.channels,
          volumePerChannel: ctx.volumePerChannel,
          cta: ctx.primaryCta || "UNKNOWN",
          activation: "NOT_ACTIVATED",
        },
      },
    };
  }
  if (agentKey === "video_creative") {
    const storyboard = isRecord(json.storyboard) ? json.storyboard : {};
    const result = videoCreative(ctx, "LLM", storyboard);
    if (result.output) result.output.generationMode = "LLM";
    return result;
  }
  const body = scrubExternalClaims(bodyFrom(json), ctx);
  if (agentKey === "market_intelligence") {
    body.externalResearch = "NOT_PERFORMED";
    body.competitors = "UNKNOWN";
    body.marketSize = "UNKNOWN";
    body.rankings = "UNKNOWN";
  }
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
  const corpus = corpusFrom([
    ctx.businessName,
    ctx.industry,
    ctx.audience,
    ctx.geography,
    ctx.goals,
    ctx.offers,
    ctx.constraints,
    ctx.notes,
    ctx.primaryCta,
    ctx.requestText,
    ctx.website,
    ctx.revisionNote,
  ]);
  const modelCta = stringOf(post.cta);
  let cta = "UNKNOWN";
  let ctaSource = "UNKNOWN";
  if (ctx.primaryCta && ctx.mode !== "PATCH") {
    cta = ctx.primaryCta;
    ctaSource = "CLIENT_CONFIRMED";
  } else if (modelCta && modelCta.toUpperCase() !== "UNKNOWN" && corpus.includes(modelCta.toLowerCase())) {
    cta = modelCta;
    ctaSource = "CLIENT_CONFIRMED";
  }
  const hashtags = Array.isArray(post.hashtags)
    ? post.hashtags.map(stringOf).filter(Boolean).slice(0, 3)
    : [];
  return {
    platform: channel?.label || stringOf(post.platform) || "UNKNOWN",
    channelSource: channel?.source || "INFERRED_FROM_REQUEST",
    funnelStage: stringOf(post.funnelStage) || "UNKNOWN",
    angle: stringOf(post.angle) || "Model draft",
    hook: stringOf(post.hook),
    headline: stringOf(post.headline) || stringOf(post.subject),
    caption: stringOf(post.caption),
    cta,
    ctaSource,
    format: stringOf(post.format) || formatForChannel(channel?.id || platformId),
    claimsNote: stringOf(post.claimsNote) || "LLM draft. Unsourced statistics, awards, and testimonials are rejected before save.",
    generationMode: "LLM",
    status: "READY_FOR_HUMAN_REVIEW",
    body: {
      subject: stringOf(post.subject),
      preheader: stringOf(post.preheader),
      platformId: channel?.id || platformId,
      creativeDirection: stringOf(post.creativeDirection),
      hashtags,
      llmProvider: llmStatus().provider,
      llmModel: llmStatus().model,
    },
  };
}

function formatForChannel(platform: string) {
  if (platform === "email") return "email";
  if (platform === "google_ads") return "search_ad";
  if (platform === "linkedin") return "linkedin_post";
  if (platform === "tiktok" || platform === "youtube") return "short_video_caption";
  return "social_post";
}

function bodyFrom(json: Record<string, unknown>) {
  if (isRecord(json.body)) return { ...json.body };
  const rest = { ...json };
  for (const key of ["runStatus", "summary", "qa", "title", "status", "posts", "storyboard"]) delete rest[key];
  return rest;
}

function scrubExternalClaims(body: Record<string, unknown>, ctx: WorkContext) {
  const corpus = corpusFrom([
    ctx.businessName,
    ctx.offers,
    ctx.audience,
    ctx.geography,
    ctx.goals,
    ctx.industry,
    ctx.notes,
    ctx.requestText,
    ctx.constraints,
    ctx.primaryCta,
  ]);
  const banned = /award[- ]winning|\bguaranteed\b|\bbest in\b|\bmarket leader\b|\b\d+(\.\d+)?%/i;
  const walk = (value: unknown): unknown => {
    if (typeof value === "string") {
      if (banned.test(value) && !corpus.includes(value.toLowerCase())) {
        return "UNKNOWN — a claim in the model draft was not in the project record, so it was removed.";
      }
      return value;
    }
    if (Array.isArray(value)) return value.map(walk);
    if (isRecord(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item)]));
    }
    return value;
  };
  return walk(body) as Record<string, unknown>;
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
