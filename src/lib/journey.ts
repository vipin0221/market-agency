import type { ProjectState } from "./state";

export type HumanStatus = "done" | "working" | "waiting" | "blocked" | "later" | "optional";

export const HUMAN_LABEL: Record<HumanStatus, string> = {
  done: "Done",
  working: "Working",
  waiting: "Waiting on you",
  blocked: "Blocked",
  later: "Up next",
  optional: "Optional",
};

export type StageId = "brand" | "research" | "strategy" | "content" | "review" | "connect" | "campaigns" | "reports";

export type JourneyStage = {
  id: StageId;
  label: string;
  summary: string;
  status: HumanStatus;
  href: string;
  optional?: boolean;
};

export type NextAction = {
  title: string;
  detail: string;
  href: string;
  cta: string;
  status: HumanStatus;
};

export type Excerpt = {
  label: string;
  text: string;
};

type Agent = ProjectState["agents"][number];
type Output = ProjectState["outputs"][number];

export function workflowLabel(status: string, outcome: string): { status: HumanStatus; label: string } {
  if (!status) return { status: "later", label: "Not started" };
  if (status === "QUEUED" || status === "RUNNING") return { status: "working", label: "Working" };
  if (status === "AWAITING_APPROVAL") return { status: "waiting", label: "Waiting on you" };
  if (status === "HOLD") return { status: "waiting", label: "On hold" };
  if (status === "FAILED" || status === "CONFLICT") return { status: "blocked", label: "Blocked" };
  if (outcome === "ACTIVATION_BLOCKED") return { status: "done", label: "Approved" };
  if (status === "BLOCKED") return { status: "blocked", label: "Blocked" };
  if (status === "COMPLETED") return { status: "done", label: "Done" };
  return { status: "working", label: "Working" };
}

export function assetStatus(status: string): { status: HumanStatus; label: string } {
  if (status === "APPROVED") return { status: "done", label: "Done" };
  if (status === "READY_FOR_HUMAN_REVIEW" || status === "PENDING") return { status: "waiting", label: "Waiting on you" };
  if (status === "HOLD") return { status: "waiting", label: "On hold" };
  if (status === "REVISION_REQUESTED") return { status: "waiting", label: "Revision asked" };
  if (status === "FAILED" || status === "BLOCKED") return { status: "blocked", label: "Blocked" };
  if (status === "RUNNING" || status === "QUEUED") return { status: "working", label: "Working" };
  return { status: "later", label: "Planned" };
}

export function decisionLabel(status: string) {
  if (status === "APPROVED") return "Approved";
  if (status === "HOLD") return "On hold";
  if (status === "REVISION_REQUESTED") return "Revision asked";
  if (status === "PENDING" || status === "AWAITING_APPROVAL") return "Waiting on you";
  if (status === "IDLE" || status === "WAITING") return "Up next";
  return status.replaceAll("_", " ");
}

export function showFollowUpRequest(state: ProjectState) {
  const status = state.workflow?.status;
  if (!status) return true;
  return status !== "QUEUED" && status !== "RUNNING" && status !== "AWAITING_APPROVAL";
}

export function buildJourney(state: ProjectState): JourneyStage[] {
  const projectId = state.project.id;
  const link = (path: string) => `/projects/${projectId}${path}`;
  const posts = currentPosts(state);

  const brandAgents = statusesFor(state, ["client_intelligence", "brand_studio"]);
  const researchAgents = statusesFor(state, ["market_intelligence"]);
  const strategyAgents = statusesFor(state, ["market_strategy"]);
  const contentAgents = statusesFor(state, ["content_studio", "video_creative"]);
  const architect = agent(state, "campaign_architect");
  const integration = agent(state, "account_integration");
  const intelligence = agent(state, "campaign_intelligence");

  const stages: JourneyStage[] = [
    {
      id: "brand",
      label: "Brand",
      status: stageStatus(brandAgents),
      summary: brandSummary(state, stageStatus(brandAgents)),
      href: link("/journey#brand"),
    },
    {
      id: "research",
      label: "Research",
      status: stageStatus(researchAgents),
      summary: researchSummary(state, stageStatus(researchAgents)),
      href: link("/journey#research"),
    },
    {
      id: "strategy",
      label: "Strategy",
      status: stageStatus(strategyAgents),
      summary: strategySummary(state, stageStatus(strategyAgents)),
      href: link("/journey#strategy"),
    },
    {
      id: "content",
      label: "Content",
      status: stageStatus(contentAgents),
      summary: contentSummary(state, stageStatus(contentAgents), posts.length),
      href: link("/content"),
    },
    {
      id: "review",
      label: "Review",
      status: reviewStatus(state),
      summary: reviewSummary(state),
      href: link("/review"),
    },
    {
      id: "connect",
      label: "Connect",
      status: connectStatus(integration?.status ?? "SKIPPED", state.counts.connectedIntegrations),
      summary: connectSummary(integration?.status ?? "SKIPPED", state.counts.connectedIntegrations),
      href: link("/connect"),
    },
    {
      id: "campaigns",
      label: "Campaigns",
      status: campaignStatus(state, architect),
      summary: campaignSummary(state, architect),
      href: link("/campaigns"),
      optional: true,
    },
    {
      id: "reports",
      label: "Reports",
      status: reportsStatus(intelligence?.status ?? "SKIPPED", state.metrics.length),
      summary: reportsSummary(state.metrics.length),
      href: link("/reports"),
    },
  ];

  const workflow = state.workflow;
  const halted = workflow?.status === "CONFLICT" || workflow?.status === "FAILED";
  const alreadySignaled = stages.some((stage) => stage.status === "blocked" || stage.status === "working" || stage.status === "waiting");
  if (halted && workflow && !alreadySignaled) {
    stages[0].status = "blocked";
    stages[0].summary = haltSummary(state);
  }
  return stages;
}

export function focusStage(stages: JourneyStage[]): StageId {
  return (
    stages.find((stage) => stage.status === "waiting")?.id ||
    stages.find((stage) => stage.status === "working")?.id ||
    stages.find((stage) => stage.status === "blocked")?.id ||
    stages.find((stage) => stage.status === "later" || stage.status === "optional")?.id ||
    stages[stages.length - 1]?.id ||
    "brand"
  );
}

export function nextAction(state: ProjectState): NextAction {
  const projectId = state.project.id;
  const link = (path: string) => `/projects/${projectId}${path}`;
  const workflow = state.workflow;
  if (!workflow) {
    return {
      title: "Tell us what to make",
      detail: "A marketing request starts the posts. Nothing is published from it.",
      href: "#request",
      cta: "Write a request",
      status: "waiting",
    };
  }
  if (workflow.status === "QUEUED" || workflow.status === "RUNNING") {
    const revising = workflow.mode === "PATCH" || state.approval.status === "REVISION_REQUESTED";
    return revising
      ? {
          title: "Revising your posts",
          detail: "Your note is in the queue. Review them again when the new drafts are ready.",
          href: link("/journey"),
          cta: "See the journey",
          status: "working",
        }
      : {
          title: "Working on your posts",
          detail: workingDetail(state),
          href: link("/journey"),
          cta: "See the journey",
          status: "working",
        };
  }
  if (workflow.status === "AWAITING_APPROVAL" || state.approval.status === "AWAITING_APPROVAL") {
    return {
      title: "Your posts are ready for review",
      detail: "Approve, ask for a revision, or hold. Leaving the page does not approve them, and nothing publishes.",
      href: link("/review"),
      cta: "Review posts",
      status: "waiting",
    };
  }
  if (workflow.status === "HOLD" || state.approval.status === "HOLD") {
    return {
      title: "This round is on hold",
      detail: "It stays held until you approve, ask for a revision, or start another request.",
      href: link("/review"),
      cta: "Open review",
      status: "waiting",
    };
  }
  if (workflow.status === "CONFLICT") {
    return {
      title: "This round needs a decision",
      detail: haltSummary(state),
      href: link("/journey"),
      cta: "See what stopped",
      status: "blocked",
    };
  }
  if (workflow.status === "FAILED") {
    return {
      title: "This round stopped",
      detail: clean(workflow.blockerSummary || workflow.error) || "A step failed. The journey shows which one.",
      href: link("/journey"),
      cta: "See what stopped",
      status: "blocked",
    };
  }
  if (workflow.outcome === "ACTIVATION_BLOCKED" || (workflow.status === "BLOCKED" && state.approval.status === "APPROVED")) {
    return {
      title: "Posts are approved",
      detail: "They stay drafts. Accounts are not connected, so nothing can publish. A campaign is optional.",
      href: link("/content"),
      cta: "View posts",
      status: "done",
    };
  }
  if (workflow.status === "BLOCKED") {
    return {
      title: "This round needs a look",
      detail: clean(workflow.blockerSummary || workflow.error) || "A step stopped before the posts were ready.",
      href: link("/journey"),
      cta: "See the journey",
      status: "blocked",
    };
  }
  return {
    title: "This round is finished",
    detail: "Read the posts, or ask for another round. Nothing has been published.",
    href: link("/content"),
    cta: "View posts",
    status: "done",
  };
}

export function excerptsFor(state: ProjectState, id: StageId): Excerpt[] {
  if (id === "brand") return brandExcerpts(state);
  if (id === "research") return researchExcerpts(state);
  if (id === "strategy") return strategyExcerpts(state);
  if (id === "content") return contentExcerpts(state);
  if (id === "review") return reviewExcerpts(state);
  if (id === "connect") return connectExcerpts(state);
  if (id === "campaigns") return campaignExcerpts(state);
  return reportExcerpts(state);
}

export function currentPosts(state: ProjectState) {
  const workflowId = state.workflow?.id;
  const scoped = workflowId ? state.contentAssets.filter((asset) => asset.workflowId === workflowId) : state.contentAssets;
  return scoped.filter((asset) => asset.status !== "REVISION_REQUESTED");
}

function stageStatus(statuses: string[]): HumanStatus {
  if (statuses.length === 0) return "later";
  if (statuses.some((status) => status === "BLOCKED" || status === "FAILED" || status === "CONFLICT")) return "blocked";
  if (statuses.some((status) => status === "RUNNING" || status === "QUEUED")) return "working";
  const active = statuses.filter((status) => status !== "SKIPPED");
  if (active.length === 0) return "later";
  if (active.every((status) => status === "COMPLETED")) return "done";
  if (active.some((status) => status === "WAITING")) return "waiting";
  if (active.some((status) => status === "COMPLETED")) return "working";
  return "later";
}

function reviewStatus(state: ProjectState): HumanStatus {
  const approval = state.approval.status;
  const workflow = state.workflow?.status;
  if (approval === "AWAITING_APPROVAL") return "waiting";
  if (approval === "HOLD") return "waiting";
  if (approval === "APPROVED") return "done";
  if (approval === "REVISION_REQUESTED") return workflow === "RUNNING" || workflow === "QUEUED" ? "working" : "waiting";
  return "later";
}

function connectStatus(agentStatus: string, connected: number): HumanStatus {
  if (agentStatus === "RUNNING" || agentStatus === "QUEUED") return "working";
  if (agentStatus === "SKIPPED" || agentStatus === "IDLE" || agentStatus === "WAITING") return "later";
  if (agentStatus === "FAILED" || agentStatus === "CONFLICT" || agentStatus === "BLOCKED") return "blocked";
  if (connected > 0) return "done";
  return "blocked";
}

function campaignStatus(state: ProjectState, architect: Agent | undefined): HumanStatus {
  const status = architect?.status ?? "SKIPPED";
  if (status === "RUNNING" || status === "QUEUED") return "working";
  if (status === "BLOCKED" || status === "FAILED" || status === "CONFLICT") return "blocked";
  if (state.campaigns.length > 0 || status === "COMPLETED") return "done";
  return "optional";
}

function reportsStatus(agentStatus: string, metricCount: number): HumanStatus {
  if (metricCount === 0) return agentStatus === "RUNNING" || agentStatus === "QUEUED" ? "working" : "later";
  if (agentStatus === "FAILED" || agentStatus === "CONFLICT") return "blocked";
  if (agentStatus === "RUNNING" || agentStatus === "QUEUED") return "working";
  return "done";
}

function brandSummary(state: ProjectState, status: HumanStatus) {
  if (status === "blocked") return clean(agent(state, "brand_studio")?.summary || "") || "Brand language was not written.";
  if (status === "working") return "Writing how this brand sounds.";
  if (status === "done") return "Brand language is ready to read.";
  return "Starts from the business you entered.";
}

function researchSummary(state: ProjectState, status: HumanStatus) {
  if (status === "blocked") return clean(agent(state, "market_intelligence")?.summary || "") || "Research stopped.";
  if (status === "working") return "Reading what you already told us.";
  if (status === "done") return "Only what you entered is on file. No outside research was added.";
  return "Research waits until the brand step moves.";
}

function strategySummary(state: ProjectState, status: HumanStatus) {
  if (status === "blocked") return clean(agent(state, "market_strategy")?.summary || "") || "The plan was not written.";
  if (status === "working") return "Shaping the plan for this round.";
  if (status === "done") return "A plan is ready. It does not publish anything.";
  return "The plan comes after research.";
}

function contentSummary(state: ProjectState, status: HumanStatus, count: number) {
  if (status === "blocked") return clean(agent(state, "content_studio")?.summary || "") || "Posts were not written.";
  if (status === "working") return "Drafting the posts.";
  if (count > 0) return `${count} post${count === 1 ? "" : "s"} ready to read.`;
  if (status === "done") return "The content step finished.";
  return "Posts show up here when the draft is written.";
}

function reviewSummary(state: ProjectState) {
  const approval = state.approval.status;
  if (approval === "AWAITING_APPROVAL") return "Needs your decision. Silence is not approval.";
  if (approval === "APPROVED") return "Approved. Publishing did not start.";
  if (approval === "HOLD") return "On hold until you decide again or start another round.";
  if (approval === "REVISION_REQUESTED") return "A revision was asked for.";
  return "Review opens when the posts are ready.";
}

function connectSummary(agentStatus: string, connected: number) {
  if (agentStatus === "RUNNING" || agentStatus === "QUEUED") return "Checking which accounts are on file.";
  if (connected > 0) return `${connected} account${connected === 1 ? "" : "s"} connected.`;
  if (agentStatus === "SKIPPED" || agentStatus === "IDLE" || agentStatus === "WAITING") {
    return "After approval, accounts still stay disconnected until a real sign-in exists.";
  }
  return "Not connected. Nothing can publish until a real sign-in exists.";
}

function campaignSummary(state: ProjectState, architect: Agent | undefined) {
  if (architect?.status === "BLOCKED" || architect?.status === "FAILED" || architect?.status === "CONFLICT") {
    return clean(architect.summary) || "A campaign plan was not written.";
  }
  if (state.campaigns.length > 0) return "Planned, not live. Organic posts do not need a campaign.";
  return "Optional. You can approve organic posts without a campaign.";
}

function reportsSummary(metricCount: number) {
  if (metricCount === 0) return "No results yet. Nothing is imported, and no numbers are invented.";
  return `${metricCount} recorded result${metricCount === 1 ? "" : "s"} on file.`;
}

function workingDetail(state: ProjectState) {
  const stages = buildJourney(state);
  const current = stages.find((stage) => stage.id === focusStage(stages));
  return current?.summary || "The next deliverable is on the way.";
}

function haltSummary(state: ProjectState) {
  const plan = latestOutput(state, "plan");
  const conflict = asRecord(plan?.body.conflict);
  const decision = asString(conflict?.requiredDecision);
  if (decision) return decision;
  return clean(state.workflow?.blockerSummary || state.workflow?.error || "") || "This round stopped before the posts were written.";
}

function brandExcerpts(state: ProjectState): Excerpt[] {
  const items: Excerpt[] = [];
  const brand = latestOutput(state, "brand");
  const positioning = prose(brand?.body.positioning);
  const voice = stringList(brand?.body.voice);
  const offer = prose(brand?.body.valueProposition);
  if (positioning) items.push({ label: "Positioning", text: positioning });
  if (voice.length > 0) items.push({ label: "Voice", text: voice.join(" · ") });
  if (offer && offer !== "UNKNOWN") items.push({ label: "Offer", text: offer });
  const plan = latestOutput(state, "plan");
  const conflict = asRecord(plan?.body.conflict);
  if (conflict) {
    const impact = asString(conflict.impact);
    const decision = asString(conflict.requiredDecision);
    if (impact) items.push({ label: "What disagrees", text: impact });
    if (decision) items.push({ label: "What to change", text: decision });
  }
  if (state.client) {
    pushField(items, "Business", state.client.businessName);
    pushField(items, "Industry", state.client.industry);
    pushField(items, "Geography", state.client.geography);
    pushField(items, "Website", state.client.website);
  }
  return items.slice(0, 8);
}

function researchExcerpts(state: ProjectState): Excerpt[] {
  const items: Excerpt[] = [];
  const output = latestOutput(state, "market_intelligence");
  const findings = Array.isArray(output?.body.findings) ? output.body.findings : [];
  for (const finding of findings) {
    const record = asRecord(finding);
    if (!record) continue;
    const statement = asString(record.statement);
    if (!statement || statement === "UNKNOWN") continue;
    items.push({ label: asString(record.topic) || "Finding", text: statement });
  }
  if (output?.body.externalResearch === "NOT_PERFORMED") {
    items.push({ label: "Outside research", text: "Not added. Competitors, market size, and rankings stay unknown." });
  }
  const gaps = stringList(output?.body.gaps);
  if (gaps.length > 0) items.push({ label: "Still open", text: gaps.join(" ") });
  if (items.length === 0) items.push({ label: "Research", text: "Nothing has been written for this step yet." });
  return items.slice(0, 8);
}

function strategyExcerpts(state: ProjectState): Excerpt[] {
  const items: Excerpt[] = [];
  const output = latestOutput(state, "strategy");
  const objective = prose(output?.body.objective);
  if (objective) items.push({ label: "Goal", text: objective });
  const audience = prose(output?.body.audience);
  if (audience) items.push({ label: "Audience", text: audience });
  const funnel = asRecord(output?.body.funnel);
  const stages = stringList(funnel?.stages);
  if (stages.length > 0) items.push({ label: "Funnel", text: stages.join(" → ") });
  const roles = Array.isArray(output?.body.channelRoles) ? output.body.channelRoles : [];
  const channels = roles
    .map((role) => asString(asRecord(role)?.channel))
    .filter(Boolean);
  if (channels.length > 0) items.push({ label: "Channels", text: channels.join(", ") });
  if (items.length === 0 && state.client) {
    pushField(items, "Goal", state.client.goals);
    pushField(items, "Audience", state.client.audience);
  }
  if (items.length === 0) items.push({ label: "Plan", text: "The plan has not been written yet." });
  return items.slice(0, 8);
}

function contentExcerpts(state: ProjectState): Excerpt[] {
  const posts = currentPosts(state);
  if (posts.length === 0) return [{ label: "Posts", text: "No posts yet." }];
  return posts.slice(0, 4).map((asset) => ({
    label: asset.platform,
    text: asset.hook,
  }));
}

function reviewExcerpts(state: ProjectState): Excerpt[] {
  const items: Excerpt[] = [{ label: "Decision", text: reviewSummary(state) }];
  if (state.approval.note) items.push({ label: "Note", text: state.approval.note });
  return items;
}

function connectExcerpts(state: ProjectState): Excerpt[] {
  if (state.integrations.length === 0) return [{ label: "Accounts", text: "No accounts are on file yet." }];
  return state.integrations.map((integration) => ({
    label: integration.label,
    text: integration.status === "CONNECTED" ? "Connected" : "Not connected",
  }));
}

function campaignExcerpts(state: ProjectState): Excerpt[] {
  if (state.campaigns.length === 0) {
    return [{ label: "Campaigns", text: "No campaign plan yet. Organic posts can still be reviewed without one." }];
  }
  return state.campaigns.slice(0, 4).flatMap((campaign) => [
    { label: campaign.name, text: campaign.objective || "UNKNOWN" },
    { label: "Channels", text: campaign.channels || "UNKNOWN" },
    { label: "Activation", text: "Not activated" },
  ]).slice(0, 8);
}

function reportExcerpts(state: ProjectState): Excerpt[] {
  if (state.metrics.length === 0) {
    return [{ label: "Results", text: "No observed results yet. None will be invented." }];
  }
  return state.metrics.slice(0, 6).map((metric) => ({
    label: metric.name,
    text: metric.value,
  }));
}

function statusesFor(state: ProjectState, keys: string[]) {
  return keys.map((key) => agent(state, key)?.status ?? "SKIPPED");
}

function agent(state: ProjectState, key: string) {
  return state.agents.find((item) => item.key === key);
}

function latestOutput(state: ProjectState, kind: string): Output | undefined {
  const workflowId = state.workflow?.id;
  return state.outputs.find((output) => output.kind === kind && (!workflowId || output.workflowId === workflowId));
}

function pushField(items: Excerpt[], label: string, value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (!text || items.some((item) => item.label === label)) return;
  items.push({ label, text });
}

function clean(summary: string) {
  return summary.replace(/^(BLOCKED|FAILED)\.\s*/i, "").trim();
}

function prose(value: unknown) {
  if (typeof value === "string") return value.trim();
  const record = asRecord(value);
  return record ? asString(record.text) : "";
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
