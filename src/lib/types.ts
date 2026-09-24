export type ChannelRef = {
  id: string;
  label: string;
  source: "CLIENT_CONFIRMED" | "INFERRED_FROM_REQUEST";
};

export type Conflict = {
  sourceA: string;
  sourceB: string;
  impact: string;
  requiredDecision: string;
};

export type HandoffOutput = {
  kind: string;
  agentKey: string;
  status: string;
  summary: string;
  generationMode: string;
  body: Record<string, unknown>;
};

export type WorkContext = {
  projectId: string;
  projectName: string;
  businessName: string;
  industry: string;
  audience: string;
  geography: string;
  goals: string;
  offers: string;
  budget: string;
  constraints: string;
  website: string;
  notes: string;
  primaryCta: string;
  funnel: string;
  channelsField: string;
  requestText: string;
  channels: ChannelRef[];
  channelSource: string;
  videoRequested: boolean;
  volumePerChannel: number;
  organicOnly: boolean;
  conflict: Conflict | null;
  integrations: { provider: string; label: string; status: string }[];
  metrics: { name: string; value: string; note: string; source: string }[];
  approvals: { status: string; note: string }[];
  mode: "GENERATE" | "PATCH";
  revisionNote: string;
  handoff: HandoffOutput[];
  priorAssets: { platform: string; hook: string; caption: string; cta: string; status: string }[];
};

export type ContentDraft = {
  platform: string;
  channelSource: string;
  funnelStage: string;
  angle: string;
  hook: string;
  headline: string;
  caption: string;
  cta: string;
  ctaSource: string;
  format: string;
  claimsNote: string;
  generationMode: string;
  status: string;
  body: Record<string, unknown>;
};

export type SpecialistResult = {
  runStatus: "COMPLETED" | "BLOCKED" | "FAILED" | "CONFLICT" | "SKIPPED";
  continuePipeline: boolean;
  summary: string;
  qa: "PASS" | "FLAG" | "FAIL" | null;
  error?: string;
  output?: {
    kind: string;
    title: string;
    status: string;
    summary: string;
    generationMode: "LLM" | "GENERATED_WITHOUT_LLM" | "NOT_GENERATED";
    body: Record<string, unknown>;
  };
  campaigns?: {
    name: string;
    objective: string;
    channels: string;
    status: string;
    body: Record<string, unknown>;
  }[];
  contentAssets?: ContentDraft[];
  creativeAssets?: {
    kind: string;
    title: string;
    status: string;
    generationMode: string;
    body: Record<string, unknown>;
  }[];
  campaignStatusUpdate?: string;
};

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
