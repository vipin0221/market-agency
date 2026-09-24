import { AGENTS, agentByKey } from "./catalog";
import { corpusFrom, findUnsourcedClaims } from "./claims";
import { funnelStages } from "./planning";
import type { ContentDraft, SpecialistResult, WorkContext } from "./types";

const ANGLES = [
  {
    id: "introduce",
    label: "Introduction",
    hook: (ctx: WorkContext) =>
      ctx.geography ? `${ctx.businessName} · ${ctx.geography}` : ctx.businessName,
  },
  {
    id: "offer",
    label: "Offer",
    hook: (ctx: WorkContext) => ctx.offers || `${ctx.businessName} — offer not on file`,
  },
  {
    id: "start",
    label: "Next step",
    hook: (ctx: WorkContext) =>
      ctx.primaryCta ? ctx.primaryCta : `Next step for ${ctx.businessName} is not approved yet`,
  },
  {
    id: "limits",
    label: "Claim limits",
    hook: () => "No rankings, awards, or results are claimed",
  },
];

export function runDeterministic(agentKey: string, ctx: WorkContext): SpecialistResult {
  switch (agentKey) {
    case "orchestrator":
      return orchestrator(ctx);
    case "client_intelligence":
      return clientIntelligence(ctx);
    case "market_intelligence":
      return marketIntelligence(ctx);
    case "brand_studio":
      return brandStudio(ctx);
    case "market_strategy":
      return marketStrategy(ctx);
    case "campaign_architect":
      return campaignArchitect(ctx);
    case "content_studio":
      return contentStudio(ctx, "GENERATED_WITHOUT_LLM");
    case "video_creative":
      return videoCreative(ctx, "GENERATED_WITHOUT_LLM");
    case "campaign_operations":
      return campaignOperations(ctx);
    case "account_integration":
      return accountIntegration(ctx);
    case "campaign_intelligence":
      return campaignIntelligence(ctx);
    case "growth_optimization":
      return growthOptimization(ctx);
    default:
      return {
        runStatus: "FAILED",
        continuePipeline: false,
        summary: `Unknown agent ${agentKey}.`,
        qa: "FAIL",
        error: `Unknown agent ${agentKey}.`,
      };
  }
}

function orchestrator(ctx: WorkContext): SpecialistResult {
  if (!ctx.businessName) {
    return blocked(
      "plan",
      "Orchestrator plan",
      "BLOCKED. Business name is missing, so no specialist can start.",
      { missing: ["businessName"] },
    );
  }
  if (ctx.conflict) {
    return {
      runStatus: "CONFLICT",
      continuePipeline: false,
      summary: "CONFLICT between constraints and channels. Downstream agents were not started.",
      qa: "FAIL",
      output: {
        kind: "plan",
        title: "Orchestrator plan",
        status: "CONFLICT",
        summary: "Sources disagree. No specialist work was invented to paper over it.",
        generationMode: "NOT_GENERATED",
        body: {
          project: ctx.projectName,
          conflict: ctx.conflict,
          pipeline: "STOPPED",
        },
      },
    };
  }
  const videoReason = ctx.videoRequested
    ? "Video Creative is in the plan because the request or a selected channel needs picture-led creative."
    : "Video Creative is out of scope. Neither the request nor the channels ask for video.";
  const steps = [
    "Client Intelligence structures the fields on this project.",
    "Market Intelligence may only restate those fields. No external statistics will be invented.",
    "Brand Studio and Market Strategy draft proposals for human review.",
    "Campaign Architect locks channel scope and volume before any copy is written.",
    "Content Studio writes the posts, then the workflow waits. Silence is not approval.",
    videoReason,
    "Campaign Operations, integrations, intelligence, and growth run only after a recorded decision, and they still cannot publish.",
  ];
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `Plan ready for ${ctx.projectName}. ${ctx.channels.length} channel${ctx.channels.length === 1 ? "" : "s"} in scope.`,
    qa: ctx.channels.length === 0 ? "FLAG" : "PASS",
    output: {
      kind: "plan",
      title: "Orchestrator plan",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: `Pipeline planned from the request. ${videoReason}`,
      generationMode: "NOT_GENERATED",
      body: {
        request: ctx.requestText,
        channels: ctx.channels,
        channelSource: ctx.channelSource,
        volumePerChannel: ctx.volumePerChannel,
        videoIncluded: ctx.videoRequested,
        agents: AGENTS.map((agent) => agent.name),
        steps,
        approvalRule: "Human approval is a control layer. No agent may approve its own work.",
      },
    },
  };
}

function clientIntelligence(ctx: WorkContext): SpecialistResult {
  const facts = [
    fact("Business name", ctx.businessName),
    fact("Industry", ctx.industry),
    fact("Audience", ctx.audience),
    fact("Geography", ctx.geography),
    fact("Goals", ctx.goals),
    fact("Offers", ctx.offers),
    fact("Budget", ctx.budget),
    fact("Constraints", ctx.constraints),
    fact("Website", ctx.website),
    fact("Primary CTA", ctx.primaryCta),
    fact("Funnel", ctx.funnel),
    fact("Channels field", ctx.channelsField),
  ];
  const unknowns = facts.filter((item) => item.source === "UNKNOWN").map((item) => item.field);
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `Client package recorded for ${ctx.businessName}. ${unknowns.length} field${unknowns.length === 1 ? "" : "s"} left UNKNOWN.`,
    qa: unknowns.length > 4 ? "FLAG" : "PASS",
    output: {
      kind: "client_intelligence",
      title: "Client Intelligence Package",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Facts are tagged from the project form. Empty fields stayed UNKNOWN.",
      generationMode: "NOT_GENERATED",
      body: {
        business: ctx.businessName,
        request: ctx.requestText,
        facts,
        channels: ctx.channels,
        channelSource: ctx.channelSource,
        unknowns,
        conflicts: ctx.conflict ? [ctx.conflict] : [],
        questions: unknowns.slice(0, 5).map((field) => `Confirm ${field} before it is used as a claim.`),
        readiness: {
          downstream: ctx.businessName ? "READY_WITH_UNKNOWNS" : "BLOCKED",
          note: "This package does not approve brand, strategy, or content.",
        },
      },
    },
  };
}

function marketIntelligence(ctx: WorkContext): SpecialistResult {
  const findings = [
    observed("Business", ctx.businessName),
    observed("Industry", ctx.industry),
    observed("Audience", ctx.audience),
    observed("Geography", ctx.geography),
    observed("Offer", ctx.offers),
  ].filter((item) => item.statement !== "UNKNOWN");
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: "External research was not performed. No market size, rank, or competitor was invented.",
    qa: "FLAG",
    output: {
      kind: "market_intelligence",
      title: "Market Intelligence Pack",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Evidence ledger contains client-confirmed fields only.",
      generationMode: "NOT_GENERATED",
      body: {
        externalResearch: "NOT_PERFORMED",
        reason: llmStatusReason(),
        findings,
        competitors: "UNKNOWN",
        marketSize: "UNKNOWN",
        rankings: "UNKNOWN",
        confidence: "LOW",
        gaps: [
          "No web research connector is available in Phase 1.",
          "Competitor set is UNKNOWN until a human or a sourced research pass adds it.",
        ],
      },
    },
  };
}

function brandStudio(ctx: WorkContext): SpecialistResult {
  const who = ctx.audience || "the audience on file (UNKNOWN)";
  const offer = ctx.offers || "the offer on file (UNKNOWN)";
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `Proposed brand language for ${ctx.businessName}. Nothing here is locked.`,
    qa: ctx.offers && ctx.audience ? "PASS" : "FLAG",
    output: {
      kind: "brand",
      title: "Brand Pack",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Positioning is proposed from client fields and is not an approved lock.",
      generationMode: llmMode(ctx),
      body: {
        positioning: {
          text: `${ctx.businessName} is described as serving ${who} with ${offer}.`,
          source: "PROPOSED_FROM_CLIENT_FIELDS",
        },
        personality: "Clear, specific, and limited to confirmed facts.",
        voice: ["Plain language", "No unverified superlatives", "Name the offer as it was written"],
        valueProposition: ctx.offers || "UNKNOWN",
        differentiation: "UNKNOWN — no comparative proof is on file.",
        visualDirection: visualDirection(ctx.notes),
        tagline: "UNKNOWN",
        claims: {
          allowed: confirmedClaimSeeds(ctx),
          forbidden: ["Unsourced statistics", "Awards", "Rankings", "Testimonials not on file", "Guarantees"],
        },
        state: "PROPOSED",
      },
    },
  };
}

function marketStrategy(ctx: WorkContext): SpecialistResult {
  const objective = ctx.goals || "UNKNOWN";
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: "Strategy drafted. Channels are conditional and not activated.",
    qa: ctx.goals ? "PASS" : "FLAG",
    output: {
      kind: "strategy",
      title: "Market Strategy Pack",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Objective, funnel, and channel roles come from this project only.",
      generationMode: llmMode(ctx),
      body: {
        objective,
        audience: ctx.audience || "UNKNOWN",
        offer: ctx.offers || "UNKNOWN",
        funnel: ctx.funnel
          ? { stages: funnelStages(ctx.funnel, Math.max(ctx.funnel.split(/→|->|>|,/).length, 1)), source: "CLIENT_CONFIRMED" }
          : { stages: ["UNKNOWN"], source: "UNKNOWN" },
        channelRoles: ctx.channels.map((channel) => ({
          channel: channel.label,
          source: channel.source,
          role: "In the requested scope",
          status: "CONDITIONAL_NOT_ACTIVATED",
        })),
        kpis: [
          {
            name: ctx.goals ? "Progress against the goal on file" : "UNKNOWN",
            target: "UNKNOWN",
            note: "No numeric target was entered. None was invented.",
          },
        ],
        constraints: ctx.constraints || "UNKNOWN",
        budget: ctx.budget || "UNKNOWN",
        activation: "NOT_ACTIVATED",
      },
    },
  };
}

function campaignArchitect(ctx: WorkContext): SpecialistResult {
  if (ctx.channels.length === 0) {
    return blocked(
      "architecture",
      "Campaign architecture",
      "BLOCKED. Channel scope is UNKNOWN. Content Studio will not guess platforms.",
      {
        missing: ["channels"],
        requiredDecision: "Name the channels for this request, then submit again.",
      },
    );
  }
  const name = `${ctx.businessName} — ${trim(ctx.goals || ctx.requestText, 72)}`;
  const stages = funnelStages(ctx.funnel, ctx.volumePerChannel);
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `Architecture sets ${ctx.channels.length} channel${ctx.channels.length === 1 ? "" : "s"} at ${ctx.volumePerChannel} asset${ctx.volumePerChannel === 1 ? "" : "s"} each.`,
    qa: "PASS",
    campaigns: [
      {
        name,
        objective: ctx.goals || "UNKNOWN",
        channels: ctx.channels.map((channel) => channel.label).join(", "),
        status: "NOT_ACTIVATED",
        body: {
          volumePerChannel: ctx.volumePerChannel,
          cta: ctx.primaryCta || "UNKNOWN",
          funnel: stages,
          activation: "NOT_ACTIVATED",
          planningOnly: true,
        },
      },
    ],
    output: {
      kind: "architecture",
      title: "Campaign architecture",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Volume and channels are explicit. The campaign is not activated.",
      generationMode: llmMode(ctx),
      body: {
        campaign: name,
        objective: ctx.goals || "UNKNOWN",
        channels: ctx.channels,
        volumePerChannel: ctx.volumePerChannel,
        funnelStages: stages,
        cta: ctx.primaryCta || "UNKNOWN",
        ctaSource: ctx.primaryCta ? "CLIENT_CONFIRMED" : "UNKNOWN",
        measurement: "Primary KPI target is UNKNOWN until observed data or a confirmed target exists.",
        activation: "NOT_ACTIVATED",
      },
    },
  };
}

export function contentStudio(ctx: WorkContext, generationMode: "LLM" | "GENERATED_WITHOUT_LLM", provided?: ContentDraft[]): SpecialistResult {
  const architecture = ctx.handoff.find((item) => item.kind === "architecture");
  if (!architecture || architecture.status === "BLOCKED") {
    return blocked(
      "content_pack",
      "Content pack",
      "BLOCKED. Campaign architecture is missing, so no posts were written.",
      { missing: ["campaign architecture"] },
    );
  }
  if (ctx.channels.length === 0) {
    return blocked(
      "content_pack",
      "Content pack",
      "BLOCKED. No channel was confirmed for this project.",
      { missing: ["channels"] },
    );
  }
  const drafts = (provided ?? draftPosts(ctx, generationMode)).filter((draft) =>
    ctx.channels.some(
      (channel) =>
        channel.label.toLowerCase() === draft.platform.toLowerCase() ||
        channel.id === draft.platform.toLowerCase(),
    ),
  );
  if (drafts.length === 0) {
    return blocked(
      "content_pack",
      "Content pack",
      "BLOCKED. No post matched the approved channel scope.",
      { channels: ctx.channels.map((channel) => channel.label) },
    );
  }
  if (drafts.some((draft) => !draft.hook.trim() || !draft.caption.trim())) {
    return {
      runStatus: "FAILED",
      continuePipeline: false,
      summary: "FAILED. A post was missing a hook or caption.",
      qa: "FAIL",
      error: "Content objects require hook and caption.",
      output: {
        kind: "content_pack",
        title: "Content pack",
        status: "FAILED",
        summary: "Incomplete posts were not saved as ready.",
        generationMode,
        body: { missing: ["hook or caption"] },
      },
    };
  }
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
  const violations = drafts.flatMap((draft) =>
    findUnsourcedClaims(`${draft.hook}\n${draft.caption}\n${draft.headline}\n${draft.cta}`, corpus).map(
      (claim) => `${draft.platform}: ${claim}`,
    ),
  );
  if (violations.length > 0) {
    return {
      runStatus: "FAILED",
      continuePipeline: false,
      summary: "FAILED. Copy introduced claims that are not in the project record.",
      qa: "FAIL",
      error: `Unsourced claims: ${violations.join("; ")}`,
      output: {
        kind: "content_pack",
        title: "Content pack",
        status: "FAILED",
        summary: "Posts were refused because they added claims the project does not confirm.",
        generationMode,
        body: { violations },
      },
    };
  }
  const patched = ctx.mode === "PATCH" ? drafts.map((draft) => applyRevision(draft, ctx)) : drafts;
  const revisionViolations =
    ctx.mode === "PATCH"
      ? findUnsourcedClaims(ctx.revisionNote, corpus).filter((claim) =>
          /%|award|guarantee|best in|market leader|testimonial/i.test(claim),
        )
      : [];
  if (revisionViolations.length > 0) {
    return {
      runStatus: "BLOCKED",
      continuePipeline: false,
      summary: "BLOCKED. The revision asks for a claim that is not confirmed on this project.",
      qa: "FAIL",
      error: `Revision refused: ${revisionViolations.join(", ")}`,
      output: {
        kind: "content_pack",
        title: "Content revision",
        status: "BLOCKED",
        summary: "The previous drafts were left unchanged.",
        generationMode,
        body: { revisionNote: ctx.revisionNote, refusedClaims: revisionViolations },
      },
    };
  }
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `${patched.length} content object${patched.length === 1 ? "" : "s"} ready for human review.`,
    qa: patched.every((draft) => draft.ctaSource !== "UNKNOWN") ? "PASS" : "FLAG",
    contentAssets: patched,
    output: {
      kind: "content_pack",
      title: ctx.mode === "PATCH" ? "Content pack (revision)" : "Content pack",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: `${patched.length} posts. Generation: ${generationMode}. Not approved.`,
      generationMode,
      body: {
        count: patched.length,
        channels: ctx.channels.map((channel) => channel.label),
        generationMode,
        approval: "READY_FOR_HUMAN_REVIEW",
        revisionNote: ctx.revisionNote || null,
        rule: "These objects are not published and are not self-approved.",
      },
    },
  };
}

export function videoCreative(ctx: WorkContext, generationMode: "LLM" | "GENERATED_WITHOUT_LLM", storyboard?: Record<string, unknown>): SpecialistResult {
  const sample = ctx.priorAssets[0];
  const hook = sample?.hook || ctx.offers || ctx.businessName;
  const providedShots = Array.isArray(storyboard?.shots) ? storyboard?.shots : null;
  const shots = providedShots ?? [
    {
      frame: 1,
      visual: `Open on a plain title card with the words: ${hook}`,
      audio: "Natural room tone. No licensed music is assumed.",
      onScreenText: hook,
    },
    {
      frame: 2,
      visual: ctx.offers
        ? `Show the offer as written: ${ctx.offers}`
        : "Offer is UNKNOWN. Do not invent a product shot.",
      audio: "Voiceover reads only the offer on file.",
      onScreenText: ctx.offers || "UNKNOWN",
    },
    {
      frame: 3,
      visual: ctx.audience
        ? `Cut to the audience context on file: ${ctx.audience}`
        : "Audience is UNKNOWN. Use no stock people.",
      audio: "No testimonial audio.",
      onScreenText: ctx.geography || ctx.businessName,
    },
    {
      frame: 4,
      visual: ctx.primaryCta ? `End card with the approved CTA: ${ctx.primaryCta}` : "End card marks the CTA as UNKNOWN.",
      audio: "Stop. No invented phone number or discount.",
      onScreenText: ctx.primaryCta || "CTA UNKNOWN",
    },
  ];
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: "Storyboard-only pack. No finished video file was produced.",
    qa: "PASS",
    creativeAssets: [
      {
        kind: "storyboard",
        title: `${ctx.businessName} storyboard`,
        status: "READY_FOR_HUMAN_REVIEW",
        generationMode,
        body: {
          renderStatus: "STORYBOARD_ONLY",
          duration: "UNKNOWN",
          shots,
          editNotes: "Do not add awards, reviews, or prices that are not on the project.",
          sourceHook: hook,
        },
      },
    ],
    output: {
      kind: "video_pack",
      title: "Video creative pack",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Storyboard only. Render status is not a finished film.",
      generationMode,
      body: {
        renderStatus: "STORYBOARD_ONLY",
        shots,
        duration: "UNKNOWN",
      },
    },
  };
}

function campaignOperations(ctx: WorkContext): SpecialistResult {
  const approved = ctx.approvals.some((approval) => approval.status === "APPROVED");
  const connected = ctx.integrations.filter((integration) => integration.status === "CONNECTED");
  if (!approved) {
    return {
      runStatus: "BLOCKED",
      continuePipeline: false,
      summary: "BLOCKED. No recorded human approval. Silence was not treated as approval.",
      qa: "FAIL",
      output: {
        kind: "operations",
        title: "Operations pack",
        status: "BLOCKED",
        summary: "Execution did not start.",
        generationMode: "NOT_GENERATED",
        body: {
          publish: false,
          activation: "NOT_ACTIVATED",
          missing: ["recorded APPROVE decision"],
        },
      },
    };
  }
  const blockers = [
    "Phase 1 cannot publish. Social and ad OAuth are deferred.",
    connected.length === 0 ? "Every integration on this project is NOT_CONNECTED." : "",
  ].filter(Boolean);
  return {
    runStatus: "BLOCKED",
    continuePipeline: true,
    summary: "Execution pack drafted. Activation is BLOCKED. Nothing was published.",
    qa: "FLAG",
    campaignStatusUpdate: "ACTIVATION_BLOCKED",
    output: {
      kind: "operations",
      title: "Operations pack",
      status: "BLOCKED",
      summary: "Checklist is real. Deploy was not requested and would be refused.",
      generationMode: "NOT_GENERATED",
      body: {
        publish: false,
        activation: "NOT_ACTIVATED",
        blockers,
        checklist: [
          { item: "Human approval recorded", ok: true },
          { item: "Content objects exist", ok: ctx.priorAssets.length > 0 },
          { item: "At least one integration CONNECTED", ok: connected.length > 0 },
          { item: "Explicit publish authorization", ok: false },
        ],
      },
    },
  };
}

function accountIntegration(ctx: WorkContext): SpecialistResult {
  const rows = ctx.integrations.map((integration) => ({
    provider: integration.provider,
    label: integration.label,
    status: integration.status,
    blocker: integration.status === "CONNECTED" ? null : "NOT_CONNECTED — OAuth is Phase 2. No credential is stored.",
  }));
  const ready = rows.filter((row) => row.status === "CONNECTED").length;
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `${ready} of ${rows.length} integrations are connected. Default is NOT_CONNECTED.`,
    qa: ready === 0 ? "FLAG" : "PASS",
    output: {
      kind: "integration_report",
      title: "Integration readiness",
      status: ready === rows.length && rows.length > 0 ? "READY_FOR_HUMAN_REVIEW" : "BLOCKED",
      summary: "Statuses were read from the project integration rows. None were flipped to connected.",
      generationMode: "NOT_GENERATED",
      body: {
        rows,
        goLive: "BLOCKED",
        note: "Account & Integration does not invent credentials or mark a provider connected.",
      },
    },
  };
}

function campaignIntelligence(ctx: WorkContext): SpecialistResult {
  if (ctx.metrics.length === 0) {
    return {
      runStatus: "BLOCKED",
      continuePipeline: true,
      summary: "BLOCKED. No observed metrics. CTR, ROAS, CPA, and revenue were not invented.",
      qa: "FLAG",
      output: {
        kind: "insights",
        title: "Campaign intelligence",
        status: "BLOCKED",
        summary: "Insufficient data. No performance narrative was written.",
        generationMode: "NOT_GENERATED",
        body: {
          observed: [],
          insufficient: true,
          primaryKpi: ctx.goals || "UNKNOWN",
          refused: ["CTR", "ROAS", "CPA", "CPL", "revenue", "conversion rate"],
        },
      },
    };
  }
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `${ctx.metrics.length} observed metric${ctx.metrics.length === 1 ? "" : "s"} recorded. No extra numbers were calculated.`,
    qa: "PASS",
    output: {
      kind: "insights",
      title: "Campaign intelligence",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Insights use only metrics a person entered. Causation is not claimed.",
      generationMode: "NOT_GENERATED",
      body: {
        observed: ctx.metrics,
        insufficient: false,
        causation: "NOT_CLAIMED",
        note: "Values are shown as entered. This agent did not fetch a platform report.",
      },
    },
  };
}

function growthOptimization(ctx: WorkContext): SpecialistResult {
  if (ctx.metrics.length === 0) {
    return {
      runStatus: "BLOCKED",
      continuePipeline: true,
      summary: "BLOCKED. No experiment was designed because there is no observed performance evidence.",
      qa: "FLAG",
      output: {
        kind: "optimization",
        title: "Growth recommendation",
        status: "BLOCKED",
        summary: "Recommendation withheld.",
        generationMode: "NOT_GENERATED",
        body: {
          hypothesis: "UNKNOWN",
          experiment: null,
          autoLaunch: false,
          reason: "Growth Optimization will not invent a test from missing results.",
        },
      },
    };
  }
  const metric = ctx.metrics[0];
  return {
    runStatus: "COMPLETED",
    continuePipeline: true,
    summary: `One experiment hypothesis is ready for review, based on ${metric.name}. It was not launched.`,
    qa: "PASS",
    output: {
      kind: "optimization",
      title: "Growth recommendation",
      status: "READY_FOR_HUMAN_REVIEW",
      summary: "Recommendation only. Strategy was not changed.",
      generationMode: "NOT_GENERATED",
      body: {
        evidence: metric,
        hypothesis: `If the approved message is clearer, ${metric.name} may move. This is not a forecast.`,
        experiment: {
          change: "Revise only the hook on the next approved content object.",
          measurement: `Compare a future observed value of ${metric.name} with the value on file (${metric.value}).`,
          launch: "NOT_LAUNCHED",
        },
        requiredDecision: "A human must approve any experiment before it exists outside this note.",
      },
    },
  };
}

function draftPosts(ctx: WorkContext, generationMode: string): ContentDraft[] {
  const stages = funnelStages(ctx.funnel, ctx.volumePerChannel);
  const angles = ANGLES.slice(0, ctx.volumePerChannel);
  const drafts: ContentDraft[] = [];
  for (const channel of ctx.channels) {
    angles.forEach((angle, index) => {
      const stage = stages[index] || "UNKNOWN";
      const hook = angle.hook(ctx);
      const caption = captionFor(channel.id, angle.id, ctx);
      const cta = ctx.primaryCta || "UNKNOWN";
      drafts.push({
        platform: channel.label,
        channelSource: channel.source,
        funnelStage: stage,
        angle: angle.label,
        hook,
        headline: channel.id === "email" ? subjectLine(ctx, angle.label) : hook,
        caption,
        cta,
        ctaSource: ctx.primaryCta ? "CLIENT_CONFIRMED" : "UNKNOWN",
        format: formatFor(channel.id),
        claimsNote: "Copy uses only fields stored on this project. No statistic was added.",
        generationMode,
        status: "READY_FOR_HUMAN_REVIEW",
        body: {
          platformId: channel.id,
          subject: channel.id === "email" ? subjectLine(ctx, angle.label) : "",
          preheader: channel.id === "email" ? trim(ctx.offers || ctx.businessName, 90) : "",
          spokenHook: channel.id === "tiktok" || channel.id === "youtube" ? hook : "",
        },
      });
    });
  }
  return drafts;
}

function captionFor(platform: string, angle: string, ctx: WorkContext) {
  const lines = [
    sentence(ctx.businessName, ctx.industry, ctx.geography),
    ctx.audience ? `Written for: ${ctx.audience}.` : "Audience: UNKNOWN.",
    ctx.offers ? `Offer on file: ${ctx.offers}.` : "Offer: UNKNOWN.",
    ctx.goals ? `Goal on file: ${ctx.goals}.` : "Goal: UNKNOWN.",
    ctx.constraints ? `Constraint on file: ${ctx.constraints}.` : "",
    angle === "limits" ? "This post does not add awards, rankings, testimonials, or results." : "",
    ctx.website ? `Website on file: ${ctx.website}.` : "",
  ].filter(Boolean);
  let text = lines.join(" ");
  if (platform === "x") text = trim(text, 240);
  if (platform === "tiktok") text = trim(`${ctx.offers || ctx.businessName}. ${ctx.audience || ""}`.trim(), 180);
  if (platform === "google_ads") {
    text = trim(ctx.offers || ctx.businessName, 90);
  }
  return text;
}

function sentence(business: string, industry: string, geography: string) {
  const industryBit = industry ? ` in ${industry}` : "";
  const geoBit = geography ? `, ${geography}` : "";
  return `${business}${industryBit}${geoBit}.`;
}

function subjectLine(ctx: WorkContext, angle: string) {
  if (angle === "Offer" && ctx.offers) return trim(`${ctx.offers} — ${ctx.businessName}`, 78);
  return trim(`${ctx.businessName}${ctx.geography ? ` · ${ctx.geography}` : ""}`, 78);
}

function formatFor(platform: string) {
  if (platform === "email") return "email";
  if (platform === "google_ads") return "search_ad";
  if (platform === "website") return "landing_section";
  if (platform === "tiktok" || platform === "youtube") return "short_video_caption";
  if (platform === "linkedin") return "linkedin_post";
  return "social_post";
}

function applyRevision(draft: ContentDraft, ctx: WorkContext): ContentDraft {
  const note = ctx.revisionNote.trim();
  if (!note) return draft;
  let next = { ...draft, body: { ...draft.body, revisionNote: note, patchMode: true } };
  const cta = note.match(/\bcta\s*[:=-]\s*(.+)/i);
  if (cta) {
    next.cta = cta[1].trim();
    next.ctaSource = "OPERATOR_DIRECTED";
  }
  const hook = note.match(/\bhook\s*[:=-]\s*(.+)/i);
  if (hook) next.hook = hook[1].trim();
  if (/shorter/i.test(note)) {
    next.caption = next.caption.split(/(?<=\.)\s/)[0] || next.caption;
  } else if (!cta && !hook) {
    next.hook = trim(note.replace(/\.$/, ""), 140);
  }
  next.claimsNote = `${draft.claimsNote} Revision applied from the operator note.`;
  return next;
}

function fact(field: string, value: string) {
  return {
    field,
    value: value || "UNKNOWN",
    source: value ? "CLIENT_CONFIRMED" : "UNKNOWN",
  };
}

function observed(topic: string, value: string) {
  return {
    topic,
    statement: value || "UNKNOWN",
    source: value ? "CLIENT_CONFIRMED" : "UNKNOWN",
    confidence: value ? "STATED_BY_CLIENT" : "NONE",
  };
}

function confirmedClaimSeeds(ctx: WorkContext) {
  return [ctx.businessName, ctx.offers, ctx.geography, ctx.audience, ctx.industry].filter(Boolean);
}

function visualDirection(notes: string) {
  const colors = notes.match(/\b(red|blue|green|black|white|yellow|orange|pink|brown|gold|navy|cream)\b/gi);
  if (!colors) return "UNKNOWN — no visual direction was entered.";
  return `Colors mentioned in project notes: ${[...new Set(colors)].join(", ")}.`;
}

function blocked(kind: string, title: string, summary: string, body: Record<string, unknown>): SpecialistResult {
  return {
    runStatus: "BLOCKED",
    continuePipeline: false,
    summary,
    qa: "FAIL",
    error: summary,
    output: {
      kind,
      title,
      status: "BLOCKED",
      summary,
      generationMode: "NOT_GENERATED",
      body,
    },
  };
}

function llmMode(_ctx: WorkContext): "GENERATED_WITHOUT_LLM" {
  return "GENERATED_WITHOUT_LLM";
}

function llmStatusReason() {
  return "No external source was fetched. Findings below are client-confirmed fields, not market proof.";
}

function trim(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function agentLabel(agentKey: string) {
  return agentByKey(agentKey)?.name ?? agentKey;
}
