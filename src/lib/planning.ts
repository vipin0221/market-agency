import { CHANNELS } from "./catalog";
import type { ChannelRef, Conflict, WorkContext } from "./types";

const VIDEO_CHANNELS = new Set(["tiktok", "youtube"]);

export function blank(value: string | null | undefined) {
  return (value ?? "").trim();
}

export function detectChannels(channelsField: string, requestText: string): {
  channels: ChannelRef[];
  channelSource: string;
} {
  const fromField = matchChannels(channelsField).map((channel) => ({
    ...channel,
    source: "CLIENT_CONFIRMED" as const,
  }));
  if (fromField.length > 0) {
    return { channels: uniqueChannels(fromField), channelSource: "CLIENT_CONFIRMED" };
  }
  const fromRequest = matchChannels(requestText).map((channel) => ({
    ...channel,
    source: "INFERRED_FROM_REQUEST" as const,
  }));
  if (fromRequest.length > 0) {
    return {
      channels: uniqueChannels(fromRequest),
      channelSource: "INFERRED_FROM_REQUEST",
    };
  }
  return { channels: [], channelSource: "UNKNOWN" };
}

function matchChannels(text: string) {
  return CHANNELS.filter((channel) =>
    channel.aliases.some((alias) => {
      if (alias.toLowerCase() === "x") {
        return /\b(?:on|via|channel)\s+x\b/i.test(text) || /(?:^|,\s*)x(?:\s*,|$)/i.test(text);
      }
      const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return pattern.test(text);
    }),
  );
}

function uniqueChannels(channels: ChannelRef[]) {
  const seen = new Set<string>();
  return channels.filter((channel) => {
    if (seen.has(channel.id)) return false;
    seen.add(channel.id);
    return true;
  });
}

export function volumeFromRequest(requestText: string) {
  const match = requestText.match(/\b(\d+)\s+(post|posts|email|emails|assets|captions)\b/i);
  if (!match) return 2;
  return Math.min(4, Math.max(1, Number.parseInt(match[1], 10)));
}

export function videoInScope(requestText: string, channels: ChannelRef[]) {
  if (channels.some((channel) => VIDEO_CHANNELS.has(channel.id))) return true;
  return /\b(video|reel|reels|storyboard|short-form|short form)\b/i.test(requestText);
}

export function detectConflict(input: {
  constraints: string;
  channels: ChannelRef[];
}): Conflict | null {
  const organicOnly = /\borganic only\b|\bno paid\b|\bno ads\b/i.test(input.constraints);
  const paid = input.channels.filter((channel) => channel.id === "google_ads");
  if (organicOnly && paid.length > 0) {
    return {
      sourceA: `Constraints: ${input.constraints}`,
      sourceB: `Channels include ${paid.map((channel) => channel.label).join(", ")}`,
      impact: "Paid activation contradicts the constraint on file. Campaign architecture cannot choose both.",
      requiredDecision: "Remove the paid channel or change the constraint. This desk will not average the two.",
    };
  }
  return null;
}

export function buildPlan(videoRequested: boolean) {
  const plan = [
    "orchestrator",
    "client_intelligence",
    "market_intelligence",
    "brand_studio",
    "market_strategy",
    "campaign_architect",
    "content_studio",
  ];
  if (videoRequested) plan.push("video_creative");
  plan.push(
    "APPROVAL_GATE",
    "campaign_operations",
    "account_integration",
    "campaign_intelligence",
    "growth_optimization",
  );
  return plan;
}

export function funnelStages(funnel: string, count: number) {
  const parts = funnel
    .split(/\s*(?:→|->|>|,|\||\/)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return Array.from({ length: count }, () => "UNKNOWN");
  return Array.from({ length: count }, (_, index) => parts[Math.min(index, parts.length - 1)]);
}

export function buildWorkContext(input: {
  projectId: string;
  projectName: string;
  businessName: string;
  industry?: string | null;
  audience?: string | null;
  geography?: string | null;
  goals?: string | null;
  offers?: string | null;
  budget?: string | null;
  constraints?: string | null;
  website?: string | null;
  notes?: string | null;
  primaryCta?: string | null;
  funnel?: string | null;
  channels?: string | null;
  requestText: string;
  integrations: { provider: string; label: string; status: string }[];
  metrics: { name: string; value: string; note: string; source: string }[];
  approvals: { status: string; note: string }[];
  mode: "GENERATE" | "PATCH";
  revisionNote?: string;
  handoff: WorkContext["handoff"];
  priorAssets: WorkContext["priorAssets"];
}): WorkContext {
  const channelsField = blank(input.channels);
  const requestText = blank(input.requestText);
  const detected = detectChannels(channelsField, requestText);
  const constraints = blank(input.constraints);
  return {
    projectId: input.projectId,
    projectName: input.projectName,
    businessName: blank(input.businessName),
    industry: blank(input.industry),
    audience: blank(input.audience),
    geography: blank(input.geography),
    goals: blank(input.goals),
    offers: blank(input.offers),
    budget: blank(input.budget),
    constraints,
    website: blank(input.website),
    notes: blank(input.notes),
    primaryCta: blank(input.primaryCta),
    funnel: blank(input.funnel),
    channelsField,
    requestText,
    channels: detected.channels,
    channelSource: detected.channelSource,
    videoRequested: videoInScope(requestText, detected.channels),
    volumePerChannel: volumeFromRequest(requestText),
    organicOnly: /\borganic only\b|\bno paid\b|\bno ads\b/i.test(constraints),
    conflict: detectConflict({ constraints, channels: detected.channels }),
    integrations: input.integrations,
    metrics: input.metrics,
    approvals: input.approvals,
    mode: input.mode,
    revisionNote: blank(input.revisionNote),
    handoff: input.handoff,
    priorAssets: input.priorAssets,
  };
}
